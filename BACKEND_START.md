# Backend Server - Quick Start

## Start Backend

```bash
cd backend
PORT=3001 npm run dev
```

**Or** update `backend/.env`:
```env
PORT=3001
```

Then:
```bash
cd backend
npm run dev
```

## Verify It's Running

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@llatria.com","password":"test1234"}'
```

## Frontend Configuration

The frontend is configured to use `http://localhost:3001/api` by default.

If you want to change the backend port, update:
- `desktop/src/services/api.ts` - Change the default API_BASE_URL
- Or set `VITE_API_BASE_URL` in `desktop/.env`

## Port Conflicts

- **Port 3000**: Usually used by frontend (Vite)
- **Port 3001**: Backend API (recommended)
- **Port 5432**: PostgreSQL database

If 3001 is taken, use 3002, 3003, etc.



