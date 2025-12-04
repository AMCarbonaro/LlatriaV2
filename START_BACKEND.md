# How to Start the Backend

## The Issue

There's a compatibility issue between Prisma 7 and tsx/ts-node. The backend needs to be started manually.

## Solution: Use Node with Compiled Code

### Step 1: Build the TypeScript

```bash
cd backend
npm run build
```

### Step 2: Start the Backend

```bash
cd backend
PORT=3001 node dist/index.js
```

You should see:
```
Backend server running on port 3001
Environment: development
Database: Connected
CORS Origin: http://localhost:3000
```

### Step 3: Verify

In another terminal:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Alternative: Fix TypeScript Errors First

If build fails, fix any TypeScript errors, then:

```bash
cd backend
npm run build
PORT=3001 node dist/index.js
```

## Quick Start Script

Create `backend/start.sh`:

```bash
#!/bin/bash
cd "$(dirname "$0")"
npm run build
PORT=3001 node dist/index.js
```

Make it executable:
```bash
chmod +x backend/start.sh
```

Then run:
```bash
./backend/start.sh
```

## Frontend Configuration

The frontend is already configured to connect to:
- **Backend**: `http://localhost:3001/api`
- **Frontend**: `http://localhost:3000` (Vite)

## Test Login

Once backend is running:
- **Email**: `test@llatria.com`
- **Password**: `test1234`
