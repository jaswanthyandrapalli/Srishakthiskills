"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_js_1 = require("../controllers/productController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
router.get('/', productController_js_1.getProducts);
router.get('/:id', productController_js_1.getProductById);
router.post('/:id/reviews', authMiddleware_js_1.protect, productController_js_1.createProductReview);
router.get('/:id/recommendations', productController_js_1.getRecommendations);
exports.default = router;
