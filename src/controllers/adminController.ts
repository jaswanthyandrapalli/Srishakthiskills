import { Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import ActivityLog from '../models/ActivityLog.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary conditionally
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary storage integrated successfully.');
} else {
  console.log('Cloudinary credentials missing. Images will be stored as base64 or source URLs directly.');
}

// Activity logging helper
export const logActivity = async (
  adminId: string,
  adminName: string,
  actionType: 'login' | 'logout' | 'product_added' | 'product_updated' | 'product_deleted' | 'order_updated' | 'coupon_created' | 'settings_changed',
  description: string,
  req?: any
): Promise<void> => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const userAgent = req ? req.headers['user-agent'] : '';
    
    await ActivityLog.create({
      adminId,
      adminName,
      actionType,
      description,
      ipAddress: String(ipAddress),
      userAgent,
    });
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
};

// Helper to handle optional Cloudinary uploads
const uploadToCloudinary = async (imageSrc: string): Promise<string> => {
  if (!imageSrc) return '';
  
  if (imageSrc.startsWith('http')) {
    return imageSrc; // Already a URL
  }
  
  if (process.env.CLOUDINARY_CLOUD_NAME && imageSrc.startsWith('data:image')) {
    try {
      const uploadRes = await cloudinary.uploader.upload(imageSrc, {
        folder: 'sri_sakthi_sarees',
      });
      return uploadRes.secure_url;
    } catch (err) {
      console.error('Cloudinary Upload Failed:', err);
    }
  }
  
  return imageSrc; // Fallback to raw base64
};

// @desc    Get Sales & Analytics data with detailed metrics (using optimized MongoDB aggregation)
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req: any, res: Response): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Optimized aggregation facet to fetch all order analytics in a single query
    const orderAgg = await Order.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0] } }
              }
            }
          ],
          today: [
            { $match: { createdAt: { $gte: startOfToday } } },
            {
              $group: {
                _id: null,
                todayOrdersCount: { $sum: 1 },
                todayRevenue: { $sum: { $cond: [{ $eq: ['$isPaid', true] }, '$totalPrice', 0] } }
              }
            }
          ],
          statusCounts: [
            {
              $group: {
                _id: '$orderStatus',
                count: { $sum: 1 }
              }
            }
          ],
          dailyHistory: [
            { $match: { isPaid: true } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            { $limit: 10 }
          ],
          weeklyHistory: [
            { $match: { isPaid: true } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            { $limit: 10 }
          ],
          monthlyHistory: [
            { $match: { isPaid: true } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
          ],
          yearlyHistory: [
            { $match: { isPaid: true } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          topProducts: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                totalQty: { $sum: '$items.quantity' },
                totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
              }
            },
            { $sort: { totalQty: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    const results = orderAgg[0];
    const summary = results.summary[0] || { totalOrders: 0, totalRevenue: 0 };
    const today = results.today[0] || { todayOrdersCount: 0, todayRevenue: 0 };
    const statusCounts = results.statusCounts || [];

    let pendingOrdersCount = 0;
    let processingOrdersCount = 0;
    let shippedOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let cancelledOrdersCount = 0;

    statusCounts.forEach((status: any) => {
      if (status._id === 'Pending') pendingOrdersCount = status.count;
      if (status._id === 'Processing') processingOrdersCount = status.count;
      if (status._id === 'Shipped') shippedOrdersCount = status.count;
      if (status._id === 'Delivered') deliveredOrdersCount = status.count;
      if (status._id === 'Cancelled') cancelledOrdersCount = status.count;
    });

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({});
    const outOfStockCount = await Product.countDocuments({ stock: 0 });
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });

    res.json({
      summary: {
        totalOrders: summary.totalOrders,
        totalRevenue: summary.totalRevenue,
        totalUsers,
        totalProducts,
        todayOrdersCount: today.todayOrdersCount,
        todayRevenue: today.todayRevenue,
        pendingOrdersCount,
        processingOrdersCount,
        shippedOrdersCount,
        deliveredOrdersCount,
        cancelledOrdersCount,
        outOfStockCount,
        lowStockCount,
        averageOrderValue: summary.totalOrders > 0 ? Math.round(summary.totalRevenue / summary.totalOrders) : 0,
        conversionRate: 3.4
      },
      topProducts: results.topProducts,
      salesHistory: results.dailyHistory,
      charts: {
        daily: results.dailyHistory,
        weekly: results.weeklyHistory,
        monthly: results.monthlyHistory,
        yearly: results.yearlyHistory
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory items below low stock alert threshold (e.g. 5)
// @route   GET /api/admin/inventory-alerts
// @access  Private/Admin
export const getInventoryAlerts = async (req: any, res: Response): Promise<void> => {
  try {
    const lowStockThreshold = 5;
    const items = await Product.find({ stock: { $lte: lowStockThreshold } }).select('name stock price category images');
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req: any, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({}).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status / Add tracking
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { status, trackingNumber, trackingCarrier } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.orderStatus;
      order.orderStatus = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (trackingCarrier) order.trackingCarrier = trackingCarrier;
      
      if (status === 'Delivered' && order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = new Date();
      }

      const updatedOrder = await order.save();

      // Log activity
      await logActivity(
        req.user._id.toString(),
        req.user.name,
        'order_updated',
        `Updated order ${order._id} status from ${oldStatus} to ${status}`,
        req
      );

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with their order spending summary & purchase histories
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: any, res: Response): Promise<void> => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          createdAt: 1,
          orderCount: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    as: 'order',
                    cond: { $eq: ['$$order.isPaid', true] }
                  }
                },
                as: 'paidOrder',
                in: '$$paidOrder.totalPrice'
              }
            }
          },
          orderHistory: {
            $map: {
              input: '$orders',
              as: 'o',
              in: {
                _id: '$$o._id',
                createdAt: '$$o.createdAt',
                totalPrice: '$$o.totalPrice',
                orderStatus: '$$o.orderStatus',
                isPaid: '$$o.isPaid'
              }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (Super-Admin only check in route/controller)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: any, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    
    // Safety check: Only super-admin can change roles
    if (req.user.role !== 'super-admin') {
      res.status(403).json({ message: 'Only Super Admin can change user roles' });
      return;
    }

    const userToModify = await User.findById(req.params.id);
    if (userToModify) {
      const oldRole = userToModify.role;
      userToModify.role = role;
      await userToModify.save();

      // Log action
      await logActivity(
        req.user._id.toString(),
        req.user.name,
        'settings_changed',
        `Changed role of ${userToModify.name} (${userToModify.email}) from ${oldRole} to ${role}`,
        req
      );

      res.json({ message: 'User role updated successfully', user: userToModify });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getActivityLogs = async (req: any, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, price, discount, category, images, description, fabric, colors, stock } = req.body;

    const uploadedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        const url = await uploadToCloudinary(img);
        uploadedImages.push(url);
      }
    } else {
      uploadedImages.push('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80');
    }

    const product = new Product({
      name,
      price: Number(price),
      discount: Number(discount || 0),
      category,
      images: uploadedImages,
      description: description || 'Elegant designer saree from Sri Sakthi collection.',
      fabric: fabric || 'Cotton-Silk Blend',
      colors: colors || ['Multi-color'],
      stock: Number(stock),
    });

    const createdProduct = await product.save();

    // Log action
    await logActivity(
      req.user._id.toString(),
      req.user.name,
      'product_added',
      `Created product: ${name} (Price: ₹${price}, Category: ${category})`,
      req
    );

    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, price, discount, category, images, description, fabric, colors, stock, isActive } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.discount = discount !== undefined ? Number(discount) : product.discount;
      product.category = category || product.category;
      product.description = description || product.description;
      product.fabric = fabric || product.fabric;
      product.colors = colors || product.colors;
      product.stock = stock !== undefined ? Number(stock) : product.stock;
      product.isActive = isActive !== undefined ? isActive : product.isActive;

      if (images && images.length > 0) {
        const uploadedImages = [];
        for (const img of images) {
          const url = await uploadToCloudinary(img);
          uploadedImages.push(url);
        }
        product.images = uploadedImages;
      }

      const updatedProduct = await product.save();

      // Log action
      await logActivity(
        req.user._id.toString(),
        req.user.name,
        'product_updated',
        `Updated product details for: ${product.name}`,
        req
      );

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Soft Delete)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: any, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isActive = false; // Soft delete
      await product.save();

      // Log action
      await logActivity(
        req.user._id.toString(),
        req.user.name,
        'product_deleted',
        `Soft-deleted product: ${product.name}`,
        req
      );

      res.json({ message: 'Product disabled / soft-deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new coupon code
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = async (req: any, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiryDays } = req.body;
    
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      res.status(400).json({ message: 'Coupon code already exists' });
      return;
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      expiryDate: new Date(Date.now() + Number(expiryDays || 30) * 24 * 60 * 60 * 1000),
    });

    const createdCoupon = await coupon.save();

    // Log action
    await logActivity(
      req.user._id.toString(),
      req.user.name,
      'coupon_created',
      `Created coupon: ${code.toUpperCase()} (${discountType} discount: ${discountValue})`,
      req
    );

    res.status(201).json(createdCoupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
