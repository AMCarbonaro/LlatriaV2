import { Router } from 'express';
import {
  getWebsiteProducts,
  getWebsiteProduct,
  postToWebsite,
  removeFromWebsite,
} from '../controllers/website.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no auth required)
// Support both storeId in path and query parameter
router.get('/:storeId/products', getWebsiteProducts);
router.get('/:storeId/products/:id', getWebsiteProduct);
router.get('/products', getWebsiteProducts); // Fallback with storeId in query
router.get('/products/:id', getWebsiteProduct); // Fallback with storeId in query

// Authenticated routes (for posting/removing items)
router.post('/inventory/:id/post', authenticate, postToWebsite);
router.delete('/inventory/:id/post', authenticate, removeFromWebsite);

export default router;

