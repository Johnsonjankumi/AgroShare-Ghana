from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db, Farmer as FarmerModel
from app.auth import hash_password
from pydantic import Field

router = APIRouter()

class FarmerCreate(BaseModel):
    name: str
    phone: str
    district: str
    password: str = Field(..., min_length=6, description="Minimum 6 characters")

class Farmer(BaseModel):
    id: int
    name: str
    phone: str
    district: str

    class Config:
        from_attributes = True

@router.post("/", response_model=Farmer)
def create_farmer(farmer: FarmerCreate, db: Session = Depends(get_db)):
    # Check if phone already exists
    existing = db.query(FarmerModel).filter(FarmerModel.phone == farmer.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    farmer_dict = farmer.dict()
    farmer_dict["password"] = hash_password(farmer_dict["password"])
    new_farmer = FarmerModel(**farmer_dict)
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return new_farmer

@router.get("/", response_model=List[Farmer])
def list_farmers(db: Session = Depends(get_db)):
    return db.query(FarmerModel).all()
