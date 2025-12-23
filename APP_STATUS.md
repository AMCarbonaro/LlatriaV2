# App Status

## Current Status

- ✅ **Frontend**: Running on port 3000 (Vite dev server)
- ⏳ **Backend**: Starting on port 3001
- ✅ **Database**: PostgreSQL running in Docker
- ✅ **Test User**: Created (`test@llatria.com` / `test1234`)

## To Complete Restart

### Option 1: Manual Start (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
PORT=3001 npm run dev
```

**Terminal 2 - Frontend (if not already running):**
```bash
cd desktop
npm run dev
```

### Option 2: Check Backend Logs

If backend isn't starting, check for errors:
```bash
cd backend
PORT=3001 npx tsx src/index.ts
```

Look for any error messages and share them.

## Verify Everything

1. **Backend health:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test login:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@llatria.com","password":"test1234"}'
   ```

3. **Frontend:**
   - Electron app should open automatically
   - Or check browser at URL shown in terminal

## Login Credentials

- **Email:** `test@llatria.com`
- **Password:** `test1234`

## Next: Test Facebook Automation

Once logged in:
1. Create or select an inventory item
2. Make sure it has images
3. Fill Facebook details (especially Location)
4. Click "Post" in Facebook section
5. Facebook window will open for automation






