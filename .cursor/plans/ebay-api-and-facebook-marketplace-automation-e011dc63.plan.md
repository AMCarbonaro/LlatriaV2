<!-- e011dc63-8678-42ea-bea6-549a5c3c4664 e204a153-844e-4fcb-ab05-90fad7b483dd -->
# Backend Infrastructure Setup Plan

## Current State

- Platform integration (eBay API, Facebook automation) is complete but uses mock data
- Backend has platform endpoints but no database, authentication, or inventory management
- Frontend is ready but needs real backend API to connect to

## Phase 1: Database Setup

### 1.1 Install Prisma and Database Dependencies

- Add Prisma, PostgreSQL client, and related packages to `backend/package.json`
- Initialize Prisma with `prisma init`

### 1.2 Create Database Schema

- Create Prisma schema in `backend/prisma/schema.prisma` based on `BACKEND_PLAN.md`
- Define models: User, InventoryItem, InventoryImage, AIData, PlatformPosting, PlatformCredentials
- Set up relationships and indexes

### 1.3 Database Migration

- Create initial migration
- Set up database connection string in `.env`

## Phase 2: Authentication System

### 2.1 User Authentication Endpoints

- Create `backend/src/controllers/auth.controller.ts`:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/refresh` - Refresh JWT token
  - `GET /api/auth/me` - Get current user

### 2.2 JWT Middleware

- Create `backend/src/middleware/auth.middleware.ts`:
  - Verify JWT tokens
  - Extract user ID from token
  - Add to request object

### 2.3 Password Hashing

- Use bcrypt for password hashing in user service
- Create `backend/src/services/user.service.ts` for user operations

## Phase 3: Inventory Management API

### 3.1 Inventory Service

- Create `backend/src/services/inventory.service.ts`:
  - CRUD operations for inventory items
  - Image handling
  - AI data management

### 3.2 Inventory Endpoints

- Create `backend/src/controllers/inventory.controller.ts`:
  - `GET /api/inventory` - List items (with pagination, filters)
  - `POST /api/inventory` - Create item
  - `GET /api/inventory/:id` - Get item details
  - `PUT /api/inventory/:id` - Update item
  - `DELETE /api/inventory/:id` - Delete item
  - `POST /api/inventory/:id/mark-sold` - Mark as sold

### 3.3 Image Upload

- Create `backend/src/middleware/upload.middleware.ts`:
  - Handle multipart/form-data
  - Validate image files
  - Upload to temporary storage (ready for S3/R2)

## Phase 4: Connect Platform Integration to Real Data

### 4.1 Update Platform Controller

- Replace mock item lookups in `backend/src/controllers/platform.controller.ts`
- Use `inventoryService.getItem()` instead of mock data
- Update item with real listing IDs after posting

### 4.2 Update Platform Credentials Service

- Replace in-memory storage in `backend/src/services/platform-credentials.service.ts`
- Use Prisma to store credentials in database
- Encrypt sensitive data (access tokens, refresh tokens)

### 4.3 Update Inventory Store

- Connect frontend `desktop/src/store/inventoryStore.ts` to real API
- Replace `mockInventoryService` calls with API calls
- Handle authentication tokens

## Phase 5: Frontend Authentication

### 5.1 Auth Store Updates

- Update `desktop/src/store/authStore.ts`:
  - Add login/register API calls
  - Store JWT tokens
  - Handle token refresh

### 5.2 Login/Register Pages

- Update `desktop/src/pages/LoginPage.tsx`:
  - Connect to real auth API
  - Handle errors and success states

### 5.3 Protected Routes

- Add route protection middleware
- Redirect to login if not authenticated

## Phase 6: Testing & Validation

### 6.1 Backend Testing

- Test database operations
- Test authentication flow
- Test inventory CRUD operations
- Test platform posting with real data

### 6.2 Integration Testing

- Test full flow: login → create item → post to eBay → verify listing
- Test Facebook automation with real items
- Test error scenarios

## Implementation Order

1. **Database Setup** (Phase 1) - Foundation for everything - ✅ COMPLETE
2. **Authentication** (Phase 2) - Required for user-specific data - ✅ COMPLETE
3. **Inventory API** (Phase 3) - Core functionality - ✅ COMPLETE
4. **Platform Integration** (Phase 4) - Connect existing code to real data - ✅ COMPLETE
5. **Frontend Auth** (Phase 5) - User-facing authentication - IN PROGRESS
6. **Frontend Inventory** (Phase 6) - Connect frontend to real API - IN PROGRESS
7. **Testing** (Phase 7) - Validate everything works

## Key Files to Create/Modify

**New Files:**

- `backend/prisma/schema.prisma` - Database schema
- `backend/src/controllers/auth.controller.ts` - Auth endpoints
- `backend/src/controllers/inventory.controller.ts` - Inventory endpoints
- `backend/src/services/user.service.ts` - User operations
- `backend/src/services/inventory.service.ts` - Inventory operations
- `backend/src/middleware/auth.middleware.ts` - JWT verification
- `backend/src/middleware/upload.middleware.ts` - File upload handling

**Modify Existing:**

- `backend/src/controllers/platform.controller.ts` - Use real inventory service
- `backend/src/services/platform-credentials.service.ts` - Use Prisma
- `desktop/src/store/inventoryStore.ts` - Connect to API
- `desktop/src/store/authStore.ts` - Real authentication
- `desktop/src/pages/LoginPage.tsx` - Real login

## Dependencies to Add

```json
{
  "@prisma/client": "^5.7.0",
  "prisma": "^5.7.0",
  "pg": "^8.11.0",
  "multer": "^1.4.5-lts.1",
  "@types/multer": "^1.4.11"
}
```

## Environment Variables Needed

```env
DATABASE_URL=postgresql://user:password@localhost:5432/llatria
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Notes

- Start with local PostgreSQL database
- Use Prisma migrations for schema changes
- Store credentials encrypted in database
- Implement proper error handling throughout
- Add request validation middleware
- Consider rate limiting for production

### To-dos

- [x] Update desktop mockInventoryService to use async/await pattern
- [x] Update desktop inventoryStore interface to use async methods
- [x] Update desktop inventoryStore implementation to use async/await
- [x] Update all desktop call sites to use async/await (App.tsx, InventoryPage, CreateListingPage, EditListingPage, InventoryItemDetails)