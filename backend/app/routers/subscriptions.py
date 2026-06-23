from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from app.database import (
    get_db,
    Subscription as SubscriptionModel,
    Farmer as FarmerModel,
    Payment as PaymentModel,
)

router = APIRouter()


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


class OwnerActivityItem(BaseModel):
    type: str  # subscription or payment
    reference: str
    amount: float
    status: str
    created_at: datetime
    meta: dict


@router.post("/", response_model=Subscription)
def create_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)):
    farmer = db.query(FarmerModel).filter(FarmerModel.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    normalized_plan = (payload.plan or "").strip().lower()
    if normalized_plan not in {"monthly", "yearly"}:
        raise HTTPException(status_code=400, detail="Plan must be monthly or yearly")

    amount = 80.0 if normalized_plan == "monthly" else 800.0  # yearly = 10 months × 80 (2 months free)

    last_sub = db.query(SubscriptionModel).order_by(SubscriptionModel.id.desc()).first()
    next_id = (last_sub.id + 1) if last_sub else 1
    reference = f"SUB-{next_id}-{payload.farmer_id}"

    record = SubscriptionModel(
        farmer_id=payload.farmer_id,
        plan=normalized_plan,
        amount=amount,
        currency="GHS",
        mobile_number=payload.mobile_number,
        reference=reference,
        status="paid",  # MVP flow: mark paid after request creation
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return record


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
