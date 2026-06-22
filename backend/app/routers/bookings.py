from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db, Booking as BookingModel, Farmer as FarmerModel, Equipment as EquipmentModel

router = APIRouter()

class BookingCreate(BaseModel):
    farmer_id: int
    equipment_id: int
    rental_date: str
    district: str
    status: str = "pending"

class Booking(BaseModel):
    id: int
    farmer_id: int
    equipment_id: int
    rental_date: str
    district: str
    status: str

    class Config:
        from_attributes = True

@router.post("/", response_model=Booking)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    # Validate farmer exists
    farmer = db.query(FarmerModel).filter(FarmerModel.id == booking.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Validate equipment exists
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == booking.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    new_booking = BookingModel(**booking.dict())
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.get("/", response_model=List[Booking])
def list_bookings(district: str = None, db: Session = Depends(get_db)):
    query = db.query(BookingModel)
    if district:
        query = query.filter(BookingModel.district.ilike(district))
    return query.all()
