import hashlib
import hmac
import os
import uuid
import base64
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import List
import httpx
from sqlalchemy.orm import Session
from app.database import get_db, Payment as PaymentModel, Booking as BookingModel, Equipment as EquipmentModel, Farmer as FarmerModel

router = APIRouter()

class PaymentCreate(BaseModel):
    booking_id: int
    method: str = "paystack"
    mobile_number: str

class Payment(BaseModel):
    id: int
    booking_id: int
    amount: float
    method: str
    mobile_number: str
    reference: str
    status: str

    class Config:
        from_attributes = True


class PaymentCreateResponse(Payment):
    checkout_url: str | None = None


class RetryPaymentResponse(BaseModel):
    reference: str
    status: str
    detail: str
    transfer_error: str | None = None


class SellerNotificationRequest(BaseModel):
    seller_phone: str | None = None
    seller_amount: float | None = None
    message: str | None = None


class SellerNotificationResponse(BaseModel):
    reference: str
    seller_phone: str
    seller_amount: float
    message: str
    sent: bool
    detail: str


def _get_paystack_secret() -> str | None:
    return os.getenv("PAYSTACK_SECRET_KEY")


def _get_transfer_recipient_code() -> str | None:
    # Legacy fallback only; per-farmer recipient codes should be used in production.
    return os.getenv("PAYSTACK_TRANSFER_RECIPIENT_CODE") or os.getenv("PAYSTACK_DEFAULT_TRANSFER_RECIPIENT_CODE")


def _legacy_payout_fallback_enabled() -> bool:
    return os.getenv("ALLOW_LEGACY_GLOBAL_RECIPIENT_FALLBACK", "false").strip().lower() in {"1", "true", "yes", "on"}


def _auto_payout_enabled() -> bool:
    # Manual payout is now the default operational mode.
    return os.getenv("AUTO_PAYOUT_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def _sms_provider() -> str:
    return os.getenv("SMS_PROVIDER", "").strip().lower()


def _normalize_phone_for_ghana(phone: str) -> str:
    digits = "".join(ch for ch in phone if ch.isdigit())
    if digits.startswith("233"):
        return digits
    if digits.startswith("0") and len(digits) >= 10:
        return "233" + digits[1:]
    return digits


async def _send_sms_with_hubtel(phone: str, message: str) -> tuple[bool, str]:
    client_id = os.getenv("HUBTEL_CLIENT_ID", "").strip()
    client_secret = os.getenv("HUBTEL_CLIENT_SECRET", "").strip()
    sender = os.getenv("HUBTEL_SENDER_ID", "AgroShare")
    if not client_id or not client_secret:
        return False, "HUBTEL_CLIENT_ID or HUBTEL_CLIENT_SECRET is not configured"

    recipient = _normalize_phone_for_ghana(phone)
    if recipient.startswith("233"):
        recipient = "+" + recipient

    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
    payload = {
        "From": sender,
        "To": recipient,
        "Content": message,
        "RegisteredDelivery": True,
    }
    headers = {
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post("https://sms-api.hubtel.com/v1/messages/send", json=payload, headers=headers)

    try:
        body = response.json()
    except ValueError:
        body = {}

    if response.status_code >= 400:
        error_message = body.get("Message") or response.text.strip() or f"Hubtel SMS request failed with HTTP {response.status_code}"
        return False, error_message

    if str(body.get("Status", "")).strip() == "0":
        return True, body.get("Message") or "SMS sent"

    error_message = body.get("Message") or "SMS provider did not confirm delivery"
    return False, error_message


async def _send_sms_with_africastalking(phone: str, message: str) -> tuple[bool, str]:
    api_key = os.getenv("AFRICASTALKING_API_KEY", "").strip()
    username = os.getenv("AFRICASTALKING_USERNAME", "sandbox").strip()
    sender_id = os.getenv("AFRICASTALKING_SENDER_ID", "").strip()
    if not api_key:
        return False, "AFRICASTALKING_API_KEY is not configured"

    recipient = _normalize_phone_for_ghana(phone)
    if recipient.startswith("233"):
        recipient = "+" + recipient

    payload = {
        "username": username,
        "message": message,
        "to": recipient,
    }
    if sender_id:
        payload["from"] = sender_id

    headers = {
        "apiKey": api_key,
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post("https://api.africastalking.com/version1/messaging", data=payload, headers=headers)

    try:
        body = response.json()
    except ValueError:
        body = {}

    if response.status_code >= 400:
        error_message = body.get("SMSMessageData", {}).get("Message") or response.text.strip() or f"Africa's Talking SMS request failed with HTTP {response.status_code}"
        return False, error_message

    recipients = body.get("SMSMessageData", {}).get("Recipients") or []
    if recipients:
        first = recipients[0]
        status = str(first.get("status") or "").strip().lower()
        code = int(first.get("statusCode", 0)) if str(first.get("statusCode", "")).isdigit() else 0
        if status == "success" or code == 101:
            return True, body.get("SMSMessageData", {}).get("Message") or "SMS sent"
        return False, first.get("status") or first.get("statusDescription") or "SMS provider did not confirm delivery"

    high_level_message = body.get("SMSMessageData", {}).get("Message") or "No recipient status returned"
    return False, high_level_message


async def send_seller_sms(phone: str, message: str) -> tuple[bool, str]:
    provider = _sms_provider()
    if provider in {"", "none", "disabled", "manual"}:
        return False, "SMS provider is not configured"

    if provider == "hubtel":
        return await _send_sms_with_hubtel(phone, message)

    if provider in {"africastalking", "africas_talking", "at"}:
        return await _send_sms_with_africastalking(phone, message)

    return False, f"Unsupported SMS provider: {provider}"


def _build_checkout_email(mobile_number: str) -> str:
    digits = "".join(ch for ch in mobile_number if ch.isdigit())
    if not digits:
        digits = "customer"
    return f"{digits}@agroshare.gh"


def _resolve_paystack_callback_url() -> str:
    callback_url = os.getenv("PAYSTACK_CALLBACK_URL")
    if callback_url:
        return callback_url
    return "https://agroshare-frontend.onrender.com"


async def initialize_paystack_transaction(
    *,
    amount: float,
    reference: str,
    mobile_number: str,
    booking_id: int,
) -> str:
    secret = _get_paystack_secret()
    environment = os.getenv("ENVIRONMENT", "development").lower()

    if not secret:
        if environment == "production":
            raise HTTPException(status_code=503, detail="PAYSTACK_SECRET_KEY is not configured")
        raise HTTPException(status_code=400, detail="PAYSTACK_SECRET_KEY is missing")

    payload = {
        "email": _build_checkout_email(mobile_number),
        "amount": int(round(amount * 100)),  # Kobo/pesewas
        "currency": "GHS",
        "reference": reference,
        "callback_url": _resolve_paystack_callback_url(),
        "metadata": {
            "booking_id": booking_id,
            "mobile_number": mobile_number,
            "source": "agroshare-payments",
        },
    }

    headers = {
        "Authorization": f"Bearer {secret}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post("https://api.paystack.co/transaction/initialize", json=payload, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to initialize Paystack transaction")

    body = response.json()
    if not body.get("status") or not body.get("data", {}).get("authorization_url"):
        raise HTTPException(status_code=502, detail="Invalid Paystack initialize response")

    return body["data"]["authorization_url"]


async def verify_paystack_transaction(reference: str) -> str | None:
    secret = _get_paystack_secret()
    if not secret:
        return None

    headers = {"Authorization": f"Bearer {secret}"}
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(f"https://api.paystack.co/transaction/verify/{reference}", headers=headers)

    if response.status_code >= 400:
        return None

    body = response.json()
    if not body.get("status"):
        return None
    return str(body.get("data", {}).get("status") or "").lower()


def _resolve_seller_amount(payment: PaymentModel, db: Session) -> float:
    booking = db.query(BookingModel).filter(BookingModel.id == payment.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found for payment")
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == booking.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found for booking")
    return round(float(equipment.price_per_day), 2)


async def attempt_farmer_payout(payment: PaymentModel, db: Session) -> bool:
    booking = db.query(BookingModel).filter(BookingModel.id == payment.booking_id).first()
    if not booking:
        return False

    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == booking.equipment_id).first()
    if not equipment:
        return False

    recipient_code = None
    if equipment.owner_farmer_id:
        owner_farmer = db.query(FarmerModel).filter(FarmerModel.id == equipment.owner_farmer_id).first()
        if owner_farmer and owner_farmer.payout_recipient_code:
            recipient_code = owner_farmer.payout_recipient_code

    if not recipient_code and _legacy_payout_fallback_enabled():
        # Optional fallback for older records; keep disabled in production to avoid misrouting payouts.
        recipient_code = _get_transfer_recipient_code()

    secret = _get_paystack_secret()
    if not recipient_code or not secret:
        return False

    amount = _resolve_seller_amount(payment, db)
    payload = {
        "source": "balance",
        "amount": int(round(amount * 100)),
        "recipient": recipient_code,
        "reason": f"AgroShare payout for {payment.reference}",
        "reference": f"PAYOUT-{payment.reference}",
    }
    headers = {
        "Authorization": f"Bearer {secret}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post("https://api.paystack.co/transfer", json=payload, headers=headers)

    try:
        body = response.json()
    except ValueError:
        body = {}

    if response.status_code >= 400 or not body.get("status"):
        error_message = (
            body.get("message")
            or body.get("data", {}).get("message")
            or body.get("data", {}).get("gateway_response")
            or response.text.strip()
            or f"Paystack transfer failed with HTTP {response.status_code}"
        )
        setattr(payment, "transfer_error", error_message)
        return False

    setattr(payment, "transfer_error", None)
    return True


async def settle_payment_and_payout(payment: PaymentModel, db: Session) -> tuple[str, str | None]:
    # paid: customer charged successfully; released: payout transfer sent successfully
    payment.status = "paid"
    db.commit()
    db.refresh(payment)

    if not _auto_payout_enabled():
        return payment.status, "Auto payout disabled; transfer to seller manually."

    payout_sent = await attempt_farmer_payout(payment, db)
    transfer_error = getattr(payment, "transfer_error", None)
    if payout_sent:
        payment.status = "released"
        db.commit()
        db.refresh(payment)
        transfer_error = None
    return payment.status, transfer_error

@router.post("/", response_model=PaymentCreateResponse)
async def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    booking = db.query(BookingModel).filter(BookingModel.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == booking.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    normalized_method = (payload.method or "paystack").strip().lower()

    # Generate unique reference
    reference = f"ESCROW-{payload.booking_id}-{uuid.uuid4().hex[:10].upper()}"

    PLATFORM_FEE_RATE = 0.20  # 20% added on top in manual payout mode
    seller_amount = round(equipment.price_per_day, 2)
    platform_fee = round(seller_amount * PLATFORM_FEE_RATE, 2)
    amount = round(seller_amount + platform_fee, 2)  # customer pays seller price + 20%

    checkout_url = None
    if normalized_method == "paystack":
        checkout_url = await initialize_paystack_transaction(
            amount=amount,
            reference=reference,
            mobile_number=payload.mobile_number,
            booking_id=payload.booking_id,
        )

    payment = PaymentModel(
        booking_id=payload.booking_id,
        amount=amount,
        method=normalized_method,
        mobile_number=payload.mobile_number,
        reference=reference,
        status="held",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    payment.checkout_url = checkout_url
    return payment

@router.post("/{payment_id}/release", response_model=Payment)
async def release_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status not in {"held", "paid", "released"}:
        raise HTTPException(status_code=400, detail="Payment cannot be released from current status")

    if payment.status == "held":
        await settle_payment_and_payout(payment, db)
    elif payment.status == "paid":
        if not _auto_payout_enabled():
            return payment
        payout_sent = await attempt_farmer_payout(payment, db)
        if payout_sent:
            payment.status = "released"
            db.commit()
            db.refresh(payment)
    return payment


@router.post("/retry/{reference}", response_model=RetryPaymentResponse)
async def retry_payment_by_reference(reference: str, db: Session = Depends(get_db)):
    payment = db.query(PaymentModel).filter(PaymentModel.reference == reference).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment reference not found")

    if payment.status == "released":
        return RetryPaymentResponse(reference=payment.reference, status=payment.status, detail="Payment already released")

    if payment.status == "held" and payment.method == "paystack":
        tx_status = await verify_paystack_transaction(payment.reference)
        if tx_status != "success":
            raise HTTPException(status_code=400, detail="Transaction is not yet successful on Paystack")

    final_status, transfer_error = await settle_payment_and_payout(payment, db)
    detail = "Payout transfer sent successfully" if final_status == "released" else (transfer_error or "Payment verified; seller payout pending manual transfer")
    return RetryPaymentResponse(reference=payment.reference, status=final_status, detail=detail, transfer_error=transfer_error)


@router.post("/{reference}/notify-seller", response_model=SellerNotificationResponse)
async def notify_seller_after_manual_transfer(reference: str, payload: SellerNotificationRequest, db: Session = Depends(get_db)):
    payment = db.query(PaymentModel).filter(PaymentModel.reference == reference).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment reference not found")

    booking = db.query(BookingModel).filter(BookingModel.id == payment.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found for payment")

    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == booking.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found for booking")

    seller_phone = (payload.seller_phone or "").strip()
    if not seller_phone and equipment.owner_farmer_id:
        owner_farmer = db.query(FarmerModel).filter(FarmerModel.id == equipment.owner_farmer_id).first()
        if owner_farmer and owner_farmer.phone:
            seller_phone = owner_farmer.phone.strip()

    if not seller_phone:
        raise HTTPException(status_code=400, detail="Seller phone not found. Provide seller_phone in request body.")

    seller_amount = round(float(payload.seller_amount if payload.seller_amount is not None else equipment.price_per_day), 2)
    default_message = f"You have received a payment of GHS {seller_amount:.2f} from agrosharaga.com."
    message = (payload.message or default_message).strip()

    sent, sms_detail = await send_seller_sms(seller_phone, message)
    detail = "SMS sent to seller successfully." if sent else f"SMS not sent automatically: {sms_detail}. Send this message manually to the seller phone."

    return SellerNotificationResponse(
        reference=payment.reference,
        seller_phone=seller_phone,
        seller_amount=seller_amount,
        message=message,
        sent=sent,
        detail=detail,
    )

class PaymentWebhook(BaseModel):
    event: str
    data: dict


def verify_paystack_signature(raw_body: bytes, signature: str | None) -> None:
    environment = os.getenv("ENVIRONMENT", "development").lower()
    configured_secrets = [
        os.getenv("PAYSTACK_WEBHOOK_SECRET"),
        os.getenv("PAYSTACK_SECRET_KEY"),
    ]
    secrets = [value for value in configured_secrets if value]

    if not secrets:
        if environment == "production":
            raise HTTPException(status_code=503, detail="Paystack webhook secret is not configured")
        return

    if not signature:
        raise HTTPException(status_code=400, detail="Missing Paystack signature")

    valid_signature = False
    for secret in secrets:
        expected_signature = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha512).hexdigest()
        if hmac.compare_digest(expected_signature, signature):
            valid_signature = True
            break

    if not valid_signature:
        raise HTTPException(status_code=400, detail="Invalid Paystack signature")

@router.post("/webhook")
async def paystack_webhook(
    request: Request,
    payload: PaymentWebhook,
    x_paystack_signature: str | None = Header(default=None, alias="x-paystack-signature"),
    db: Session = Depends(get_db),
):
    raw_body = await request.body()
    verify_paystack_signature(raw_body, x_paystack_signature)

    reference = payload.data.get("reference")
    status = payload.data.get("status")
    if not reference or not status:
        raise HTTPException(status_code=400, detail="Missing webhook payload fields")

    payment = db.query(PaymentModel).filter(PaymentModel.reference == reference).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if status.lower() == "success":
        await settle_payment_and_payout(payment, db)

    return {"reference": reference, "status": payment.status}

@router.get("/", response_model=List[Payment])
def list_payments(db: Session = Depends(get_db)):
    return db.query(PaymentModel).all()
