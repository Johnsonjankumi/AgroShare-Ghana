from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db, Farmer as FarmerModel
from app.auth import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter()

class LoginRequest(BaseModel):
    phone: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    farmer_id: int

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate farmer with phone and password, return JWT token."""
    farmer = db.query(FarmerModel).filter(FarmerModel.phone == payload.phone).first()
    
    if not farmer or not verify_password(payload.password, farmer.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": farmer.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "farmer_id": farmer.id
    }
