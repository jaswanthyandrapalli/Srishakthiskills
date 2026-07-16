"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const User_js_1 = __importDefault(require("../models/User.js"));
const Product_js_1 = __importDefault(require("../models/Product.js"));
// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User_js_1.default.findById(userId).populate('wishlist');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, wishlist: user.wishlist || [] });
    }
    catch (error) {
        console.error('getWishlist Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWishlist = getWishlist;
// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            res.status(400).json({ success: false, message: 'Product ID is required' });
            return;
        }
        // Verify product exists
        const product = await Product_js_1.default.findById(productId);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        const userId = req.user.id || req.user._id;
        const user = await User_js_1.default.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } }, { new: true }).populate('wishlist');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, wishlist: user.wishlist || [] });
    }
    catch (error) {
        console.error('addToWishlist Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addToWishlist = addToWishlist;
// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id || req.user._id;
        const user = await User_js_1.default.findByIdAndUpdate(userId, { $pull: { wishlist: productId } }, { new: true }).populate('wishlist');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, wishlist: user.wishlist || [] });
    }
    catch (error) {
        console.error('removeFromWishlist Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.removeFromWishlist = removeFromWishlist;
