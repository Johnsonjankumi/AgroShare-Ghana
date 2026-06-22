# AgroShare Ghana

A mobile-first MVP for a Ghana-focused fractional equipment rental and logistics marketplace for farmers.

## Stack
- React frontend
- FastAPI backend
- SQLite for local development

## Setup

### Backend
1. cd backend
2. python -m venv venv
3. .\venv\Scripts\Activate.ps1
4. pip install -r requirements.txt
5. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

### Frontend
1. cd frontend
2. npm install
3. npm start

## Notes
- This MVP includes farmer registration, machinery listings, district rental pools, bilingual UI, and booking flow.
- Add a USSD gateway, Paystack/Mobile Money escrow integration, and local language support next.
