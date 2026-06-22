# AgroShare Ghana - Production Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Domain name
- Hosting account (AWS, Heroku, DigitalOcean, etc.)
- SSL certificate (Let's Encrypt free)

## Local Testing with Docker Compose

```bash
# Clone the repository
git clone <repo-url>
cd agroshare-ghana

# Create .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update environment variables in .env files
# - Set JWT_SECRET to a secure random string
# - Update CORS_ORIGINS for your domain
# - Update REACT_APP_API_BASE to point to your backend URL

# Build and run the development stack
docker-compose up --build

# Access the app at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

## Deployment to Heroku

### Backend Deployment

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Create Heroku app
heroku create agroshare-ghana-api

# Set environment variables
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set ENVIRONMENT=production
heroku config:set CORS_ORIGINS=https://your-domain.com

# Add Procfile for backend
echo "web: gunicorn app.main:app --worker-class uvicorn.workers.UvicornWorker" > backend/Procfile

# Deploy
git subtree push --prefix backend heroku main
```

### Frontend Deployment

```bash
# Create Heroku app for frontend
heroku create agroshare-ghana-frontend

# Set environment variables
heroku config:set REACT_APP_API_BASE=https://agroshare-ghana-api.herokuapp.com/api

# Add Procfile for frontend
echo "web: npm run build && npm start" > frontend/Procfile

# Deploy
git subtree push --prefix frontend heroku main
```

## Deployment to AWS (EC2 + RDS)

### 1. Set up EC2 Instance

```bash
# Launch Ubuntu 22.04 LTS instance
# SSH into instance

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER

# Install git
sudo apt install -y git

# Clone repository
git clone <repo-url>
cd agroshare-ghana
```

### 2. Set up RDS Database

```bash
# Create PostgreSQL RDS instance in AWS Console
# Note: DATABASE_URL = postgresql://user:password@rds-endpoint:5432/agroshare

# Update DATABASE_URL in .env
```

### 3. Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Renew automatically
sudo systemctl enable certbot.timer
```

### 4. Deploy with Docker Compose

```bash
# Create .env file
cp backend/.env.example .env
# Edit .env with production values

# Start services
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

## Deployment to DigitalOcean App Platform

```bash
# Create App Spec (app.yaml)
cat > app.yaml << 'EOF'
name: agroshare-ghana
services:
- name: backend
  github:
    repo: your-username/agroshare-ghana
    branch: main
  source_dir: backend
  build_command: pip install -r requirements.txt
  run_command: gunicorn app.main:app --worker-class uvicorn.workers.UvicornWorker
  envs:
  - key: DATABASE_URL
    value: ${db.connection_string}
  - key: JWT_SECRET
    value: ${JWT_SECRET}
  http_port: 8000
  
- name: frontend
  github:
    repo: your-username/agroshare-ghana
    branch: main
  source_dir: frontend
  build_command: npm install && npm run build
  run_command: npm start
  envs:
  - key: REACT_APP_API_BASE
    value: https://api.your-domain.com/api
  http_port: 3000

databases:
- name: db
  engine: PG
  version: "14"
EOF

# Deploy
doctl apps create --spec app.yaml
```

## Environment Variables for Production

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/agroshare

# API Configuration
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000

# CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# JWT
JWT_SECRET=<generate-with-openssl-rand-hex-32>

# Frontend
REACT_APP_API_BASE=https://api.your-domain.com/api
```

## Production Deployment with Docker

Use the production templates already included in the repository:

```bash
cp backend/.env.production.example backend/.env.production
cp frontend/.env.production.example frontend/.env.production
```

Create a root `.env` file for `docker-compose.prod.yml`:

```env
DATABASE_URL=postgresql://user:password@host:5432/agroshare
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
JWT_SECRET=replace-this-with-a-long-random-secret
REACT_APP_API_BASE=https://api.your-domain.com/api
```

Paste the values in these exact places:

- `DATABASE_URL`: your root `.env` file for Docker production, or your hosting provider's backend environment variables.
- `JWT_SECRET`: your root `.env` file for Docker production, or your hosting provider's backend environment variables.
- `CORS_ORIGINS`: [backend/.env.production.example](c:/Users/JohnsonJan/OneDrive/Desktop/java%20program/Farmer.%20web/new/backend/.env.production.example) when copied to `backend/.env.production`, plus your hosting provider backend environment variables.
- `REACT_APP_API_BASE`: [frontend/.env.production.example](c:/Users/JohnsonJan/OneDrive/Desktop/java%20program/Farmer.%20web/new/frontend/.env.production.example) when copied to `frontend/.env.production`, plus your frontend hosting build environment variables.
- Simple static page API URL: [frontend/public/config.js](c:/Users/JohnsonJan/OneDrive/Desktop/java%20program/Farmer.%20web/new/frontend/public/config.js) if you publish `simple.html` online.

Then build and run the production stack:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

If you publish the static `simple.html` page, update [frontend/public/config.js](c:/Users/JohnsonJan/OneDrive/Desktop/java%20program/Farmer.%20web/new/frontend/public/config.js) with your live API domain before deployment.

### Generic Docker Production Steps

1. Copy [backend/.env.production.example](c:/Users/JohnsonJan/OneDrive/Desktop/java%20program/Farmer.%20web/new/backend/.env.production.example) to `backend/.env.production` and paste your real values.
2. Copy [frontend/.env.production.example](c:/Users/JohnsonJan/OneDrive/Desktop/java%20program/Farmer.%20web/new/frontend/.env.production.example) to `frontend/.env.production` and paste your real API domain.
3. Copy `.env.prod.example` to `.env` at the repository root and paste `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, and `REACT_APP_API_BASE`.
4. Run `docker-compose -f docker-compose.prod.yml up --build -d`.
5. Open your frontend domain and confirm it talks to your API domain.

## Database Migrations (if upgrading from SQLite)

```bash
# Backup SQLite database
cp agroshare.db agroshare.db.backup

# Update DATABASE_URL in .env to PostgreSQL
DATABASE_URL=postgresql://...

# SQLAlchemy will create tables on first run
# Or run migrations if using Alembic:
alembic upgrade head
```

## Monitoring and Maintenance

### View Logs

```bash
# Docker Compose logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Heroku logs
heroku logs -t
```

### Database Backup

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Health Checks

```bash
# Backend API health
curl https://api.your-domain.com/docs

# Frontend
curl https://your-domain.com
```

## Security Checklist

- [ ] Set strong JWT_SECRET in production
- [ ] Enable HTTPS/SSL
- [ ] Update CORS_ORIGINS to your domain
- [ ] Use PostgreSQL for production (not SQLite)
- [ ] Set DEBUG=false
- [ ] Enable CSRF protection if using cookies
- [ ] Regular security updates
- [ ] Database backups enabled
- [ ] Monitor API rate limits
- [ ] Log aggregation setup

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port
sudo lsof -i :8000
sudo kill -9 <PID>
```

### Database Connection Error

```bash
# Check DATABASE_URL format
# postgresql://user:password@host:5432/dbname

# Test connection
psql $DATABASE_URL
```

### CORS Errors

Update CORS_ORIGINS in .env to include your frontend URL.

### Out of Memory

Increase Docker memory limits or use smaller worker count:

```bash
docker run -m 1g backend
# Or modify Gunicorn workers
```

## Performance Optimization

```bash
# Use PostgreSQL connection pooling
# Install pgbouncer

# Cache static assets with CDN
# Use Redis for session caching

# Frontend optimization
npm run build -- --prod

# Backend optimization
# Increase gunicorn workers
CMD ["gunicorn", "app.main:app", "--workers", "8", "--worker-class", "uvicorn.workers.UvicornWorker"]
```
