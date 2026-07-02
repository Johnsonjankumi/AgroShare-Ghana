from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db, Equipment as EquipmentModel, Farmer as FarmerModel, Subscription as SubscriptionModel
import os
import shutil
from datetime import datetime

router = APIRouter()

class EquipmentCreate(BaseModel):
    owner_name: str
    owner_farmer_id: Optional[int] = None
    type: str
    category: str = "other"  # tractor, plow, pump, etc.
    district: str
    price_per_day: float
    description: str = ""
    photo_url: Optional[str] = None

class Equipment(BaseModel):
    id: int
    owner_name: str
    owner_farmer_id: Optional[int] = None
    type: str
    category: Optional[str] = None
    district: str
    price_per_day: float
    description: str
    photo_url: Optional[str] = None
    owner_phone_masked: Optional[str] = None

    class Config:
        from_attributes = True


def _has_paid_listing_access(db: Session, farmer_id: int) -> bool:
    farmer = db.query(FarmerModel).filter(FarmerModel.id == farmer_id).first()
    if not farmer:
        return False

    subscription = (
        db.query(SubscriptionModel)
        .filter(SubscriptionModel.farmer_id == farmer_id)
        .filter(SubscriptionModel.status == "paid")
        .order_by(SubscriptionModel.created_at.desc())
        .first()
    )
    return subscription is not None


def _mask_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return None
    clean = ''.join(ch for ch in phone if ch.isdigit())
    if len(clean) < 4:
        return phone
    return f"{clean[:3]}****{clean[-3:]}"

@router.post("/", response_model=Equipment)
def create_equipment(item: EquipmentCreate, db: Session = Depends(get_db)):
    if not item.owner_farmer_id:
        raise HTTPException(status_code=400, detail="Owner Farmer ID is required to list equipment")

    if not _has_paid_listing_access(db, item.owner_farmer_id):
        raise HTTPException(status_code=402, detail="Payment required before listing equipment. Subscribe first to unlock this form.")

    new_item = EquipmentModel(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    masked_phone = None
    if new_item.owner_farmer_id:
        owner = db.query(FarmerModel).filter(FarmerModel.id == new_item.owner_farmer_id).first()
        masked_phone = _mask_phone(owner.phone if owner else None)

    return {
        "id": new_item.id,
        "owner_name": new_item.owner_name,
        "owner_farmer_id": new_item.owner_farmer_id,
        "type": new_item.type,
        "category": new_item.category,
        "district": new_item.district,
        "price_per_day": new_item.price_per_day,
        "description": new_item.description,
        "photo_url": new_item.photo_url,
        "owner_phone_masked": masked_phone,
    }

@router.post("/upload/{equipment_id}")
async def upload_equipment_photo(equipment_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if not equipment.owner_farmer_id:
        raise HTTPException(status_code=400, detail="Owner Farmer ID is required before uploading a photo")

    if not _has_paid_listing_access(db, equipment.owner_farmer_id):
        raise HTTPException(status_code=402, detail="Payment required before uploading equipment photos")
    
    # Save file to uploads directory
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"equipment_{equipment_id}_{timestamp}{file_ext}"
    filepath = os.path.join(upload_dir, filename)
    
    try:
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        # Update equipment with photo URL
        photo_url = f"/uploads/{filename}"
        equipment.photo_url = photo_url
        db.commit()
        
        return {"photo_url": photo_url, "message": "Photo uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Equipment])
def list_equipment(district: str = None, category: str = None, db: Session = Depends(get_db)):
    query = db.query(EquipmentModel)
    if district:
        query = query.filter(EquipmentModel.district.ilike(district))
    if category:
        query = query.filter(EquipmentModel.category.ilike(category))

    items = query.all()
    owner_ids = {item.owner_farmer_id for item in items if item.owner_farmer_id}
    owners = {}
    if owner_ids:
        owners = {
            farmer.id: farmer
            for farmer in db.query(FarmerModel).filter(FarmerModel.id.in_(owner_ids)).all()
        }

    return [
        {
            "id": item.id,
            "owner_name": item.owner_name,
            "owner_farmer_id": item.owner_farmer_id,
            "type": item.type,
            "category": item.category,
            "district": item.district,
            "price_per_day": item.price_per_day,
            "description": item.description,
            "photo_url": item.photo_url,
            "owner_phone_masked": _mask_phone(owners[item.owner_farmer_id].phone)
            if item.owner_farmer_id in owners else None,
        }
        for item in items
    ]


@router.get("/{equipment_id}/seller-phone")
def get_seller_phone(equipment_id: int, db: Session = Depends(get_db)):
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if not equipment.owner_farmer_id:
        raise HTTPException(status_code=404, detail="Seller contact is not available for this listing")

    owner = db.query(FarmerModel).filter(FarmerModel.id == equipment.owner_farmer_id).first()
    if not owner or not owner.phone:
        raise HTTPException(status_code=404, detail="Seller contact is not available for this listing")

    return {"phone": owner.phone, "masked_phone": _mask_phone(owner.phone)}
