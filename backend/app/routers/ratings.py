from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Rating as RatingModel
from datetime import datetime

router = APIRouter()

class RatingCreate(BaseModel):
    farmer_id: int
    rater_name: str
    rating: int  # 1-5
    review: str

class Rating(BaseModel):
    id: int
    farmer_id: int
    rater_name: str
    rating: int
    review: str

    class Config:
        from_attributes = True

class FarmerRatingStats(BaseModel):
    farmer_id: int
    average_rating: float
    total_ratings: int

@router.post("/", response_model=Rating)
def create_rating(item: RatingCreate, db: Session = Depends(get_db)):
    # Validate rating between 1-5
    if item.rating < 1 or item.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    new_rating = RatingModel(**item.dict(), created_at=datetime.utcnow())
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

@router.get("/farmer/{farmer_id}", response_model=List[Rating])
def get_farmer_ratings(farmer_id: int, db: Session = Depends(get_db)):
    ratings = db.query(RatingModel).filter(RatingModel.farmer_id == farmer_id).order_by(RatingModel.created_at.desc()).all()
    return ratings

@router.get("/stats/{farmer_id}", response_model=FarmerRatingStats)
def get_farmer_rating_stats(farmer_id: int, db: Session = Depends(get_db)):
    ratings = db.query(RatingModel).filter(RatingModel.farmer_id == farmer_id).all()
    
    if not ratings:
        return {
            "farmer_id": farmer_id,
            "average_rating": 0,
            "total_ratings": 0
        }
    
    avg_rating = sum(r.rating for r in ratings) / len(ratings)
    return {
        "farmer_id": farmer_id,
        "average_rating": round(avg_rating, 1),
        "total_ratings": len(ratings)
    }
