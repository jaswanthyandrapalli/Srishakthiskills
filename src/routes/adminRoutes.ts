import express from 'express';
import { 
  getDashboardAnalytics, 
  getInventoryAlerts, 
  getAllOrders, 
  updateOrderStatus, 
  getAllUsers, 
  updateUserRole,
  getActivityLogs,
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createCoupon 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/analytics', getDashboardAnalytics);
router.get('/inventory-alerts', getInventoryAlerts);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/logs', getActivityLogs);

router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.post('/coupons', createCoupon);

export default router;
