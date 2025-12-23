# Test User Credentials

## ✅ Test User Created

**Email:** `test@llatria.com`  
**Password:** `test1234`

## How to Use

1. Open the desktop app
2. Go to login page
3. Enter the credentials above
4. Click "Sign In"

## Create Additional Users

You can create more test users by running:

```bash
cd backend
npx tsx src/scripts/create-test-user.ts
```

Or register directly in the app - the registration endpoint is working!

## Troubleshooting

**"Unexpected end of JSON input" error:**
- Make sure backend is running: `cd backend && npm run dev`
- Check backend is on port 3000
- Verify DATABASE_URL is set in `backend/.env`

**"Cannot connect to backend" error:**
- Start backend server: `cd backend && npm run dev`
- Check backend logs for errors
- Verify database is running: `docker ps`






