import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.database import Farmer as FarmerModel
from app.routers.payments import _build_seller_notification_detail

# Create test database tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture
def db():
    """Create a fresh database for each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()

def test_create_farmer(db):
    """Test farmer registration."""
    response = client.post(
        "/api/farmers/",
        json={
            "name": "John Farmer",
            "phone": "0245123456",
            "district": "Ashanti",
            "password": "securepass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Farmer"
    assert data["phone"] == "0245123456"
    assert "password" not in data  # Password should not be returned

def test_duplicate_phone(db):
    """Test that duplicate phone numbers are rejected."""
    # First farmer
    client.post(
        "/api/farmers/",
        json={
            "name": "John Farmer",
            "phone": "0245123456",
            "district": "Ashanti",
            "password": "securepass123"
        }
    )
    # Second farmer with same phone
    response = client.post(
        "/api/farmers/",
        json={
            "name": "Jane Farmer",
            "phone": "0245123456",
            "district": "Greater Accra",
            "password": "securepass456"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_short_password(db):
    """Test that short passwords are rejected."""
    response = client.post(
        "/api/farmers/",
        json={
            "name": "John Farmer",
            "phone": "0245123456",
            "district": "Ashanti",
            "password": "short"
        }
    )
    assert response.status_code == 422  # Validation error

def test_list_farmers(db):
    """Test listing farmers."""
    # Create two farmers
    for i in range(2):
        client.post(
            "/api/farmers/",
            json={
                "name": f"Farmer {i}",
                "phone": f"024512345{i}",
                "district": "Ashanti",
                "password": "securepass123"
            }
        )
    
    response = client.get("/api/farmers/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_login_success(db):
    """Test successful login."""
    # Create farmer
    client.post(
        "/api/farmers/",
        json={
            "name": "John Farmer",
            "phone": "0245123456",
            "district": "Ashanti",
            "password": "securepass123"
        }
    )
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={
            "phone": "0245123456",
            "password": "securepass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "farmer_id" in data

def test_login_wrong_password(db):
    """Test login with wrong password."""
    # Create farmer
    client.post(
        "/api/farmers/",
        json={
            "name": "John Farmer",
            "phone": "0245123456",
            "district": "Ashanti",
            "password": "correctpassword"
        }
    )
    
    # Login with wrong password
    response = client.post(
        "/api/auth/login",
        json={
            "phone": "0245123456",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert "Invalid phone or password" in response.json()["detail"]

def test_equipment_creation():
    """Test equipment creation."""
    response = client.post(
        "/api/equipment/",
        json={
            "owner_name": "Owner Company",
            "type": "Tractor",
            "district": "Ashanti",
            "price_per_day": 50.0,
            "description": "John Deere tractor"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "Tractor"
    assert data["price_per_day"] == 50.0

def test_equipment_filter_by_district():
    """Test filtering equipment by district."""
    # Create equipment in different districts
    client.post(
        "/api/equipment/",
        json={
            "owner_name": "Owner 1",
            "type": "Tractor",
            "district": "Ashanti",
            "price_per_day": 50.0
        }
    )
    client.post(
        "/api/equipment/",
        json={
            "owner_name": "Owner 2",
            "type": "Harvester",
            "district": "Greater Accra",
            "price_per_day": 75.0
        }
    )
    
    # Filter by Ashanti
    response = client.get("/api/equipment/?district=Ashanti")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["district"] == "Ashanti"


def test_seller_notification_detail_omits_no_email_suffix_when_sms_fails():
    detail = _build_seller_notification_detail(
        sms_sent=False,
        sms_detail="The supplied authentication is invalid",
        email_sent=False,
        email_detail="Email provider not configured",
        seller_email="",
    )

    assert detail == "SMS failed: The supplied authentication is invalid"
    assert "No email configured" not in detail
