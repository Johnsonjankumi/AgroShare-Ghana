from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db, Farmer as FarmerModel, Equipment as EquipmentModel, RentalPool as RentalPoolModel

router = APIRouter()

class PoolCreate(BaseModel):
    farmer_id: int
    equipment_id: int
    rental_date: str
    district: str

class Pool(BaseModel):
    id: int
    district: str
    equipment_id: int
    farmer_ids: List[int]
    rental_date: str
    status: str

    class Config:
        from_attributes = True


def _parse_farmer_ids(value: str | None) -> List[int]:
    if not value:
        return []
    return [int(item) for item in value.split(",") if item]


def _build_pool_response(pool: RentalPoolModel) -> Pool:
    return Pool(
        id=pool.id,
        district=pool.district,
        equipment_id=pool.equipment_id,
        farmer_ids=_parse_farmer_ids(pool.farmer_ids),
        rental_date=pool.rental_date,
        status=pool.status,
    )

@router.post("/", response_model=Pool)
def create_rental_pool(payload: PoolCreate, db: Session = Depends(get_db)):
    farmer = db.query(FarmerModel).filter(FarmerModel.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == payload.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if farmer.district.lower() != payload.district.lower() or equipment.district.lower() != payload.district.lower():
        raise HTTPException(status_code=400, detail="Farmer, equipment, and district must match")

    existing_pool = (
        db.query(RentalPoolModel)
        .filter(RentalPoolModel.equipment_id == payload.equipment_id)
        .filter(RentalPoolModel.rental_date == payload.rental_date)
        .filter(RentalPoolModel.district.ilike(payload.district))
        .filter(RentalPoolModel.status == "pending")
        .first()
    )

    if existing_pool:
        farmer_ids = _parse_farmer_ids(existing_pool.farmer_ids)
        if payload.farmer_id in farmer_ids:
            return _build_pool_response(existing_pool)
        if len(farmer_ids) >= 5:
            raise HTTPException(status_code=400, detail="This rental pool is already full")
        farmer_ids.append(payload.farmer_id)
        existing_pool.farmer_ids = ",".join(str(farmer_id) for farmer_id in farmer_ids)
        if len(farmer_ids) >= 3:
            existing_pool.status = "ready"
        db.commit()
        db.refresh(existing_pool)
        return _build_pool_response(existing_pool)

    pool = RentalPoolModel(
        district=payload.district,
        equipment_id=payload.equipment_id,
        farmer_ids=str(payload.farmer_id),
        rental_date=payload.rental_date,
        status="pending",
    )
    db.add(pool)
    db.commit()
    db.refresh(pool)
    return _build_pool_response(pool)

@router.get("/", response_model=List[Pool])
def list_rental_pools(district: str = None, db: Session = Depends(get_db)):
    query = db.query(RentalPoolModel)
    if district:
        query = query.filter(RentalPoolModel.district.ilike(district))
    return [_build_pool_response(pool) for pool in query.all()]
