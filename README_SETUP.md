# Quick Start Guide

## For Local Development & Testing

### 1. Start Database (Docker - Easiest)

```bash
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Verify it's running
docker ps
```

### 2. Set Up Backend

```bash
cd backend

# Copy environment template
cp .env.local.example .env

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Set Up Frontend

```bash
cd desktop

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000` (or next available port)

### 4. Create Your First Account

1. Open the desktop app in your browser
2. You'll see the login page
3. Click "Register" (or use login if you have an account)
4. Create your account
5. Start adding inventory items!

## For AWS Migration (When Ready)

See `SETUP_GUIDE.md` for detailed AWS migration instructions.

The codebase is designed to work in both environments - just change the environment variables!

## Troubleshooting

**Database won't start?**
```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

**Backend connection errors?**
- Check `backend/.env` has correct `DATABASE_URL`
- For Docker: `postgresql://postgres:password@localhost:5432/llatria`
- Verify database is running: `docker ps`

**Port already in use?**
- Change `PORT` in `backend/.env`
- Or stop other services using port 3000

## What's Next?

- ✅ Local development setup complete
- 📝 See `SETUP_GUIDE.md` for AWS migration path
- 🚀 Start building your inventory!






