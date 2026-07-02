from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import ChatMessage as ChatMessageModel
from app.database import Equipment as EquipmentModel
from app.database import get_db

router = APIRouter()


class ChatMessageCreate(BaseModel):
    sender_name: str = Field(..., min_length=1, max_length=80)
    sender_phone: str = Field(..., min_length=7, max_length=30)
    message: str = Field(..., min_length=1, max_length=1000)


class ChatMessageOut(BaseModel):
    id: int
    equipment_id: int
    sender_name: str
    sender_phone: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/equipment/{equipment_id}", response_model=list[ChatMessageOut])
def list_equipment_chat(equipment_id: int, db: Session = Depends(get_db)):
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return (
        db.query(ChatMessageModel)
        .filter(ChatMessageModel.equipment_id == equipment_id)
        .order_by(ChatMessageModel.created_at.asc(), ChatMessageModel.id.asc())
        .limit(200)
        .all()
    )


@router.post("/equipment/{equipment_id}", response_model=ChatMessageOut)
def post_equipment_chat_message(
    equipment_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
):
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    chat = ChatMessageModel(
        equipment_id=equipment_id,
        sender_name=payload.sender_name.strip(),
        sender_phone=payload.sender_phone.strip(),
        message=message,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat
