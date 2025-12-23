# Llatria API Status Report

**Generated:** December 5, 2025

## Service Status

### ✅ Running Services

1. **Docker Containers**
   - PostgreSQL: `llatria-postgres` - Running and healthy
   - Redis: `llatria-redis` - Running and healthy

2. **Backend API Server**
   - Status: ✅ Running
   - URL: `http://localhost:3001`
   - Health Check: `http://localhost:3001/health` ✅
   - Port: 3001

3. **Database**
   - Type: PostgreSQL 15
   - Container: `llatria-postgres`
   - Status: ⚠️ Connection issue detected (needs migration)

---

## Available API Endpoints

### 1. Health & Status
- **GET** `/health` - Server health check ✅ Working

### 2. Authentication (`/api/auth`)
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - User login ⚠️ Database connection needed
- **POST** `/api/auth/refresh` - Refresh JWT token
- **GET** `/api/auth/me` - Get current user (requires auth)

### 3. Inventory Management (`/api/inventory`)
All require authentication:
- **GET** `/api/inventory` - List all items (with pagination, filters)
- **GET** `/api/inventory/:id` - Get single item
- **POST** `/api/inventory` - Create new item
- **PUT** `/api/inventory/:id` - Update item
- **DELETE** `/api/inventory/:id` - Delete item
- **PATCH** `/api/inventory/:id/sold` - Mark item as sold
- **POST** `/api/inventory/bulk` - Bulk operations (delete, markSold)

### 4. AI Services (`/api/ai`)
All require authentication:
- **POST** `/api/ai/recognize` - Recognize item from image (Google Vision API)
- **GET** `/api/ai/suggestions` - Get price suggestions
- **GET** `/api/ai/search` - Search products (Google Custom Search)
- **GET** `/api/ai/price-comparison` - Compare prices across platforms

### 5. Platform Integration (`/api/platforms`)
- **GET** `/api/platforms/:platform/status` - Check platform connection status
- **GET** `/api/platforms/ebay/connect` - Initiate eBay OAuth
- **GET** `/api/platforms/ebay/callback` - eBay OAuth callback (public)
- **DELETE** `/api/platforms/:platform/disconnect` - Disconnect platform
- **POST** `/api/platforms/inventory/:id/post/ebay` - Post item to eBay
- **PUT** `/api/platforms/inventory/:id/post/ebay` - Update eBay listing
- **DELETE** `/api/platforms/inventory/:id/post/ebay` - Delete eBay listing
- **GET** `/api/platforms/inventory/:id/post/ebay/status` - Get listing status

### 6. Website (`/api/website`)
- **GET** `/api/website/:storeId/products` - Get store products (public)
- **GET** `/api/website/:storeId/products/:id` - Get single product (public)
- **GET** `/api/website/products?storeId=:storeId` - Alternative route (public)
- **GET** `/api/website/products/:id?storeId=:storeId` - Alternative route (public)
- **POST** `/api/website/inventory/:id/post` - Post to website (auth required)
- **DELETE** `/api/website/inventory/:id/post` - Remove from website (auth required)

---

## Integrated Services

### Backend Services

1. **eBay Service** (`ebay.service.ts`)
   - OAuth authentication
   - Listing creation/update/deletion
   - Listing status checks

2. **Google Lens Service** (`google-lens.service.ts`)
   - Image recognition using Google Vision API
   - Product identification from photos

3. **Google Shopping Service** (`google-shopping.service.ts`)
   - Product search
   - Price comparison
   - Market research

4. **Inventory Service** (`inventory.service.ts`)
   - CRUD operations for inventory items
   - Image management
   - AI data integration

5. **User Service** (`user.service.ts`)
   - User registration
   - Authentication
   - User management

6. **Platform Credentials Service** (`platform-credentials.service.ts`)
   - Secure storage of platform credentials
   - OAuth token management

---

## External API Integrations

### Google APIs
- **Google Vision API** - Image recognition and product identification
- **Google Custom Search API** - Product search and price comparison
- **Required**: `GOOGLE_API_KEY` environment variable

### eBay API
- **eBay OAuth 2.0** - User authentication
- **eBay Sell API** - Listing management
- **Required**: `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` environment variables

### Facebook Marketplace
- **Automation Service** - Desktop app automation (via Electron)
- **Note**: Uses browser automation, not direct API

---

## Current Issues

### ⚠️ Database Connection
- **Status**: Database container is running but Prisma cannot connect
- **Error**: "User was denied access on the database `(not available)`"
- **Fix Needed**: Run database migrations with `npx prisma db push` or `npx prisma migrate dev`

### ⚠️ Desktop App
- **Status**: React dev server has PostCSS dependency conflicts
- **Electron**: Running but cannot connect to React server
- **Fix Needed**: Resolve PostCSS/Tailwind dependency issues

---

## Test Credentials

- **Email**: `test@llatria.com`
- **Password**: `test1234`

**Note**: User must exist in database. Run `npm run create-test-user` in backend directory to create.

---

## Environment Variables Required

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/llatria

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google APIs
GOOGLE_API_KEY=your-google-api-key

# eBay API
EBAY_CLIENT_ID=your-ebay-client-id
EBAY_CLIENT_SECRET=your-ebay-client-secret
EBAY_REDIRECT_URI=http://localhost:3001/api/platforms/ebay/callback

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Website
WEBSITE_URL=http://localhost:5173
```

---

## Next Steps

1. ✅ Fix database connection - Run migrations
2. ✅ Create test user if needed
3. ✅ Test authentication endpoints
4. ✅ Test inventory CRUD operations
5. ✅ Configure Google API keys for AI features
6. ✅ Configure eBay API credentials for platform integration

---

## API Documentation

Full API documentation available in: `API_DOCUMENTATION.md`





