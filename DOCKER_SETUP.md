# Docker Setup Guide

## Step 1: Start Docker Desktop

**On macOS:**
1. Open **Docker Desktop** application
2. Wait for it to fully start (whale icon in menu bar should be steady)
3. Verify it's running: Docker icon should be in your menu bar

**Verify Docker is running:**
```bash
docker ps
```
Should return empty list (not an error).

## Step 2: Start Database Container

Once Docker is running:

```bash
# From project root
docker-compose up -d postgres
```

This will:
- Download PostgreSQL 15 image (first time only)
- Start container named `llatria-postgres`
- Expose database on port 5432
- Create database `llatria`

**Verify it's running:**
```bash
docker ps
```
You should see `llatria-postgres` container running.

**Check logs if needed:**
```bash
docker-compose logs postgres
```

## Step 3: Configure Backend Environment

Create `backend/.env` file:

```bash
cd backend
```

Create `.env` file with:

```env
# Database - Docker PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/llatria

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# JWT Secrets (generate strong random strings)
JWT_SECRET=local-dev-secret-change-in-production-min-32-chars-long
JWT_REFRESH_SECRET=local-dev-refresh-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google APIs (optional - add when ready)
# GOOGLE_API_KEY=your-google-api-key
# GOOGLE_VISION_API_KEY=your-google-api-key
# GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id

# eBay API (optional - add when ready)
# EBAY_APP_ID=your-app-id
# EBAY_DEV_ID=your-dev-id
# EBAY_CERT_ID=your-cert-id
# EBAY_ENVIRONMENT=sandbox
# EBAY_REDIRECT_URI=http://localhost:3000/api/platforms/ebay/callback
```

## Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 5: Run Database Migrations

```bash
npm run db:migrate
```

This will:
- Create all database tables
- Set up relationships
- Be ready for use

**If migration fails:**
- Check DATABASE_URL is correct
- Verify Docker container is running: `docker ps`
- Check container logs: `docker-compose logs postgres`

## Step 6: Start Backend Server

```bash
npm run dev
```

Backend should start on `http://localhost:3000`

**Test it:**
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"ok","timestamp":"..."}`

## Step 7: Start Frontend (Separate Terminal)

```bash
cd desktop
npm install  # If not already done
npm run dev
```

## Troubleshooting

### "Cannot connect to Docker daemon"
- **Solution**: Start Docker Desktop application
- Wait for it to fully initialize

### "Port 5432 already in use"
- **Solution**: Stop other PostgreSQL instances:
  ```bash
  # macOS
  brew services stop postgresql
  
  # Or kill process using port
  lsof -ti:5432 | xargs kill -9
  ```

### "Database connection refused"
- **Solution**: 
  1. Check container is running: `docker ps`
  2. Check DATABASE_URL in `.env` matches Docker setup
  3. Restart container: `docker-compose restart postgres`

### "Migration fails"
- **Solution**:
  1. Check database is accessible: `docker-compose exec postgres psql -U postgres -d llatria -c "SELECT 1;"`
  2. Reset database if needed: `npm run db:reset` (WARNING: deletes all data)

### Reset Everything
```bash
# Stop and remove containers
docker-compose down -v

# Start fresh
docker-compose up -d postgres
npm run db:migrate
```

## Useful Commands

```bash
# View running containers
docker ps

# View logs
docker-compose logs postgres

# Stop containers
docker-compose stop

# Start containers
docker-compose start

# Remove everything (including data)
docker-compose down -v

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d llatria

# View database tables
docker-compose exec postgres psql -U postgres -d llatria -c "\dt"
```

## Next Steps After Setup

1. ✅ Docker running
2. ✅ Database container started
3. ✅ Backend .env configured
4. ✅ Migrations run
5. ✅ Backend server running
6. ✅ Frontend server running
7. 🎉 Ready to test!

Then you can:
- Register/login in the app
- Create inventory items
- Test image recognition (when Google APIs are set up)
- Test price research (when Google APIs are set up)
- Test eBay posting (when eBay credentials are set up)






