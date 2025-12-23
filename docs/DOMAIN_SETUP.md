# Domain Setup Guide for Llatria Multi-Tenant Stores

## Overview

Llatria uses a multi-tenant architecture where each user gets their own store. There are several approaches to domain setup:

## Option 1: Subdomain-Based (Recommended)

### Architecture
- **Main domain**: `llatria.com` - Marketing site and app
- **User stores**: `{storename}.llatria.com` - Each user's store
- **Example**: `mystore.llatria.com`, `pawnshop.llatria.com`

### What You Need
1. **Purchase `llatria.com`** (and optionally `llatria.io`, `.net`, etc. for brand protection)
2. **DNS Configuration**:
   - A record for `llatria.com` → Your server IP
   - Wildcard CNAME: `*.llatria.com` → `llatria.com` (or your CDN)

### Backend Implementation
The backend needs to:
1. Extract subdomain from request headers
2. Look up user by subdomain/store identifier
3. Route to appropriate store

### Example DNS Setup (Cloudflare/Route53)
```
Type    Name              Value
A       @                 YOUR_SERVER_IP
CNAME   *                 llatria.com
A       www               YOUR_SERVER_IP
```

## Option 2: Path-Based (Current Implementation)

### Architecture
- **Main domain**: `llatria.com` - Marketing site
- **User stores**: `llatria.com/{userId}/store` or `llatria.com/{storename}/store`
- **Example**: `llatria.com/mystore/store`, `llatria.com/abc123/store`

### Pros
- ✅ No wildcard DNS needed
- ✅ Works immediately
- ✅ Easier to implement
- ✅ Can use any domain

### Cons
- ❌ Less professional URLs
- ❌ Harder to remember
- ❌ Not as branded

## Option 3: Custom Domains (Premium Feature)

### Architecture
- Users can connect their own domains (e.g., `mystore.com`)
- DNS points to your server
- Backend maps custom domain to user

### Implementation
1. User adds custom domain in settings
2. You provide DNS instructions (CNAME to your server)
3. Backend stores domain → userId mapping
4. Request routing checks custom domain first, then subdomain

## Recommended Setup for Production

### Phase 1: Start with Path-Based (Current)
- Use `llatria.com/{userId}/store` for now
- Quick to implement
- No DNS changes needed

### Phase 2: Add Subdomain Support
- Purchase `llatria.com`
- Set up wildcard DNS
- Update backend to handle subdomains
- Migrate users to subdomains

### Phase 3: Add Custom Domains (Optional)
- Premium feature for power users
- Allow users to connect their own domains

## Backend Changes Needed for Subdomains

### 1. Middleware to Extract Subdomain
```typescript
// backend/src/middleware/subdomain.middleware.ts
export function extractSubdomain(req: Request, res: Response, next: NextFunction) {
  const hostname = req.get('host') || '';
  const parts = hostname.split('.');
  
  // Check if it's a subdomain (not main domain)
  if (parts.length > 2 && parts[0] !== 'www') {
    req.storeIdentifier = parts[0]; // e.g., "mystore" from "mystore.llatria.com"
  }
  
  next();
}
```

### 2. Update Website Controller
```typescript
// Use subdomain from request if available
const storeIdentifier = req.storeIdentifier || req.params.storeId || req.query.storeId;
```

### 3. Add Store Identifier to User Model
```prisma
model User {
  // ... existing fields
  storeIdentifier String? @unique // e.g., "mystore" for mystore.llatria.com
  customDomain    String? @unique // e.g., "mystore.com"
}
```

## DNS Configuration Examples

### Cloudflare
1. Add domain `llatria.com`
2. Add A record: `@` → Your server IP
3. Add CNAME: `*` → `llatria.com` (wildcard for subdomains)
4. Enable proxy (optional, for DDoS protection)

### AWS Route53
1. Create hosted zone for `llatria.com`
2. Add A record: `@` → Your server IP
3. Add A record: `*` → Your server IP (wildcard)

### DigitalOcean/Other
Similar setup - add wildcard DNS record pointing to your server.

## Server Configuration

### Nginx Example
```nginx
server {
    listen 80;
    server_name *.llatria.com llatria.com;
    
    location / {
        proxy_pass http://localhost:5174;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Vercel/Netlify
- Add `llatria.com` as domain
- Configure wildcard subdomain
- Use middleware to route based on subdomain

## Cost Considerations

### Domain Purchase
- `llatria.com`: ~$10-15/year
- Additional TLDs (optional): ~$10-50/year each

### DNS/Hosting
- Cloudflare: Free (with limitations) or $20/month (Pro)
- AWS Route53: ~$0.50/month per hosted zone + queries
- Other DNS providers: Usually free with domain purchase

## Security Considerations

1. **Subdomain Validation**: Verify subdomain belongs to valid user
2. **Rate Limiting**: Per-subdomain rate limiting
3. **SSL Certificates**: Wildcard SSL cert for `*.llatria.com`
4. **CORS**: Configure CORS for subdomains

## Migration Path

1. **Current**: Path-based (`/{userId}/store`)
2. **Phase 1**: Add subdomain support, keep path-based as fallback
3. **Phase 2**: Migrate users to subdomains
4. **Phase 3**: Add custom domain support

## Testing Locally

For local development, you can use:
- `/etc/hosts` to map subdomains to localhost
- Or use path-based routing (current implementation)

```bash
# /etc/hosts
127.0.0.1 mystore.llatria.local
127.0.0.1 llatria.local
```

Then access: `http://mystore.llatria.local:5174`

## Next Steps

1. **Immediate**: Continue with path-based routing (already implemented)
2. **Short-term**: Purchase `llatria.com` domain
3. **Medium-term**: Implement subdomain extraction middleware
4. **Long-term**: Add custom domain support for premium users






