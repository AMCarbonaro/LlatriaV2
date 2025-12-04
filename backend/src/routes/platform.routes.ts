import { Router } from 'express';
import {
  connectEBay,
  ebayCallback,
  getPlatformStatus,
  disconnectPlatform,
  postToEBay,
  updateEBayListing,
  deleteEBayListing,
  getEBayListingStatus,
} from '../controllers/platform.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All platform routes require authentication (except OAuth callback)
router.get('/ebay/callback', ebayCallback);

// Protected routes
router.use(authenticate);

// Platform Connection Management
router.get('/:platform/status', getPlatformStatus);
router.delete('/:platform/disconnect', disconnectPlatform);

// eBay OAuth
router.get('/ebay/connect', connectEBay);

// eBay Listing Operations
router.post('/inventory/:id/post/ebay', postToEBay);
router.put('/inventory/:id/post/ebay', updateEBayListing);
router.delete('/inventory/:id/post/ebay', deleteEBayListing);
router.get('/inventory/:id/post/ebay/status', getEBayListingStatus);

export default router;

