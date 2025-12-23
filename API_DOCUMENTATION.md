# Llatria API Documentation

## Base URL
- **Development**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/health`

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## API Endpoints

### 1. Authentication (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ email, password, name }`
- **Response**: `{ user, token, refreshToken }`

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user, token, refreshToken }`

#### Refresh Token
- **POST** `/api/auth/refresh`
- **Body**: `{ refreshToken }`
- **Response**: `{ token, refreshToken }`

#### Get Current User
- **GET** `/api/auth/me`
- **Auth**: Required
- **Response**: `{ user }`

---

### 2. Inventory Management (`/api/inventory`)

All inventory endpoints require authentication.

#### Get All Items
- **GET** `/api/inventory`
- **Query Params**: 
  - `page` (optional)
  - `limit` (optional)
  - `status` (optional: available, sold, pending)
  - `category` (optional)
  - `search` (optional)
- **Response**: `{ items: [], total, page, limit }`

#### Get Single Item
- **GET** `/api/inventory/:id`
- **Response**: `{ item }`

#### Create Item
- **POST** `/api/inventory`
- **Body**: `{ name, description, price, category, images, condition, ... }`
- **Response**: `{ item }`

#### Update Item
- **PUT** `/api/inventory/:id`
- **Body**: `{ name, description, price, ... }` (partial updates allowed)
- **Response**: `{ item }`

#### Delete Item
- **DELETE** `/api/inventory/:id`
- **Response**: `{ success: true }`

#### Mark as Sold
- **PATCH** `/api/inventory/:id/sold`
- **Response**: `{ item }`

#### Bulk Operations
- **POST** `/api/inventory/bulk`
- **Body**: `{ operation: 'delete' | 'markSold', ids: string[] }`
- **Response**: `{ success: true, count }`

---

### 3. AI Services (`/api/ai`)

All AI endpoints require authentication.

#### Recognize Item from Image
- **POST** `/api/ai/recognize`
- **Body**: `{ image: base64 or file }`
- **Response**: `{ name, category, description, suggestedPrice, ... }`

#### Get Price Suggestions
- **GET** `/api/ai/suggestions`
- **Query Params**: `itemName`, `category`, `condition`
- **Response**: `{ suggestions: [{ platform, price, url }] }`

#### Search Products
- **GET** `/api/ai/search`
- **Query Params**: `query`, `category` (optional)
- **Response**: `{ products: [] }`

#### Price Comparison
- **GET** `/api/ai/price-comparison`
- **Query Params**: `itemName`, `category`
- **Response**: `{ comparisons: [{ platform, averagePrice, listings }] }`

---

### 4. Platform Integration (`/api/platforms`)

All platform endpoints require authentication (except OAuth callback).

#### Get Platform Status
- **GET** `/api/platforms/:platform/status`
- **Platform**: `ebay`, `facebook`, etc.
- **Response**: `{ connected: boolean, username?, ... }`

#### Connect eBay
- **GET** `/api/platforms/ebay/connect`
- **Response**: Redirects to eBay OAuth

#### eBay OAuth Callback
- **GET** `/api/platforms/ebay/callback`
- **Query Params**: `code`, `state`
- **Response**: `{ success: true }`

#### Disconnect Platform
- **DELETE** `/api/platforms/:platform/disconnect`
- **Response**: `{ success: true }`

#### Post to eBay
- **POST** `/api/platforms/inventory/:id/post/ebay`
- **Body**: `{ title?, description?, price?, ... }` (optional overrides)
- **Response**: `{ listingId, url, success: true }`

#### Update eBay Listing
- **PUT** `/api/platforms/inventory/:id/post/ebay`
- **Body**: `{ title?, description?, price?, ... }`
- **Response**: `{ listingId, url, success: true }`

#### Delete eBay Listing
- **DELETE** `/api/platforms/inventory/:id/post/ebay`
- **Response**: `{ success: true }`

#### Get eBay Listing Status
- **GET** `/api/platforms/inventory/:id/post/ebay/status`
- **Response**: `{ listingId, url, status, ... }`

---

### 5. Website (`/api/website`)

#### Get Store Products (Public)
- **GET** `/api/website/:storeId/products`
- **GET** `/api/website/products?storeId=:storeId`
- **Response**: `{ products: [] }`

#### Get Single Product (Public)
- **GET** `/api/website/:storeId/products/:id`
- **GET** `/api/website/products/:id?storeId=:storeId`
- **Response**: `{ product }`

#### Post to Website (Authenticated)
- **POST** `/api/website/inventory/:id/post`
- **Auth**: Required
- **Body**: `{ title?, description?, ... }` (optional overrides)
- **Response**: `{ url, success: true }`

#### Remove from Website (Authenticated)
- **DELETE** `/api/website/inventory/:id/post`
- **Auth**: Required
- **Response**: `{ success: true }`

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Test User Credentials

- **Email**: `test@llatria.com`
- **Password**: `test1234`

---

## Environment Variables

Required backend environment variables:
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `GOOGLE_API_KEY` - For AI recognition and search
- `EBAY_CLIENT_ID` - eBay API client ID
- `EBAY_CLIENT_SECRET` - eBay API client secret
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)





