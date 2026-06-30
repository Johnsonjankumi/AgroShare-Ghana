from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime


def load_database_url() -> str:
    environment = os.getenv("ENVIRONMENT", "development").lower()
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        # Render provides a PostgreSQL URL without an explicit driver.
        # Force psycopg3 so SQLAlchemy does not default to psycopg2.
        if database_url.startswith("postgresql://"):
            return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        if database_url.startswith("postgres://"):
            return database_url.replace("postgres://", "postgresql+psycopg://", 1)
        return database_url

    if environment == "development":
        return "sqlite:///./agroshare.db"

    raise RuntimeError("DATABASE_URL must be set when ENVIRONMENT is production")


DATABASE_URL = load_database_url()

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def _sqlite_column_exists(conn, table_name: str, column_name: str) -> bool:
    rows = conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
    return any(row[1] == column_name for row in rows)


def _postgres_column_exists(conn, table_name: str, column_name: str) -> bool:
    row = conn.execute(
        text(
            """
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = :table_name
              AND column_name = :column_name
            LIMIT 1
            """
        ),
        {"table_name": table_name, "column_name": column_name},
    ).fetchone()
    return row is not None


def ensure_legacy_schema_compatibility() -> None:
    """Add columns that may be missing in older deployed databases."""
    is_sqlite = "sqlite" in DATABASE_URL
    with engine.begin() as conn:
        migrations = {
            "farmers": [
                ("password", "VARCHAR"),
                ("latitude", "FLOAT"),
                ("longitude", "FLOAT"),
                ("created_at", "TIMESTAMP"),
                ("payout_account_type", "VARCHAR"),
                ("payout_bank_code", "VARCHAR"),
                ("payout_account_number", "VARCHAR"),
                ("payout_recipient_code", "VARCHAR"),
            ],
            "equipment": [
                ("category", "VARCHAR"),
                ("photo_url", "VARCHAR"),
                ("description", "VARCHAR"),
                ("created_at", "TIMESTAMP"),
                ("owner_farmer_id", "INTEGER"),
            ],
        }

        for table_name, columns in migrations.items():
            for column_name, column_type in columns:
                exists = _sqlite_column_exists(conn, table_name, column_name) if is_sqlite else _postgres_column_exists(conn, table_name, column_name)
                if exists:
                    continue
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models
class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    email = Column(String, nullable=True, unique=True, index=True)  # Email for notifications
    district = Column(String, index=True)
    latitude = Column(Float, nullable=True)  # GPS location
    longitude = Column(Float, nullable=True)  # GPS location
    created_at = Column(DateTime, default=datetime.utcnow)
    password = Column(String)  # Hashed password
    payout_account_type = Column(String, nullable=True, default="mobile_money")
    payout_bank_code = Column(String, nullable=True)
    payout_account_number = Column(String, nullable=True)
    payout_recipient_code = Column(String, nullable=True, index=True)

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    owner_name = Column(String, index=True)
    type = Column(String)
    category = Column(String, nullable=True, index=True)  # tractor, plow, pump, etc.
    district = Column(String, index=True)
    price_per_day = Column(Float)
    description = Column(String)
    photo_url = Column(String, nullable=True)  # URL to equipment photo
    owner_farmer_id = Column(Integer, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, index=True)
    equipment_id = Column(Integer, index=True)
    rental_date = Column(String)
    district = Column(String, index=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class RentalPool(Base):
    __tablename__ = "rental_pools"
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, index=True)
    farmer_ids = Column(String)  # JSON string
    rental_date = Column(String)
    district = Column(String, index=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, index=True)
    amount = Column(Float)
    method = Column(String)
    mobile_number = Column(String)
    reference = Column(String, unique=True, index=True)
    status = Column(String, default="held")
    created_at = Column(DateTime, default=datetime.utcnow)


class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, index=True)  # farmer being rated
    rater_name = Column(String)  # farmer giving the rating
    rating = Column(Integer)  # 1-5 stars
    review = Column(Text)  # written review
    created_at = Column(DateTime, default=datetime.utcnow)


class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, index=True)
    plan = Column(String, index=True)  # monthly or yearly
    amount = Column(Float)
    currency = Column(String, default="GHS")
    mobile_number = Column(String)
    reference = Column(String, unique=True, index=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)
ensure_legacy_schema_compatibility()
