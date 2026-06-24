from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db, Equipment as EquipmentModel
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

    class Config:
        from_attributes = True

@router.post("/", response_model=Equipment)
def create_equipment(item: EquipmentCreate, db: Session = Depends(get_db)):
    new_item = EquipmentModel(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.post("/upload/{equipment_id}")
async def upload_equipment_photo(equipment_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
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
    return query.all()
