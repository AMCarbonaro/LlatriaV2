# Llatria Backend Architecture Plan

## Overview

Complete backend system to enable real-time synchronization between desktop and mobile applications, with full API integration for inventory management, AI services, and multi-platform posting.

---

## Technology Stack

### Core Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js or Fastify (lightweight, fast)
- **Database**: PostgreSQL (primary) + Redis (caching/sessions)
- **ORM**: Prisma (type-safe database access)
- **Authentication**: JWT tokens + refresh tokens
- **File Storage**: AWS S3 / Cloudflare R2 (for images)
- **Real-time**: WebSockets (Socket.io) for live sync

### External Services
- **AI/ML**: OpenAI GPT-4 Vision API or Google Gemini Vision
- **Image Processing**: Sharp (server-side) or Cloudinary
- **Email**: SendGrid or Resend
- **Analytics**: Optional (PostHog, Mixpanel)

### Infrastructure
- **Hosting**: Railway, Render, or AWS
- **CDN**: Cloudflare (for static assets)
- **Monitoring**: Sentry (error tracking)
- **Logging**: Winston + CloudWatch

---

## Database Schema

### Core Tables

#### `users`
```sql
- id: UUID (primary key)
- email: String (unique)
- password_hash: String
- name: String
- created_at: Timestamp
- updated_at: Timestamp
- last_login: Timestamp
- is_active: Boolean
```

#### `inventory_items`
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key -> users.id)
- title: String
- description: Text
- price: Decimal(10, 2)
- condition: Enum (new, like_new, used, fair, poor)
- category: String
- status: Enum (active, sold, draft)
- created_at: Timestamp
- updated_at: Timestamp
- sold_at: Timestamp (nullable)
```

#### `inventory_images`
```sql
- id: UUID (primary key)
- item_id: UUID (foreign key -> inventory_items.id)
- url: String (S3/R2 URL)
- order: Integer (for image ordering)
- created_at: Timestamp
```

#### `ai_data`
```sql
- id: UUID (primary key)
- item_id: UUID (foreign key -> inventory_items.id, unique)
- recognized_item: String
- confidence: Decimal(3, 2)
- market_price: Decimal(10, 2)
- suggested_price: Decimal(10, 2)
- description: Text
- category: String
- condition: Enum
- brand: String (nullable)
- model: String (nullable)
- year: Integer (nullable)
- color: String (nullable)
- size: String (nullable)
- dimensions: JSONB (flexible schema)
- specifications: JSONB
- similar_items: JSONB
- research_notes: Text
- created_at: Timestamp
```

#### `platform_postings`
```sql
- id: UUID (primary key)
- item_id: UUID (foreign key -> inventory_items.id)
- platform: Enum (facebook, ebay, website)
- status: Enum (idle, posting, posted, error)
- external_id: String (nullable) - ID from platform API
- external_url: String (nullable) - URL of posted listing
- error_message: Text (nullable)
- posted_at: Timestamp (nullable)
- created_at: Timestamp
- updated_at: Timestamp
```

#### `platform_credentials`
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key -> users.id)
- platform: Enum (facebook, ebay, website)
- access_token: String (encrypted)
- refresh_token: String (encrypted, nullable)
- expires_at: Timestamp (nullable)
- is_active: Boolean
- created_at: Timestamp
- updated_at: Timestamp
```

#### `sync_events`
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key -> users.id)
- device_id: String (desktop/mobile identifier)
- event_type: Enum (create, update, delete)
- entity_type: String (inventory_item, etc.)
- entity_id: UUID
- data: JSONB (snapshot of changes)
- timestamp: Timestamp
- synced: Boolean (for conflict resolution)
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login (returns JWT)
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/logout            - Logout (invalidate tokens)
GET    /api/auth/me                - Get current user
```

### Inventory Management

```
GET    /api/inventory              - List all items (with filters, pagination)
GET    /api/inventory/:id          - Get single item
POST   /api/inventory              - Create new item
PUT    /api/inventory/:id          - Update item
DELETE /api/inventory/:id          - Delete item
PATCH  /api/inventory/:id/sold     - Mark item as sold
POST   /api/inventory/bulk         - Bulk operations (delete, mark sold)
```

### Images

```
POST   /api/inventory/:id/images   - Upload image(s)
DELETE /api/inventory/:id/images/:imageId - Delete image
PUT    /api/inventory/:id/images/reorder - Reorder images
```

### AI Services

```
POST   /api/ai/recognize           - Analyze image and generate listing data
GET    /api/ai/suggestions/:itemId - Get pricing suggestions
```

### Platform Posting

```
GET    /api/platforms/credentials  - Get platform credentials
POST   /api/platforms/credentials  - Save platform credentials
POST   /api/platforms/:platform/connect - OAuth flow
POST   /api/inventory/:id/post/:platform - Post item to platform
GET    /api/inventory/:id/postings - Get posting status for item
DELETE /api/inventory/:id/postings/:platform - Remove from platform
```

### Sync

```
GET    /api/sync/last-sync         - Get last sync timestamp
POST   /api/sync/push              - Push local changes
POST   /api/sync/pull              - Pull remote changes
GET    /api/sync/conflicts         - Get sync conflicts
POST   /api/sync/resolve           - Resolve conflicts
```

### WebSocket Events

```
Connection: ws://api.llatria.com/sync
Events:
  - inventory:created
  - inventory:updated
  - inventory:deleted
  - posting:status-changed
  - sync:conflict
```

---

## Authentication & Security

### JWT Strategy
- **Access Token**: Short-lived (15 minutes), contains user ID and permissions
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie
- **Token Rotation**: Refresh tokens rotate on use

### Security Measures
- Password hashing with bcrypt (10 rounds)
- Rate limiting (100 req/min per IP, 1000 req/min per user)
- CORS configuration (whitelist desktop/mobile origins)
- Input validation (Zod schemas)
- SQL injection prevention (Prisma parameterized queries)
- XSS protection (sanitize user inputs)
- File upload validation (type, size limits)

---

## Real-Time Sync Strategy

### Conflict Resolution
1. **Last-Write-Wins (LWW)**: Simple, but may lose data
2. **Operational Transformation**: Complex, but preserves all changes
3. **Hybrid**: LWW for simple fields, merge for complex objects

**Recommended**: Hybrid approach
- Use `updated_at` timestamp for conflict detection
- For simple fields (title, price): Last write wins
- For complex fields (images, platforms): Merge arrays
- Flag conflicts for user review

### Sync Flow
```
1. Client connects → WebSocket connection established
2. Client sends device_id and last_sync_timestamp
3. Server sends all changes since last_sync
4. Client applies changes locally
5. Client sends any local changes not yet synced
6. Server processes and broadcasts to other devices
7. Continuous: Server pushes changes in real-time
```

### Offline Support
- Queue local changes when offline
- Sync queue when connection restored
- Show sync status indicator
- Handle conflicts gracefully

---

## File Storage Architecture

### Image Upload Flow
```
1. Client uploads image → POST /api/inventory/:id/images
2. Server validates (type, size)
3. Server processes image (resize, optimize) with Sharp
4. Upload to S3/R2 with unique filename
5. Store metadata in database
6. Return URL to client
```

### Image Optimization
- **Thumbnails**: 150x150px for lists
- **Medium**: 800x800px for detail views
- **Full**: Original (max 2048x2048px)
- **Format**: WebP with JPEG fallback
- **Compression**: 80% quality

### Storage Structure
```
s3://llatria-bucket/
  users/
    {user_id}/
      inventory/
        {item_id}/
          original_{timestamp}.webp
          medium_{timestamp}.webp
          thumbnail_{timestamp}.webp
```

---

## AI Integration

### Image Recognition Service
```typescript
interface AIService {
  recognizeItem(imageUrl: string): Promise<AIData>;
  suggestPrice(item: InventoryItem): Promise<number>;
  generateDescription(item: InventoryItem): Promise<string>;
}
```

### Implementation Options
1. **OpenAI GPT-4 Vision**
   - High accuracy
   - Good at recognizing items and generating descriptions
   - Cost: ~$0.01-0.03 per image

2. **Google Gemini Vision**
   - Competitive accuracy
   - Lower cost than GPT-4
   - Good API

3. **Hybrid Approach**
   - Use GPT-4 for complex items
   - Use Gemini for simple items
   - Cache results to reduce API calls

### Caching Strategy
- Cache AI results by image hash
- Store in Redis (24 hour TTL)
- Reuse for similar items

---

## Platform Integration

### Facebook Marketplace
- **API**: Facebook Graph API
- **OAuth**: Facebook Login
- **Endpoints**: 
  - Create listing
  - Update listing
  - Delete listing
  - Get listing status

### eBay
- **API**: eBay Trading API / Sell API
- **OAuth**: eBay OAuth 2.0
- **Endpoints**:
  - Create listing
  - Revise listing
  - End listing
  - Get listing status

### Website (Custom)
- **Generation**: Static site generator (Next.js/Remix)
- **Hosting**: Vercel/Netlify
- **CMS**: Headless CMS for dynamic content
- **Deployment**: Auto-deploy on item changes

---

## API Service Layer Architecture

### Service Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   │   ├── inventory.service.ts
│   │   ├── ai.service.ts
│   │   ├── platform.service.ts
│   │   └── sync.service.ts
│   ├── repositories/     # Data access layer
│   ├── models/          # Database models (Prisma)
│   ├── middleware/      # Auth, validation, etc.
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── websocket/       # WebSocket handlers
├── prisma/
│   └── schema.prisma    # Database schema
└── tests/              # Test files
```

---

## Implementation Phases

### Phase 1: Core Backend (Week 1-2)
- [ ] Set up Node.js/Express project
- [ ] Configure PostgreSQL database
- [ ] Set up Prisma with schema
- [ ] Implement authentication (JWT)
- [ ] Create inventory CRUD endpoints
- [ ] Basic image upload to S3
- [ ] Write unit tests

### Phase 2: Real-Time Sync (Week 3)
- [ ] Set up WebSocket server (Socket.io)
- [ ] Implement sync endpoints
- [ ] Build conflict resolution logic
- [ ] Add offline queue support
- [ ] Test multi-device sync

### Phase 3: AI Integration (Week 4)
- [ ] Integrate OpenAI/Gemini API
- [ ] Build image recognition service
- [ ] Add caching layer
- [ ] Implement price suggestions
- [ ] Error handling & retries

### Phase 4: Platform Integration (Week 5-6)
- [ ] Facebook Marketplace OAuth & API
- [ ] eBay OAuth & API
- [ ] Website generation system
- [ ] Posting status tracking
- [ ] Error handling & retries

### Phase 5: Client Integration (Week 7)
- [ ] Update desktop service layer
- [ ] Update mobile service layer
- [ ] Replace mock services with API calls
- [ ] Add offline support
- [ ] Test end-to-end

### Phase 6: Polish & Deploy (Week 8)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Deploy to production

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/llatria
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=llatria-images

# AI Services
OPENAI_API_KEY=your-key
GEMINI_API_KEY=your-key

# Platform APIs
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-secret
EBAY_APP_ID=your-app-id
EBAY_DEV_ID=your-dev-id
EBAY_CERT_ID=your-cert-id

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://app.llatria.com,https://mobile.llatria.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Validation schemas

### Integration Tests
- API endpoints
- Database operations
- External API mocks

### E2E Tests
- Full user flows
- Multi-device sync
- Platform posting

### Load Testing
- Use k6 or Artillery
- Test 1000+ concurrent users
- Measure response times

---

## Deployment

### Recommended Platforms

1. **Railway** (Easiest)
   - Auto-deploy from GitHub
   - PostgreSQL included
   - Redis available
   - $5-20/month

2. **Render**
   - Similar to Railway
   - Good free tier
   - Easy scaling

3. **AWS** (Most control)
   - EC2 for server
   - RDS for PostgreSQL
   - ElastiCache for Redis
   - S3 for images
   - More complex setup

### CI/CD Pipeline
```
GitHub → GitHub Actions → Run Tests → Build → Deploy to Staging → Deploy to Production
```

---

## Monitoring & Logging

### Error Tracking
- Sentry for error monitoring
- Alert on critical errors
- Track error rates

### Performance Monitoring
- Response time tracking
- Database query performance
- API rate limits

### Logging
- Winston for structured logging
- Log levels: error, warn, info, debug
- Store logs in CloudWatch or similar

---

## Cost Estimates

### Development (Monthly)
- **Hosting**: $20-50 (Railway/Render)
- **Database**: $0-25 (included or separate)
- **Storage**: $5-10 (S3/R2 for images)
- **AI API**: $50-200 (depends on usage)
- **Total**: ~$75-285/month

### Production (Monthly, 1000 users)
- **Hosting**: $50-100
- **Database**: $25-50
- **Storage**: $20-50
- **AI API**: $200-500
- **CDN**: $10-20
- **Total**: ~$305-720/month

---

## Next Steps

1. **Review this plan** - Make adjustments as needed
2. **Set up development environment** - Local PostgreSQL, Redis
3. **Start Phase 1** - Build core backend
4. **Iterate** - Build, test, deploy incrementally

---

## Questions to Consider

1. **Database**: PostgreSQL vs MongoDB? (PostgreSQL recommended for relational data)
2. **Hosting**: Cloud vs self-hosted? (Cloud recommended for start)
3. **AI Service**: OpenAI vs Gemini vs both? (Start with one, add more later)
4. **Image Storage**: S3 vs Cloudflare R2? (R2 is cheaper, S3 more established)
5. **Real-time**: WebSockets vs Server-Sent Events? (WebSockets for bidirectional)

---

This plan provides a complete, production-ready backend architecture. Ready to start implementation when you are!



