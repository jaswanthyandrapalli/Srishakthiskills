"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackOrder = exports.getMyOrders = exports.updateOrderToPaid = exports.getOrderById = exports.createOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_js_1 = __importDefault(require("../models/Order.js"));
const Product_js_1 = __importDefault(require("../models/Product.js"));
const Coupon_js_1 = __importDefault(require("../models/Coupon.js"));
const razorpay_1 = __importDefault(require("razorpay"));
const db_js_1 = require("../config/db.js");
const productController_js_1 = require("./productController.js");
// Initialize Razorpay conditionally
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new razorpay_1.default({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('Razorpay integrated successfully.');
}
else {
    console.log('Razorpay keys not configured. Fallback to sandbox mock payments active.');
}
// In-memory fallback orders
const fallbackOrders = new Map();
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, couponCode, } = req.body;
        if (!orderItems || orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }
        if (!db_js_1.isDbConnected) {
            // Offline fallback order creation
            let itemsPrice = 0;
            const dbOrderItems = [];
            for (const item of orderItems) {
                const dbProduct = productController_js_1.fallbackProducts.find(p => p._id === item.product);
                if (!dbProduct) {
                    res.status(404).json({ message: `Product not found: ${item.name}` });
                    return;
                }
                if (dbProduct.stock < item.quantity) {
                    res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${dbProduct.stock}` });
                    return;
                }
                const effectivePrice = dbProduct.price * (1 - dbProduct.discount / 100);
                itemsPrice += effectivePrice * item.quantity;
                dbOrderItems.push({
                    product: dbProduct._id,
                    name: dbProduct.name,
                    image: dbProduct.images[0],
                    price: effectivePrice,
                    quantity: item.quantity,
                    color: item.color || dbProduct.colors[0],
                });
                // Deduct mock stock
                dbProduct.stock -= item.quantity;
            }
            let discountAmount = 0;
            if (couponCode) {
                const code = couponCode.toUpperCase();
                if (code === 'WELCOME500' && itemsPrice >= 3000) {
                    discountAmount = 500;
                }
                else if (code === 'FESTIVE20' && itemsPrice >= 5000) {
                    discountAmount = itemsPrice * 0.2;
                }
            }
            const shippingPrice = itemsPrice > 2000 ? 0 : 100;
            const totalPrice = itemsPrice + shippingPrice - discountAmount;
            const orderId = `order_fallback_${Math.random().toString(36).substring(2, 11)}`;
            const order = {
                _id: orderId,
                user: {
                    _id: req.user._id || req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    phone: req.user.phone,
                },
                items: dbOrderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                discountAmount,
                totalPrice,
                isPaid: paymentMethod === 'COD' ? false : false,
                orderStatus: 'Processing',
                createdAt: new Date(),
                trackingNumber: `TRK${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                trackingCarrier: 'Delhivery',
            };
            fallbackOrders.set(orderId, order);
            // Handle Razorpay payment setup offline
            if (paymentMethod !== 'COD') {
                res.status(201).json({
                    order,
                    razorpayOrder: {
                        id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
                        amount: Math.round(totalPrice * 100),
                        currency: 'INR',
                        isMock: true
                    }
                });
                return;
            }
            res.status(201).json({ order });
            return;
        }
        // Verify stock & calculate price
        let itemsPrice = 0;
        const dbOrderItems = [];
        for (const item of orderItems) {
            const dbProduct = await Product_js_1.default.findById(item.product);
            if (!dbProduct) {
                res.status(404).json({ message: `Product not found: ${item.name}` });
                return;
            }
            if (dbProduct.stock < item.quantity) {
                res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${dbProduct.stock}` });
                return;
            }
            // Calculate discount price
            const effectivePrice = dbProduct.price * (1 - dbProduct.discount / 100);
            itemsPrice += effectivePrice * item.quantity;
            dbOrderItems.push({
                product: dbProduct._id,
                name: dbProduct.name,
                image: dbProduct.images[0],
                price: effectivePrice,
                quantity: item.quantity,
                color: item.color || dbProduct.colors[0],
            });
        }
        // Calculate coupon discount
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon_js_1.default.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon && new Date() < coupon.expiryDate && itemsPrice >= coupon.minOrderValue) {
                if (coupon.discountType === 'percentage') {
                    discountAmount = itemsPrice * (coupon.discountValue / 100);
                }
                else {
                    discountAmount = coupon.discountValue;
                }
            }
        }
        // Shipping fee (e.g., Free shipping over ₹2000, else ₹100)
        const shippingPrice = itemsPrice > 2000 ? 0 : 100;
        const totalPrice = itemsPrice + shippingPrice - discountAmount;
        // Deduct stock
        for (const item of orderItems) {
            await Product_js_1.default.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }
        const order = new Order_js_1.default({
            user: req.user._id,
            items: dbOrderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            discountAmount,
            totalPrice,
            isPaid: paymentMethod === 'COD' ? false : false, // Paid upon Razorpay verification
        });
        const createdOrder = await order.save();
        // If Razorpay online payment selected, create a Razorpay transaction order
        if (paymentMethod !== 'COD') {
            try {
                if (razorpay) {
                    const razorpayOrder = await razorpay.orders.create({
                        amount: Math.round(totalPrice * 100), // amount in paisa
                        currency: 'INR',
                        receipt: createdOrder._id.toString(),
                    });
                    res.status(201).json({
                        order: createdOrder,
                        razorpayOrder: {
                            id: razorpayOrder.id,
                            amount: razorpayOrder.amount,
                            currency: razorpayOrder.currency,
                        }
                    });
                    return;
                }
                else {
                    // Send mock razorpay order info
                    res.status(201).json({
                        order: createdOrder,
                        razorpayOrder: {
                            id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
                            amount: Math.round(totalPrice * 100),
                            currency: 'INR',
                            isMock: true
                        }
                    });
                    return;
                }
            }
            catch (err) {
                console.error('Razorpay Order Error:', err);
                // Fallback to order creation success even if Razorpay API fails locally
                res.status(201).json({
                    order: createdOrder,
                    razorpayOrder: {
                        id: `order_mock_err_${Math.random().toString(36).substring(2, 11)}`,
                        amount: Math.round(totalPrice * 100),
                        currency: 'INR',
                        isMock: true
                    }
                });
                return;
            }
        }
        res.status(201).json({ order: createdOrder });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createOrder = createOrder;
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        if (!db_js_1.isDbConnected) {
            const order = fallbackOrders.get(req.params.id);
            if (order) {
                // Allow only the owner or admin to read order details
                const ownerId = order.user._id.toString();
                const requesterId = (req.user._id || req.user.id).toString();
                if (ownerId !== requesterId && req.user.role !== 'admin') {
                    res.status(403).json({ message: 'Forbidden' });
                    return;
                }
                res.json(order);
            }
            else {
                res.status(404).json({ message: 'Order not found' });
            }
            return;
        }
        const order = await Order_js_1.default.findById(req.params.id).populate('user', 'name email phone');
        if (order) {
            // Allow only the owner or admin to read order details
            if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            res.json(order);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOrderById = getOrderById;
// @desc    Update order status to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        if (!db_js_1.isDbConnected) {
            const order = fallbackOrders.get(req.params.id);
            if (order) {
                order.isPaid = true;
                order.paidAt = new Date();
                order.paymentResult = {
                    id: req.body.id || `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
                    status: req.body.status || 'success',
                    email: req.body.email || 'customer@example.com',
                };
                fallbackOrders.set(req.params.id, order);
                res.json(order);
            }
            else {
                res.status(404).json({ message: 'Order not found' });
            }
            return;
        }
        const order = await Order_js_1.default.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = {
                id: req.body.id || `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
                status: req.body.status || 'success',
                email: req.body.email || 'customer@example.com',
            };
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOrderToPaid = updateOrderToPaid;
// @desc    Get user's order history
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        if (!db_js_1.isDbConnected) {
            const userId = (req.user._id || req.user.id).toString();
            const orders = Array.from(fallbackOrders.values())
                .filter(o => o.user._id.toString() === userId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            res.json(orders);
            return;
        }
        const orders = await Order_js_1.default.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyOrders = getMyOrders;
// @desc    Track order by Order ID or Tracking ID
// @route   GET /api/orders/track/:trackid
// @access  Public
const trackOrder = async (req, res) => {
    try {
        if (!db_js_1.isDbConnected) {
            const order = Array.from(fallbackOrders.values()).find(o => o._id === req.params.trackid || o.trackingNumber === req.params.trackid);
            if (order) {
                res.json({
                    orderStatus: order.orderStatus,
                    trackingNumber: order.trackingNumber,
                    trackingCarrier: order.trackingCarrier,
                    items: order.items,
                    totalPrice: order.totalPrice,
                    createdAt: order.createdAt,
                });
            }
            else {
                res.status(404).json({ message: 'No matching order or tracking code found' });
            }
            return;
        }
        const query = {
            $or: [
                { _id: mongoose_1.default.isValidObjectId(req.params.trackid) ? req.params.trackid : new mongoose_1.default.Types.ObjectId() },
                { trackingNumber: req.params.trackid }
            ]
        };
        const order = await Order_js_1.default.findOne(query).select('orderStatus trackingNumber trackingCarrier items totalPrice createdAt');
        if (order) {
            res.json(order);
        }
        else {
            res.status(404).json({ message: 'No matching order or tracking code found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.trackOrder = trackOrder;
