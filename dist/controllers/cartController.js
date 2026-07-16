"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartQty = exports.addToCart = exports.getCart = void 0;
const Cart_js_1 = __importDefault(require("../models/Cart.js"));
/**
 * @desc    Get logged in user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        let cart = await Cart_js_1.default.findOne({ user: userId });
        if (!cart) {
            cart = await Cart_js_1.default.create({ user: userId, items: [] });
        }
        res.status(200).json({ success: true, cart });
    }
    catch (error) {
        console.error('getCart Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCart = getCart;
/**
 * @desc    Add product to user's cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { product, name, image, price, color, discount, stock, quantity } = req.body;
        if (!product || !name || !image || price === undefined || !color || discount === undefined || stock === undefined) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        let cart = await Cart_js_1.default.findOne({ user: userId });
        if (!cart) {
            cart = new Cart_js_1.default({ user: userId, items: [] });
        }
        const existingIndex = cart.items.findIndex((item) => item.product.toString() === product && item.color === color);
        const qty = quantity || 1;
        if (existingIndex > -1) {
            const newQty = cart.items[existingIndex].quantity + qty;
            cart.items[existingIndex].quantity = Math.min(newQty, stock);
        }
        else {
            cart.items.push({
                product,
                name,
                image,
                price,
                quantity: Math.min(qty, stock),
                color,
                discount,
                stock
            });
        }
        await cart.save();
        res.status(200).json({ success: true, cart });
    }
    catch (error) {
        console.error('addToCart Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addToCart = addToCart;
/**
 * @desc    Update quantity of a product in user's cart
 * @route   PUT /api/cart/qty
 * @access  Private
 */
const updateCartQty = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { product, color, quantity } = req.body;
        if (!product || !color || quantity === undefined) {
            res.status(400).json({ success: false, message: 'Product, color, and quantity are required' });
            return;
        }
        const cart = await Cart_js_1.default.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({ success: false, message: 'Cart not found' });
            return;
        }
        const existingIndex = cart.items.findIndex((item) => item.product.toString() === product && item.color === color);
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity = Math.max(1, Math.min(quantity, cart.items[existingIndex].stock));
            await cart.save();
            res.status(200).json({ success: true, cart });
        }
        else {
            res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
    }
    catch (error) {
        console.error('updateCartQty Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCartQty = updateCartQty;
/**
 * @desc    Remove product from user's cart
 * @route   DELETE /api/cart/:productId/:color
 * @access  Private
 */
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { productId, color } = req.params;
        if (!productId || !color) {
            res.status(400).json({ success: false, message: 'Product ID and color are required' });
            return;
        }
        const cart = await Cart_js_1.default.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({ success: false, message: 'Cart not found' });
            return;
        }
        cart.items = cart.items.filter((item) => !(item.product.toString() === productId && item.color === color));
        await cart.save();
        res.status(200).json({ success: true, cart });
    }
    catch (error) {
        console.error('removeFromCart Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.removeFromCart = removeFromCart;
/**
 * @desc    Clear all products from user's cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const cart = await Cart_js_1.default.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ success: true, cart });
    }
    catch (error) {
        console.error('clearCart Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.clearCart = clearCart;
