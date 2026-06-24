from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db, Farmer as FarmerModel
from app.auth import hash_password
from pydantic import Field
import os
import httpx

router = APIRouter()

class FarmerCreate(BaseModel):
    name: str
    phone: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    payout_account_type: Optional[str] = "mobile_money"
    payout_bank_code: Optional[str] = None
    payout_account_number: Optional[str] = None

class Farmer(BaseModel):
    id: int
    name: str
    phone: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    payout_account_type: Optional[str] = None
    payout_bank_code: Optional[str] = None
    payout_account_number: Optional[str] = None
    payout_recipient_code: Optional[str] = None

    class Config:
        from_attributes = True


class FarmerPayoutSetup(BaseModel):
    payout_account_type: str = "mobile_money"
    payout_bank_code: str
    payout_account_number: str


def create_transfer_recipient(*, name: str, account_type: str, account_number: str, bank_code: str) -> str:
    secret = os.getenv("PAYSTACK_SECRET_KEY")
    if not secret:
        raise HTTPException(status_code=503, detail="PAYSTACK_SECRET_KEY is not configured")

    payload = {
        "type": account_type,
        "name": name,
        "account_number": account_number,
        "bank_code": bank_code,
        "currency": "GHS",
    }
    headers = {
        "Authorization": f"Bearer {secret}",
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=20.0) as client:
        response = client.post("https://api.paystack.co/transferrecipient", json=payload, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(status_code=400, detail="Unable to create payout recipient for farmer")

    body = response.json()
    if not body.get("status") or not body.get("data", {}).get("recipient_code"):
        raise HTTPException(status_code=400, detail="Invalid payout recipient response from Paystack")

    return body["data"]["recipient_code"]


def maybe_create_recipient(farmer_payload: FarmerCreate) -> str | None:
    has_payout_details = bool(farmer_payload.payout_bank_code and farmer_payload.payout_account_number)
    if not has_payout_details:
        return None

    return create_transfer_recipient(
        name=farmer_payload.name,
        account_type=(farmer_payload.payout_account_type or "mobile_money").strip().lower(),
        account_number=farmer_payload.payout_account_number.strip(),
        bank_code=farmer_payload.payout_bank_code.strip(),
    )

@router.post("/", response_model=Farmer)
def create_farmer(farmer: FarmerCreate, db: Session = Depends(get_db)):
    # Check if phone already exists
    existing = db.query(FarmerModel).filter(FarmerModel.phone == farmer.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    farmer_dict = farmer.dict()
    farmer_dict["password"] = hash_password(farmer_dict["password"])
    farmer_dict["payout_recipient_code"] = maybe_create_recipient(farmer)
    new_farmer = FarmerModel(**farmer_dict)
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return new_farmer


@router.post("/{farmer_id}/payout-recipient", response_model=Farmer)
def setup_farmer_payout_recipient(farmer_id: int, payload: FarmerPayoutSetup, db: Session = Depends(get_db)):
    farmer = db.query(FarmerModel).filter(FarmerModel.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    recipient_code = create_transfer_recipient(
        name=farmer.name,
        account_type=payload.payout_account_type.strip().lower(),
        account_number=payload.payout_account_number.strip(),
        bank_code=payload.payout_bank_code.strip(),
    )

    farmer.payout_account_type = payload.payout_account_type.strip().lower()
    farmer.payout_bank_code = payload.payout_bank_code.strip()
    farmer.payout_account_number = payload.payout_account_number.strip()
    farmer.payout_recipient_code = recipient_code
    db.commit()
    db.refresh(farmer)
    return farmer

@router.get("/", response_model=List[Farmer])
def list_farmers(db: Session = Depends(get_db)):
    return db.query(FarmerModel).all()
