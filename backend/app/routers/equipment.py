from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db, Equipment as EquipmentModel

router = APIRouter()

class EquipmentCreate(BaseModel):
    owner_name: str
    type: str
    district: str
    price_per_day: float
    description: str = ""

class Equipment(BaseModel):
    id: int
    owner_name: str
    type: str
    district: str
    price_per_day: float
    description: str

    class Config:
        from_attributes = True

@router.post("/", response_model=Equipment)
def create_equipment(item: EquipmentCreate, db: Session = Depends(get_db)):
    new_item = EquipmentModel(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/", response_model=List[Equipment])
def list_equipment(district: str = None, db: Session = Depends(get_db)):
    query = db.query(EquipmentModel)
    if district:
        query = query.filter(EquipmentModel.district.ilike(district))
    return query.all()
