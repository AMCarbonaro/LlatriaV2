import { Router } from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  markAsSold,
  bulkOperation,
} from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All inventory routes require authentication
router.use(authenticate);

router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.patch('/:id/sold', markAsSold);
router.post('/bulk', bulkOperation);

export default router;






