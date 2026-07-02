from datetime import datetime
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
import httpx

from app.database import (
    get_db,
    Subscription as SubscriptionModel,
    Farmer as FarmerModel,
    Payment as PaymentModel,
)

router = APIRouter()

LISTING_FEE_GHS = 200.0


class SubscriptionCreate(BaseModel):
    farmer_id: int
    plan: str  # monthly or yearly
    mobile_number: str


class Subscription(BaseModel):
    id: int
    farmer_id: int
    plan: str
    amount: float
    currency: str
    mobile_number: str
    reference: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionCreateResponse(Subscription):
    checkout_url: str | None = None


class VerifySubscriptionResponse(BaseModel):
    reference: str
    status: str
    detail: str


class OwnerActivityItem(BaseModel):
    type: str  # subscription or payment
    reference: str
    amount: float
    status: str
    created_at: datetime
    meta: dict


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


async def initialize_subscription_checkout(
    *,
    amount: float,
    reference: str,
    mobile_number: str,
    farmer_id: int,
    plan: str,
) -> str:
    secret = _get_paystack_secret()
    environment = os.getenv("ENVIRONMENT", "development").lower()

    if not secret:
        if environment == "production":
            raise HTTPException(status_code=503, detail="PAYSTACK_SECRET_KEY is not configured")
        raise HTTPException(status_code=400, detail="PAYSTACK_SECRET_KEY is missing")

    payload = {
        "email": _build_checkout_email(mobile_number),
        "amount": int(round(amount * 100)),
        "currency": "GHS",
        "reference": reference,
        "callback_url": _resolve_paystack_callback_url(),
        "metadata": {
            "farmer_id": farmer_id,
            "mobile_number": mobile_number,
            "plan": plan,
            "type": "subscription",
            "source": "agroshare-subscriptions",
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


@router.post("/", response_model=SubscriptionCreateResponse)
async def create_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)):
    farmer = db.query(FarmerModel).filter(FarmerModel.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    normalized_plan = (payload.plan or "").strip().lower()
    if normalized_plan not in {"monthly", "yearly"}:
        raise HTTPException(status_code=400, detail="Plan must be monthly or yearly")

    amount = LISTING_FEE_GHS if normalized_plan == "monthly" else LISTING_FEE_GHS * 10  # yearly = 10 months × listing fee (2 months free)

    reference = f"SUB-{payload.farmer_id}-{uuid.uuid4().hex[:10].upper()}"

    checkout_url = await initialize_subscription_checkout(
        amount=amount,
        reference=reference,
        mobile_number=payload.mobile_number,
        farmer_id=payload.farmer_id,
        plan=normalized_plan,
    )

    record = SubscriptionModel(
        farmer_id=payload.farmer_id,
        plan=normalized_plan,
        amount=amount,
        currency="GHS",
        mobile_number=payload.mobile_number,
        reference=reference,
        status="pending",
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    record.checkout_url = checkout_url
    return record


@router.post("/verify/{reference}", response_model=VerifySubscriptionResponse)
async def verify_subscription_by_reference(reference: str, db: Session = Depends(get_db)):
    subscription = db.query(SubscriptionModel).filter(SubscriptionModel.reference == reference).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription reference not found")

    if subscription.status == "paid":
        return VerifySubscriptionResponse(reference=subscription.reference, status=subscription.status, detail="Subscription already verified")

    tx_status = await verify_paystack_transaction(reference)
    if tx_status != "success":
        raise HTTPException(status_code=400, detail="Transaction is not yet successful on Paystack")

    subscription.status = "paid"
    db.commit()
    db.refresh(subscription)
    return VerifySubscriptionResponse(reference=subscription.reference, status=subscription.status, detail="Subscription payment verified")


@router.get("/", response_model=List[Subscription])
def list_subscriptions(db: Session = Depends(get_db)):
    return db.query(SubscriptionModel).order_by(SubscriptionModel.created_at.desc()).all()


@router.get("/owner/activity", response_model=List[OwnerActivityItem])
def owner_activity(db: Session = Depends(get_db)):
    subscriptions = (
        db.query(SubscriptionModel)
        .order_by(SubscriptionModel.created_at.desc())
        .limit(25)
        .all()
    )
    payments = (
        db.query(PaymentModel)
        .order_by(PaymentModel.created_at.desc())
        .limit(25)
        .all()
    )

    events: List[OwnerActivityItem] = []

    for sub in subscriptions:
        events.append(
            OwnerActivityItem(
                type="subscription",
                reference=sub.reference,
                amount=sub.amount,
                status=sub.status,
                created_at=sub.created_at,
                meta={"farmer_id": sub.farmer_id, "plan": sub.plan},
            )
        )

    for payment in payments:
        events.append(
            OwnerActivityItem(
                type="payment",
                reference=payment.reference,
                amount=payment.amount,
                status=payment.status,
                created_at=payment.created_at,
                meta={"booking_id": payment.booking_id, "method": payment.method},
            )
        )

    events.sort(key=lambda item: item.created_at, reverse=True)
    return events[:30]
