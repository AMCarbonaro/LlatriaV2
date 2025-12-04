# Backend Startup - Fixed

## Issues Fixed

1. ✅ **Prisma Client Generated** - Ran `npx prisma generate`
2. ✅ **DATABASE_URL Configured** - Set in `.env` file
3. ✅ **Port Configuration** - Backend runs on port 3001
4. ✅ **Frontend API URLs Updated** - Both `api.ts` and `platformService.ts` now point to port 3001

## To Start Backend

```bash
cd backend
PORT=3001 npm run dev
```

Or directly:
```bash
cd backend
PORT=3001 npx tsx src/index.ts
```

## Verify Backend is Running

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Frontend Configuration

The frontend is now configured to connect to:
- **API Base URL**: `http://localhost:3001/api`
- **Backend Port**: `3001`
- **Frontend Port**: `3000` (Vite dev server)

## Test Login

Once backend is running:
- **Email**: `test@llatria.com`
- **Password**: `test1234`

## If Backend Still Won't Start

1. Check Docker is running:
   ```bash
   docker ps | grep postgres
   ```

2. Check DATABASE_URL in `.env`:
   ```bash
   cd backend
   grep DATABASE_URL .env
   ```
   Should be: `DATABASE_URL=postgresql://postgres:password@localhost:5432/llatria`

3. Regenerate Prisma Client:
   ```bash
   cd backend
   npx prisma generate
   ```

4. Check for errors:
   ```bash
   cd backend
   PORT=3001 npx tsx src/index.ts
   ```



