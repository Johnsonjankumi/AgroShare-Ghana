from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import Farmer as FarmerModel
from app.database import SupportTicket as SupportTicketModel
from app.database import Subscription as SubscriptionModel
from app.database import get_db

router = APIRouter()


class SupportTicketCreate(BaseModel):
    farmer_id: int = Field(..., gt=0)
    farmer_name: str = Field(..., min_length=1, max_length=80)
    phone: str = Field(..., min_length=7, max_length=30)
    subject: str = Field(..., min_length=3, max_length=120)
    message: str = Field(..., min_length=10, max_length=2000)


class SupportTicketOut(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    phone: str
    subject: str
    message: str
    priority_level: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


def _has_yearly_subscription(db: Session, farmer_id: int) -> bool:
    subscription = (
        db.query(SubscriptionModel)
        .filter(SubscriptionModel.farmer_id == farmer_id)
        .filter(SubscriptionModel.status == "paid")
        .order_by(SubscriptionModel.created_at.desc())
        .first()
    )
    return bool(subscription and str(subscription.plan).lower() == "yearly")


@router.post("/priority", response_model=SupportTicketOut)
def create_priority_support_ticket(payload: SupportTicketCreate, db: Session = Depends(get_db)):
    farmer = db.query(FarmerModel).filter(FarmerModel.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    if not _has_yearly_subscription(db, payload.farmer_id):
        raise HTTPException(status_code=403, detail="Priority support is available to yearly subscribers")

    ticket = SupportTicketModel(
        farmer_id=payload.farmer_id,
        farmer_name=payload.farmer_name.strip(),
        phone=payload.phone.strip(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
        priority_level="priority",
        status="open",
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/farmer/{farmer_id}", response_model=list[SupportTicketOut])
def list_farmer_support_tickets(farmer_id: int, db: Session = Depends(get_db)):
    farmer = db.query(FarmerModel).filter(FarmerModel.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return (
        db.query(SupportTicketModel)
        .filter(SupportTicketModel.farmer_id == farmer_id)
        .order_by(SupportTicketModel.created_at.desc(), SupportTicketModel.id.desc())
        .limit(10)
        .all()
    )