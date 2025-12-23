# Scope of Work - Llatria Platform Completion

## Overview

This document outlines the remaining work needed to complete the Llatria platform. The platform enables users to manage inventory items and post them to multiple marketplaces (eBay, Facebook Marketplace, and custom website). The core infrastructure is in place, but several key integrations need to be finalized.

## Project Structure

- **Backend**: Node.js/Express with TypeScript (`/backend`)
- **Desktop App**: Electron + React (`/desktop`)
- **Mobile App**: React Native/Expo (`/mobile`)
- **Website**: React frontend (`/website`)

## 1. eBay API Integration - COMPLETE IMPLEMENTATION

### Current Status
- eBay service is implemented (`backend/src/services/ebay.service.ts`)
- OAuth flow is partially implemented
- Controllers have TODO comments for database integration

### Tasks Required

#### 1.1 Complete Database Integration
**File**: `backend/src/controllers/platform.controller.ts`

**Tasks**:
- Replace all `// TODO: Get item and eBay listing ID from database` comments with actual database queries
- Implement proper item retrieval using `inventoryService.getItem(userId, itemId)`
- Store `ebayListingId` (offer ID) and `ebayListingUrl` in the inventory item when posting succeeds
- Update item's `postingStatus.ebay` field to track listing state
- Implement proper error handling when item is not found

**Specific endpoints to complete**:
- `updateEBayListing()` (line ~247): Get item from database, retrieve stored `ebayListingId`, update listing
- `deleteEBayListing()` (line ~294): Get item from database, retrieve stored `ebayListingId`, delete listing
- `getEBayListingStatus()` (line ~346): Get item from database, retrieve stored `ebayListingId`, check status

**Expected Implementation Pattern**:
```typescript
// Example for updateEBayListing
const item = await inventoryService.getItem(userId, id);
if (!item || !item.ebayListingId) {
  return res.status(404).json({ success: false, error: 'eBay listing not found' });
}

const offerId = item.ebayListingId;
await ebayService.updateListing(accessToken, offerId, updates);

// Update item in database
await inventoryService.updateItem(userId, id, {
  // ... other updates
});
```

#### 1.2 Complete OAuth Callback Flow
**File**: `backend/src/controllers/platform.controller.ts`

**Tasks**:
- Verify the OAuth callback endpoint (`ebayCallback`) properly handles errors
- Ensure state parameter validation is secure
- Test token refresh flow when tokens expire
- Implement proper error responses

#### 1.3 Implement Listing Management Features
**Tasks**:
- **Category Mapping**: Improve category mapping in `convertToEBayListing()` method - currently uses hardcoded category IDs. Should:
  - Use eBay Category API to fetch available categories
  - Allow users to select/override categories
  - Store category mapping preferences per user
  
- **Fulfillment Policy Setup**: Currently uses `'default'` for fulfillment/payment/return policies. Should:
  - Allow users to configure their eBay policies
  - Create policies via eBay API if they don't exist
  - Store policy IDs in database
  
- **Location Management**: Currently uses `'default'` for merchant location. Should:
  - Allow users to configure merchant locations
  - Use actual location keys from eBay account

#### 1.4 Error Handling & Validation
**Tasks**:
- Implement comprehensive error handling for eBay API errors
- Parse and surface eBay-specific error messages to users
- Handle rate limiting (eBay has rate limits)
- Validate listing data before submission (title length, price format, etc.)

#### 1.5 Testing & Documentation
**Tasks**:
- Write unit tests for eBay service methods
- Test OAuth flow end-to-end
- Test listing creation, update, delete, status check
- Document eBay API limitations and rate limits
- Update `docs/EBAY_SETUP.md` with any new configuration requirements

**Files to Modify**:
- `backend/src/controllers/platform.controller.ts` (main work)
- `backend/src/services/ebay.service.ts` (enhancements)
- `backend/src/services/inventory.service.ts` (may need to add methods)

---

## 2. Facebook Marketplace Automation - ENHANCE & COMPLETE

### Current Status
- Electron-based automation is implemented (`desktop/electron/facebook-automation.js`)
- Form filling works but requires manual image upload and publish
- Image upload saves files to Downloads folder instead of automating

### Tasks Required

#### 2.1 Improve Image Upload Automation
**File**: `desktop/electron/facebook-automation.js`

**Current Behavior**:
- Images are saved to `~/Downloads/llatria-facebook-images/`
- User must manually drag images to upload area

**Required Changes**:
- Use Electron's file dialog or programmatic file input manipulation
- Attempt to use `input.setFiles()` API (newer Electron versions support this)
- Fallback to clipboard paste if Facebook supports it
- If automation isn't possible, provide better UX:
  - Show clearer instructions in the window
  - Provide a "Copy Images to Clipboard" button
  - Auto-open the Downloads folder

**Implementation Approach**:
```javascript
// Try to use FileList API (if available)
const dataTransfer = new DataTransfer();
tempFiles.forEach(file => {
  dataTransfer.items.add(new File([fileBuffer], file.name, { type: 'image/jpeg' }));
});
fileInput.files = dataTransfer.files;
fileInput.dispatchEvent(new Event('change', { bubbles: true }));
```

#### 2.2 Improve Form Field Detection
**File**: `desktop/electron/facebook-automation.js`

**Tasks**:
- Make field detection more robust by:
  - Adding more fallback selectors
  - Using `MutationObserver` to wait for dynamic content
  - Trying multiple detection strategies (data attributes, ARIA labels, placeholder text)
- Add retry logic with exponential backoff
- Better logging for debugging when fields aren't found

#### 2.3 Enhance Error Handling
**Tasks**:
- Handle Facebook login redirects more gracefully
- Detect and handle 2FA prompts
- Better detection of rate limiting
- Handle Facebook UI changes (version detection)
- Provide user-friendly error messages

#### 2.4 Add Status Polling (Optional Enhancement)
**Tasks**:
- After user clicks "Publish", poll Facebook to detect when listing goes live
- Extract listing URL from the page after publish
- Update item's `facebookListingId` in database
- Close window automatically after successful publish (with user confirmation)

#### 2.5 Code Quality Improvements
**Tasks**:
- Break down large methods into smaller functions
- Add JSDoc comments for all methods
- Extract constants for selectors and timeouts
- Improve code organization (consider splitting into multiple files)

**Files to Modify**:
- `desktop/electron/facebook-automation.js` (main work)
- `desktop/src/services/platformService.ts` (may need updates for better error handling)

---

## 3. Google APIs - REFACTOR & SIMPLIFY

### Current Status
- Google Lens service: ~1000 lines, very verbose (`backend/src/services/google-lens.service.ts`)
- Google Shopping service: More concise but could be improved (`backend/src/services/google-shopping.service.ts`)
- Both services work but have redundant code and could be more maintainable

### Tasks Required

#### 3.1 Refactor Google Lens Service
**File**: `backend/src/services/google-lens.service.ts`

**Current Issues**:
- Too many helper methods with similar logic
- Duplicate extraction logic (brand, model, product names)
- Very long methods (e.g., `recognizeItem()` is 180+ lines)
- Hard to maintain and test

**Required Changes**:

**A. Extract Common Utilities**
- Create a new file: `backend/src/services/google-apis/extraction.utils.ts`
- Move common extraction logic:
  - `extractPrice()` (already exists, but consolidate with Shopping service version)
  - `extractBrand()` - consolidate brand extraction logic
  - `extractModel()` - consolidate model extraction logic
  - `extractProductName()` - consolidate product name extraction
  - `extractSpecifications()` - keep but simplify

**B. Simplify `recognizeItem()` Method**
Break down into smaller, focused methods:
- `analyzeImageWithVision()` - calls Vision API
- `extractProductInfo()` - extracts brand, model, product name from analysis
- `getPriceResearch()` - gets prices from Shopping API and visual search
- `buildAIData()` - constructs final AIData object

**C. Consolidate Category/Condition Logic**
- Move `inferCategory()` and `inferCondition()` to shared utilities
- Create mapping constants file for categories
- Simplify the inference logic (remove redundant checks)

**D. Remove Redundant Methods**
- `extractProductFromText()` and `extractProductFromWebEntities()` have overlap - consolidate
- `constructAppleProduct()` is very specific - consider if needed or simplify
- `isAppleProduct()` and related logic can be simplified

**Target**: Reduce file from ~1000 lines to ~400-500 lines while maintaining functionality

#### 3.2 Refactor Google Shopping Service
**File**: `backend/src/services/google-shopping.service.ts`

**Tasks**:
- Use shared extraction utilities from `extraction.utils.ts`
- Simplify `searchProducts()` method
- Consolidate price extraction logic (use shared utility)
- Improve error handling

#### 3.3 Create Shared Configuration
**File**: `backend/src/services/google-apis/config.ts` (new)

**Tasks**:
- Extract configuration constants
- Define types/interfaces for API responses
- Centralize API endpoint URLs
- Define rate limiting constants

#### 3.4 Improve Error Handling
**Tasks**:
- Consistent error handling across both services
- Better error messages for API failures
- Implement retry logic with exponential backoff
- Handle quota exceeded errors gracefully

#### 3.5 Code Organization
**New Structure**:
```
backend/src/services/google-apis/
  ├── index.ts (exports)
  ├── config.ts (shared config)
  ├── extraction.utils.ts (shared utilities)
  ├── vision.service.ts (Vision API wrapper - simplified)
  ├── lens.service.ts (refactored, uses vision + extraction utils)
  └── shopping.service.ts (refactored, uses extraction utils)
```

**Files to Modify**:
- `backend/src/services/google-lens.service.ts` (major refactor)
- `backend/src/services/google-shopping.service.ts` (moderate refactor)
- Create new files in `backend/src/services/google-apis/` directory

---

## 4. Additional Improvements & Bug Fixes

### 4.1 Database Schema Verification
**Tasks**:
- Verify database schema supports all required fields (`ebayListingId`, `facebookListingId`, `websiteListingId`, `postingStatus`)
- Ensure migrations are up to date
- Add indexes for performance if needed

### 4.2 Credential Encryption
**File**: `backend/src/services/platform-credentials.service.ts`

**Current**: Credentials are stored with `// TODO: Encrypt in production` comments

**Tasks**:
- Implement encryption for stored credentials (use crypto library)
- Add encryption key to environment variables
- Implement secure key rotation strategy
- Update credential retrieval to decrypt

### 4.3 API Error Handling
**Tasks**:
- Standardize error responses across all platform endpoints
- Implement consistent error codes
- Add request/response logging for debugging
- Add rate limiting middleware

### 4.4 Testing
**Tasks**:
- Write integration tests for eBay API flows
- Write unit tests for refactored Google services
- Add E2E tests for Facebook automation (as much as possible)
- Test error scenarios

---

## 5. Documentation Updates

### Files to Update/Create:
- `docs/EBAY_SETUP.md` - Update with any new setup requirements
- `docs/FACEBOOK_AUTOMATION_TEST.md` - Update with new automation features
- `docs/GOOGLE_APIS_SETUP.md` - Update if API usage changes
- `README.md` - Update with completed features
- Create `docs/API_INTEGRATION.md` - Document how platform integrations work

---

## Estimated Effort

| Task | Estimated Hours | Priority |
|------|----------------|----------|
| 1.1 Complete eBay Database Integration | 8-12 hours | HIGH |
| 1.3 eBay Listing Management Features | 12-16 hours | MEDIUM |
| 1.4 eBay Error Handling | 4-6 hours | HIGH |
| 2.1 Facebook Image Upload Automation | 8-12 hours | HIGH |
| 2.2 Facebook Field Detection | 4-6 hours | MEDIUM |
| 2.3 Facebook Error Handling | 4-6 hours | MEDIUM |
| 3.1 Refactor Google Lens Service | 16-20 hours | MEDIUM |
| 3.2 Refactor Google Shopping Service | 6-8 hours | MEDIUM |
| 4.2 Credential Encryption | 4-6 hours | HIGH |
| 4.3 API Error Handling | 4-6 hours | MEDIUM |
| Testing | 12-16 hours | HIGH |
| Documentation | 4-6 hours | LOW |

**Total Estimated Effort**: 86-118 hours (approximately 2-3 weeks for a single developer)

---

## Priority Order

1. **Phase 1 (Critical)**: eBay Database Integration, eBay Error Handling, Facebook Image Upload
2. **Phase 2 (High)**: Credential Encryption, Facebook Error Handling, Testing
3. **Phase 3 (Medium)**: Google API Refactoring, eBay Listing Management Features, API Error Handling
4. **Phase 4 (Nice to Have)**: Documentation updates, Facebook status polling

---

## Success Criteria

- [ ] eBay listings can be created, updated, deleted, and status checked via API
- [ ] All eBay operations properly integrate with database (store listing IDs, update statuses)
- [ ] Facebook automation successfully uploads images (or provides clear manual alternative)
- [ ] Facebook automation has robust error handling and field detection
- [ ] Google services are refactored to be more maintainable (reduced code, better organization)
- [ ] All platform credentials are encrypted at rest
- [ ] Comprehensive error handling across all platform integrations
- [ ] All critical flows have tests

---

## Notes for Developer

- The codebase uses TypeScript - maintain type safety
- Follow existing code style and patterns
- The backend uses Prisma for database access - see `backend/prisma/schema.prisma`
- Platform credentials are stored in `PlatformCredentials` table via `platform-credentials.service.ts`
- Inventory items are managed via `inventory.service.ts`
- Check existing error handling patterns in `backend/src/utils/error-handler.ts`
- For Facebook automation, remember that browser security limits what can be automated - manual steps may be necessary
- For eBay, start with sandbox environment for testing
- For Google APIs, be mindful of rate limits and costs

---

## Questions or Clarifications Needed?

Before starting, confirm:
1. Should eBay category mapping be user-configurable or automatic?
2. For Facebook image upload, what's the acceptable level of automation vs. manual steps?
3. Are there specific Google API rate limits or quotas we need to respect?
4. Should credential encryption be implemented before or after other integrations?

