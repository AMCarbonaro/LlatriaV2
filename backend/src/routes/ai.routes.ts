import { Router } from 'express';
import {
  recognizeItem,
  getPriceSuggestions,
  searchProducts,
  getPriceComparison,
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

router.post('/recognize', recognizeItem);
router.get('/suggestions', getPriceSuggestions);
router.get('/search', searchProducts);
router.get('/price-comparison', getPriceComparison);

export default router;



