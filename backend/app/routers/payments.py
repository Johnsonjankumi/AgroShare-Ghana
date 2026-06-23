import hashlib
import hmac
import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import List
import httpx
from sqlalchemy.orm import Session
from app.database import get_db, Payment as PaymentModel, Booking as BookingModel, Equipment as EquipmentModel

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


def _get_paystack_secret() -> str | None:
    return os.getenv("PAYSTACK_SECRET_KEY")


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

    PLATFORM_FEE_RATE = 0.10  # 10% added on top — seller gets full posted price
    seller_amount = round(equipment.price_per_day, 2)
    platform_fee = round(seller_amount * PLATFORM_FEE_RATE, 2)
    amount = round(seller_amount + platform_fee, 2)  # customer pays seller price + 10%

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
def release_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status != "held":
        raise HTTPException(status_code=400, detail="Payment is not held in escrow")
    
    payment.status = "released"
    db.commit()
    db.refresh(payment)
    return payment

class PaymentWebhook(BaseModel):
    event: str
    data: dict


def verify_paystack_signature(raw_body: bytes, signature: str | None) -> None:
    environment = os.getenv("ENVIRONMENT", "development").lower()
    secret = os.getenv("PAYSTACK_WEBHOOK_SECRET") or os.getenv("PAYSTACK_SECRET_KEY")

    if not secret:
        if environment == "production":
            raise HTTPException(status_code=503, detail="Paystack webhook secret is not configured")
        return

    if not signature:
        raise HTTPException(status_code=400, detail="Missing Paystack signature")

    expected_signature = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(expected_signature, signature):
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
        payment.status = "released"
        db.commit()
        db.refresh(payment)

    return {"reference": reference, "status": payment.status}

@router.get("/", response_model=List[Payment])
def list_payments(db: Session = Depends(get_db)):
    return db.query(PaymentModel).all()
