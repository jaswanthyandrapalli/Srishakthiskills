import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.put('/qty', updateCartQty);
router.delete('/:productId/:color', removeFromCart);

export default router;
