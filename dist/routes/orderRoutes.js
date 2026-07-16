"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_js_1 = require("../controllers/orderController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
router.post('/', authMiddleware_js_1.protect, orderController_js_1.createOrder);
router.get('/myorders', authMiddleware_js_1.protect, orderController_js_1.getMyOrders);
router.get('/track/:trackid', orderController_js_1.trackOrder);
router.get('/:id', authMiddleware_js_1.protect, orderController_js_1.getOrderById);
router.put('/:id/pay', authMiddleware_js_1.protect, orderController_js_1.updateOrderToPaid);
exports.default = router;
