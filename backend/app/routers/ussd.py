from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
from app.routers import farmers, equipment, pools
from app.database import SessionLocal, Farmer as FarmerModel, Equipment as EquipmentModel
from app.auth import hash_password

router = APIRouter()
ussd_sessions: Dict[str, Dict] = {}

class UssdRequest(BaseModel):
    session_id: Optional[str] = None
    phone_number: str
    input_text: str

class UssdResponse(BaseModel):
    session_id: str
    message: str
    done: bool


def new_session(phone_number: str) -> str:
    session_id = f"{phone_number}-{len(ussd_sessions) + 1}"
    ussd_sessions[session_id] = {"step": 0}
    return session_id


def build_menu() -> str:
    return (
        "Welcome to AgroShare GH\n"
        "1. Register farmer\n"
        "2. List equipment\n"
        "3. Create rental pool\n"
        "0. Exit\n"
        "Reply with the number or data requested."
    )


def create_farmer_from_input(input_text: str):
    parts = [part.strip() for part in input_text.split(',')]
    if len(parts) != 3:
        return None, "Enter name, phone, district separated by commas"

    name, phone, district = parts
    db = SessionLocal()
    try:
        existing = db.query(FarmerModel).filter(FarmerModel.phone == phone).first()
        if existing:
            return None, "Phone number already registered"

        new_farmer = FarmerModel(
            name=name,
            phone=phone,
            district=district,
            password=hash_password(phone),
        )
        db.add(new_farmer)
        db.commit()
        db.refresh(new_farmer)
        return new_farmer, None
    finally:
        db.close()


def create_equipment_from_input(input_text: str):
    parts = [part.strip() for part in input_text.split(',')]
    if len(parts) != 4:
        return None, "Enter owner name, type, district, price separated by commas"

    owner_name, type_name, district, price_text = parts
    try:
        price_per_day = float(price_text)
    except ValueError:
        return None, "Price must be a number"

    db = SessionLocal()
    try:
        new_equipment = EquipmentModel(
            owner_name=owner_name,
            type=type_name,
            district=district,
            price_per_day=price_per_day,
            description="Registered via USSD",
        )
        db.add(new_equipment)
        db.commit()
        db.refresh(new_equipment)
        return new_equipment, None
    finally:
        db.close()


def create_pool_from_input(input_text: str):
    parts = [part.strip() for part in input_text.split(',')]
    if len(parts) != 4:
        return None, "Enter farmer_id, equipment_id, rental_date, district separated by commas"

    farmer_id_text, equipment_id_text, rental_date, district = parts
    try:
        farmer_id = int(farmer_id_text)
        equipment_id = int(equipment_id_text)
    except ValueError:
        return None, "Farmer ID and Equipment ID must be numbers"

    payload = pools.PoolCreate(
        farmer_id=farmer_id,
        equipment_id=equipment_id,
        rental_date=rental_date,
        district=district,
    )
    db = SessionLocal()
    try:
        pool = pools.create_rental_pool(payload, db)
        return pool, None
    finally:
        db.close()


@router.post("/", response_model=UssdResponse)
def process_ussd(request: UssdRequest):
    session_id = request.session_id or new_session(request.phone_number)
    if session_id not in ussd_sessions:
        session_id = new_session(request.phone_number)

    session = ussd_sessions[session_id]
    text = request.input_text.strip()

    if text == '0':
        session["step"] = 0
        return UssdResponse(session_id=session_id, message="Thank you for using AgroShare GH.", done=True)

    if session["step"] == 0:
        if text == '':
            return UssdResponse(session_id=session_id, message=build_menu(), done=False)
        if text == '1':
            session["step"] = 1
            return UssdResponse(
                session_id=session_id,
                message="Register farmer: send name, phone, district separated by commas.",
                done=False,
            )
        if text == '2':
            session["step"] = 2
            return UssdResponse(
                session_id=session_id,
                message="List equipment: send owner name, type, district, price separated by commas.",
                done=False,
            )
        if text == '3':
            session["step"] = 3
            return UssdResponse(
                session_id=session_id,
                message="Create rental pool: send farmer_id, equipment_id, rental_date, district separated by commas.",
                done=False,
            )
        return UssdResponse(session_id=session_id, message="Invalid option. " + build_menu(), done=False)

    if session["step"] == 1:
        farmer, error = create_farmer_from_input(text)
        session["step"] = 0
        if error:
            return UssdResponse(session_id=session_id, message=error, done=False)
        return UssdResponse(session_id=session_id, message=f"Farmer registered with ID {farmer.id}.", done=True)

    if session["step"] == 2:
        equipment_item, error = create_equipment_from_input(text)
        session["step"] = 0
        if error:
            return UssdResponse(session_id=session_id, message=error, done=False)
        return UssdResponse(session_id=session_id, message=f"Equipment listed with ID {equipment_item.id}.", done=True)

    if session["step"] == 3:
        pool, error = create_pool_from_input(text)
        session["step"] = 0
        if error:
            return UssdResponse(session_id=session_id, message=error, done=False)
        return UssdResponse(session_id=session_id, message=f"Rental pool created with ID {pool.id}.", done=True)

    return UssdResponse(session_id=session_id, message="Session reset. " + build_menu(), done=False)
