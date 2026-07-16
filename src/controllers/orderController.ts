import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Razorpay from 'razorpay';

// Initialize Razorpay conditionally
let razorpay: any = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('Razorpay integrated successfully.');
} else {
  console.log('Razorpay keys not configured. Fallback to sandbox mock payments active.');
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Verify stock & calculate price
    let itemsPrice = 0;
    const dbOrderItems = [];

    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
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
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() < coupon.expiryDate && itemsPrice >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discountAmount = itemsPrice * (coupon.discountValue / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    // Shipping fee (e.g., Free shipping over ₹2000, else ₹100)
    const shippingPrice = itemsPrice > 2000 ? 0 : 100;
    const totalPrice = itemsPrice + shippingPrice - discountAmount;

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = new Order({
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
        } else {
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
      } catch (err: any) {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: any, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (order) {
      // Allow only the owner or admin to read order details
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

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
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's order history
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: any, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track order by Order ID or Tracking ID
// @route   GET /api/orders/track/:trackid
// @access  Public
export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = {
      $or: [
        { _id: mongoose.isValidObjectId(req.params.trackid) ? req.params.trackid : new mongoose.Types.ObjectId() },
        { trackingNumber: req.params.trackid }
      ]
    };
    
    const order = await Order.findOne(query).select('orderStatus trackingNumber trackingCarrier items totalPrice createdAt');
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'No matching order or tracking code found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
