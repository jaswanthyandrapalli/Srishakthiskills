import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';

const router = express.Router();

// Apply auth middleware to protect all wishlist routes
router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.route('/:id')
  .delete(removeFromWishlist);

export default router;
