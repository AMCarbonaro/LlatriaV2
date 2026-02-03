# Llatria v2 - Multi-Platform Pawn Shop Listing System

## Overview

Llatria enables pawn shop owners to list items across multiple platforms (Facebook Marketplace, eBay, and their own website) with a single photo snap and AI-powered listing generation.

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. CAPTURE                                                              │
│  ─────────                                                               │
│  • Open mobile app → Camera                                              │
│  • Snap photo of item                                                    │
│  • Enter product name (e.g., "MacBook Pro M2 16gb")                     │
│  • Tap "Generate Listing"                                                │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. AI PROCESSING                                                        │
│  ────────────────                                                        │
│  • Google Vision/Lens identifies item details                           │
│  • Google Search finds specs, descriptions                              │
│  • eBay API gets market prices (sold listings)                          │
│  • Google Images finds additional product photos                        │
│  • AI generates complete listing with all fields                        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. REVIEW & EDIT (Mobile + Desktop real-time sync)                     │
│  ──────────────────                                                      │
│  • View AI-generated listing data                                       │
│  • See suggested price based on market data                             │
│  • Edit any field (title, description, price, condition, category)      │
│  • Select/deselect additional images found by AI                        │
│  • Choose platforms: Facebook / eBay / Website (or all)                 │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. POST                                                                 │
│  ─────                                                                   │
│  • "Post to All" → Queues for all platforms                             │
│  • Individual buttons → Post to specific platform                       │
│  • Facebook: Opens visible window, fills form, uploads photos           │
│  • eBay: API call (fully automated)                                     │
│  • Website: Instant publish to shop subdomain                           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. MANAGE                                                               │
│  ────────                                                                │
│  • View all inventory in sidebar                                        │
│  • Filter by status: Unposted / Posting / Active / Sold                 │
│  • Mark as sold → Removes from all platforms                            │
│  • Edit listing → Updates across platforms                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Listing Statuses

| Status | Description |
|--------|-------------|
| **Unposted** | Draft, not yet posted anywhere |
| **Posting** | In queue, being posted to platforms |
| **Active** | Live on 1+ platforms |
| **Sold** | Marked sold, removed from all platforms |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
├────────────────┬────────────────┬───────────────────────────────────────┤
│    Mobile      │    Desktop     │              Website                   │
│  (React Native)│   (Electron)   │    (Next.js - per subdomain)          │
│                │                │    shopname.llatria.com               │
└───────┬────────┴───────┬────────┴──────────────┬────────────────────────┘
        │                │                        │
        └────────────────┼────────────────────────┘
                         │
                    WebSocket + REST
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js/Fastify)                        │
│                              AWS ECS/EC2                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Auth   │  │  Inventory   │  │     AI     │  │  Posting Queue   │  │
│  │ Service  │  │   Service    │  │  Service   │  │  (Bull + Redis)  │  │
│  └──────────┘  └──────────────┘  └────────────┘  └──────────────────┘  │
│                                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Shop    │  │   Listing    │  │   Image    │  │    Real-time     │  │
│  │ Service  │  │   Service    │  │  Service   │  │   (Socket.io)    │  │
│  └──────────┘  └──────────────┘  └────────────┘  └──────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
        │                │                │                │
        ▼                ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐
│  PostgreSQL  │ │    Redis     │ │   AWS S3     │ │   External APIs      │
│  (AWS RDS)   │ │ (ElastiCache)│ │  (Images)    │ │  • Google Vision     │
│              │ │              │ │              │ │  • Google Search     │
│  • Users     │ │  • Sessions  │ │  • Product   │ │  • eBay API          │
│  • Shops     │ │  • Job Queue │ │    images    │ │  • (FB Automation)   │
│  • Listings  │ │  • Pub/Sub   │ │  • Thumbnails│ │                      │
│  • Platforms │ │              │ │              │ │                      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘
```

## Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Fastify (fast, TypeScript-friendly)
- **ORM:** Prisma
- **Database:** PostgreSQL (AWS RDS)
- **Cache/Queue:** Redis (AWS ElastiCache) + Bull for job queue
- **Real-time:** Socket.io
- **Storage:** AWS S3 + CloudFront CDN
- **Auth:** JWT + refresh tokens

### Desktop App
- **Framework:** Electron + React + Vite
- **State:** Zustand (keep from v1)
- **Styling:** Tailwind CSS
- **FB Automation:** Electron BrowserWindow with Puppeteer-like control

### Mobile App
- **Framework:** React Native + Expo
- **Camera:** expo-camera
- **State:** Zustand (shared logic with desktop)
- **Real-time:** Socket.io client

### Website (Shop Storefronts)
- **Framework:** Next.js 14 (App Router)
- **Hosting:** AWS (ECS or Amplify)
- **Subdomains:** Route53 wildcard + dynamic routing

## Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  shops     Shop[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Shop {
  id          String    @id @default(cuid())
  name        String
  subdomain   String    @unique
  description String?
  logo        String?
  location    String?
  owner       User      @relation(fields: [ownerId], references: [id])
  ownerId     String
  listings    Listing[]
  settings    ShopSettings?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ShopSettings {
  id              String  @id @default(cuid())
  shop            Shop    @relation(fields: [shopId], references: [id])
  shopId          String  @unique
  facebookLinked  Boolean @default(false)
  facebookToken   String?
  ebayLinked      Boolean @default(false)
  ebayToken       String?
  defaultMarkup   Float   @default(1.2) // 20% markup on suggested price
  autoPost        Boolean @default(false)
}

model Listing {
  id              String        @id @default(cuid())
  shop            Shop          @relation(fields: [shopId], references: [id])
  shopId          String
  
  // Core fields
  title           String
  description     String
  price           Float
  condition       Condition     @default(USED)
  category        String?
  
  // Images
  images          Image[]
  
  // AI data
  aiData          Json?         // Store full AI response
  suggestedPrice  Float?
  marketPrice     Float?
  
  // Platform status
  status          ListingStatus @default(UNPOSTED)
  platforms       Platform[]
  
  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  soldAt          DateTime?
}

model Image {
  id        String   @id @default(cuid())
  listing   Listing  @relation(fields: [listingId], references: [id])
  listingId String
  url       String
  isAiFound Boolean  @default(false) // true if found by AI, false if user uploaded
  isPrimary Boolean  @default(false)
  order     Int      @default(0)
}

model Platform {
  id          String        @id @default(cuid())
  listing     Listing       @relation(fields: [listingId], references: [id])
  listingId   String
  type        PlatformType
  externalId  String?       // FB listing ID, eBay item ID, etc.
  url         String?
  status      PlatformStatus @default(PENDING)
  postedAt    DateTime?
  error       String?
}

enum Condition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  POOR
}

enum ListingStatus {
  UNPOSTED
  POSTING
  ACTIVE
  SOLD
}

enum PlatformType {
  FACEBOOK
  EBAY
  WEBSITE
}

enum PlatformStatus {
  PENDING
  POSTING
  ACTIVE
  FAILED
  REMOVED
}
```

## UI Design Principles

### General
- **Clean, minimal interface** — reduce clutter
- **Dark mode first** — easier on eyes for long sessions
- **Large touch targets** — works well on mobile
- **Real-time feedback** — loading states, progress indicators
- **Keyboard shortcuts** — power users can work fast

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                            [Theme] [User] │
│  │  Logo   │                      Search                              │
├──┴─────────┴────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌────────────────────────────────────────────────────┐ │
│ │              │ │                                                    │ │
│ │  INVENTORY   │ │                   MAIN AREA                        │ │
│ │  SIDEBAR     │ │                                                    │ │
│ │              │ │  • Listing details when item selected              │ │
│ │  [+ New]     │ │  • Create/Edit form when adding                    │ │
│ │              │ │  • Dashboard when nothing selected                 │ │
│ │  Filters:    │ │                                                    │ │
│ │  □ Unposted  │ │                                                    │ │
│ │  □ Posting   │ │                                                    │ │
│ │  □ Active    │ │                                                    │ │
│ │  □ Sold      │ │                                                    │ │
│ │              │ │                                                    │ │
│ │  ──────────  │ │                                                    │ │
│ │              │ │                                                    │ │
│ │  [Item 1]    │ │                                                    │ │
│ │  [Item 2]    │ │                                                    │ │
│ │  [Item 3]    │ │                                                    │ │
│ │  ...         │ │                                                    │ │
│ │              │ │                                                    │ │
│ └──────────────┘ └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│  Queue: 3 items posting                              [Settings] [Help] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────┐
│  Llatria    [≡] [+] │
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │    Camera     │  │
│  │    Preview    │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  Product Name:      │
│  ┌───────────────┐  │
│  │ MacBook Pro   │  │
│  └───────────────┘  │
│                     │
│  [📷 Snap & Generate]│
│                     │
├─────────────────────┤
│ [📦] [📷] [📊] [⚙️]  │
│ Inv  Scan Dash  Set │
└─────────────────────┘
```

### Create/Edit Listing View
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back                          Create Listing                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  IMAGES                                                    [+ Add]│   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                        │   │
│  │  │ 📷  │ │ AI  │ │ AI  │ │ AI  │ │     │                        │   │
│  │  │User │ │Found│ │Found│ │Found│ │ +   │                        │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐   │
│  │  LISTING DETAILS            │  │  MARKET DATA                    │   │
│  │                             │  │                                 │   │
│  │  Title:                     │  │  Suggested Price: $849          │   │
│  │  ┌─────────────────────┐   │  │  Market Average:  $899          │   │
│  │  │ MacBook Pro 14" M2  │   │  │  Price Range: $750 - $1,100     │   │
│  │  └─────────────────────┘   │  │                                 │   │
│  │                             │  │  eBay Sold (30d): 127 items    │   │
│  │  Description:               │  │  Avg Days to Sell: 4.2         │   │
│  │  ┌─────────────────────┐   │  │                                 │   │
│  │  │ Apple MacBook Pro   │   │  │  ┌─────────────────────────┐   │   │
│  │  │ with M2 chip...     │   │  │  │  Price Distribution     │   │   │
│  │  └─────────────────────┘   │  │  │  ████████░░ $800-900    │   │   │
│  │                             │  │  │  ██████░░░░ $700-800    │   │   │
│  │  Price: $________           │  │  │  ████░░░░░░ $900-1000   │   │   │
│  │                             │  │  └─────────────────────────┘   │   │
│  │  Condition: [Used ▼]        │  │                                 │   │
│  │  Category:  [Electronics ▼] │  └─────────────────────────────────┘   │
│  └─────────────────────────────┘                                        │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  POST TO PLATFORMS                                                │   │
│  │                                                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │   │
│  │  │ ☑ Facebook  │  │ ☑ eBay      │  │ ☑ Website   │               │   │
│  │  │  Marketplace│  │             │  │             │               │   │
│  │  │  Local      │  │  Shipping   │  │  Both       │               │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │   │
│  │                                                                    │   │
│  │  [Post to Selected]                              [Save as Draft]  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up monorepo structure
- [ ] Backend API scaffolding (Fastify + Prisma)
- [ ] Database schema + migrations
- [ ] Auth system (JWT)
- [ ] Basic CRUD for shops/listings
- [ ] S3 image upload

### Phase 2: AI Integration (Week 2-3)
- [ ] Google Vision API integration
- [ ] Google Custom Search API (for descriptions/specs)
- [ ] eBay Browse API (for pricing data)
- [ ] Google Images search (for additional photos)
- [ ] AI listing generator

### Phase 3: Desktop App v2 (Week 3-4)
- [ ] New UI implementation
- [ ] Real-time sync (Socket.io)
- [ ] Fix Facebook automation
- [ ] Add eBay API posting
- [ ] Posting queue with progress

### Phase 4: Mobile App (Week 4-5)
- [ ] React Native + Expo setup
- [ ] Camera capture flow
- [ ] AI listing generation
- [ ] Real-time sync with desktop
- [ ] Full inventory management

### Phase 5: Website/Storefronts (Week 5-6)
- [ ] Next.js multi-tenant setup
- [ ] Subdomain routing
- [ ] Shop storefront pages
- [ ] Product detail pages with FB/eBay links
- [ ] SEO optimization

### Phase 6: Polish & Deploy (Week 6-7)
- [ ] AWS infrastructure (Terraform/CDK)
- [ ] CI/CD pipeline
- [ ] Testing
- [ ] Performance optimization
- [ ] Documentation

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Shops
- `GET /shops` - List user's shops
- `POST /shops` - Create shop
- `GET /shops/:id` - Get shop details
- `PATCH /shops/:id` - Update shop
- `DELETE /shops/:id` - Delete shop

### Listings
- `GET /shops/:shopId/listings` - List shop's listings
- `POST /shops/:shopId/listings` - Create listing
- `GET /listings/:id` - Get listing details
- `PATCH /listings/:id` - Update listing
- `DELETE /listings/:id` - Delete listing
- `POST /listings/:id/post` - Post to platforms
- `POST /listings/:id/sold` - Mark as sold

### AI
- `POST /ai/recognize` - Recognize item from image
- `POST /ai/generate-listing` - Generate full listing from image + name
- `GET /ai/price-suggestions` - Get pricing data

### Images
- `POST /images/upload` - Upload image to S3
- `DELETE /images/:id` - Delete image

### Real-time (Socket.io)
- `listing:created` - New listing created
- `listing:updated` - Listing updated
- `listing:status` - Listing status changed
- `posting:progress` - Posting progress update

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=llatria-images

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Google APIs
GOOGLE_VISION_API_KEY=...
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...

# eBay
EBAY_APP_ID=...
EBAY_CERT_ID=...
EBAY_DEV_ID=...
EBAY_OAUTH_TOKEN=...

# App
APP_URL=https://app.llatria.com
API_URL=https://api.llatria.com
```

## Next Steps

1. Review this plan with Anthony
2. Get API keys (eBay, Google)
3. Start Phase 1 implementation

---

*Last updated: 2026-02-03*
