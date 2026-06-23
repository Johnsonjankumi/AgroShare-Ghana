import hashlib
import hmac
import os
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import List
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

@router.post("/", response_model=Payment)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    booking = db.query(BookingModel).filter(BookingModel.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == booking.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # Generate unique reference
    last_payment = db.query(PaymentModel).order_by(PaymentModel.id.desc()).first()
    next_id = (last_payment.id + 1) if last_payment else 1
    
    PLATFORM_FEE_RATE = 0.10  # 10% added on top — seller gets full posted price
    seller_amount = round(equipment.price_per_day, 2)
    platform_fee = round(seller_amount * PLATFORM_FEE_RATE, 2)
    amount = round(seller_amount + platform_fee, 2)  # customer pays seller price + 10%
    reference = f"ESCROW-{next_id}-{payload.booking_id}"

    payment = PaymentModel(
        booking_id=payload.booking_id,
        amount=amount,
        method=payload.method,
        mobile_number=payload.mobile_number,
        reference=reference,
        status="held",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
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
