import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProductReview, 
  getRecommendations 
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, createProductReview);
router.get('/:id/recommendations', getRecommendations);

export default router;
