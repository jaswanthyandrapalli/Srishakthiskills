"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const cartController_js_1 = require("../controllers/cartController.js");
const router = express_1.default.Router();
// All cart routes require authentication
router.use(authMiddleware_js_1.protect);
router.route('/')
    .get(cartController_js_1.getCart)
    .post(cartController_js_1.addToCart)
    .delete(cartController_js_1.clearCart);
router.put('/qty', cartController_js_1.updateCartQty);
router.delete('/:productId/:color', cartController_js_1.removeFromCart);
exports.default = router;
