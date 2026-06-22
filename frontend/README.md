# Frontend — Quick Start

This folder contains the React frontend and a static `simple.html` demo.

Ports used (development):

- Backend: `http://localhost:8000` (FastAPI / Uvicorn)
- React dev server: `http://localhost:3001` (set by `.env.development`)
- Static HTML demo: `http://localhost:3000/simple.html` (served by `npm run serve-simple`)

Commands (PowerShell):

1. Start the backend (from repository root or the `backend` folder):

```powershell
cd backend
# if you use venv/venv activation, activate it first
# Windows PowerShell example:
# .\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

2. Start the React dev server (from `frontend`):

```powershell
cd frontend
npm install   # only if dependencies not installed
npm start     # runs on port 3001 (see .env.development)
```

3. Serve the static `public` folder (simple.html) on port 3000:

```powershell
cd frontend
npm run serve-simple
# open http://localhost:3000/simple.html
```

Verification

- Open `http://localhost:8000/docs` to see backend OpenAPI docs.
- Open `http://localhost:3001` to view the React app.
- Open `http://localhost:3000/simple.html` to view the simple HTML demo.

Notes

- Development CORS defaults allow local ports only; production origins must be set with the `CORS_ORIGINS` environment variable.
- The React app reads its API URL from `REACT_APP_API_BASE`.
- The static `simple.html` page reads its API URL from [frontend/public/config.js](c:/Users/JohnsonJan/OneDrive/Desktop/java%20program/Farmer.%20web/new/frontend/public/config.js).

If you'd like, I can also add this note to the repository root `README.md`.