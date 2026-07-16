import express from 'express';
import { 
  createOrder, 
  getOrderById, 
  updateOrderToPaid, 
  getMyOrders, 
  trackOrder 
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/track/:trackid', trackOrder);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);

export default router;
