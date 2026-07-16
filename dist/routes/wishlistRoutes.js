"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const wishlistController_js_1 = require("../controllers/wishlistController.js");
const router = express_1.default.Router();
// Apply auth middleware to protect all wishlist routes
router.use(authMiddleware_js_1.protect);
router.route('/')
    .get(wishlistController_js_1.getWishlist)
    .post(wishlistController_js_1.addToWishlist);
router.route('/:id')
    .delete(wishlistController_js_1.removeFromWishlist);
exports.default = router;
