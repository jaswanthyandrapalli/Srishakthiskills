import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';
import { fallbackProducts } from './productController.js';

// In-memory fallback wishlists (userId -> productIds)
const fallbackWishlists = new Map<string, string[]>();

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id || req.user._id;
    
    if (!isDbConnected) {
      const productIds = fallbackWishlists.get(userId.toString()) || [];
      const populated = productIds.map(id => fallbackProducts.find(p => p._id === id)).filter(Boolean);
      res.status(200).json({ success: true, wishlist: populated });
      return;
    }

    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error: any) {
    console.error('getWishlist Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    const userId = req.user.id || req.user._id;

    if (!isDbConnected) {
      const productExists = fallbackProducts.some(p => p._id === productId);
      if (!productExists) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      const productIds = fallbackWishlists.get(userId.toString()) || [];
      if (!productIds.includes(productId)) {
        productIds.push(productId);
        fallbackWishlists.set(userId.toString(), productIds);
      }
      const populated = productIds.map(id => fallbackProducts.find(p => p._id === id)).filter(Boolean);
      res.status(200).json({ success: true, wishlist: populated });
      return;
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error: any) {
    console.error('addToWishlist Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const userId = req.user.id || req.user._id;

    if (!isDbConnected) {
      let productIds = fallbackWishlists.get(userId.toString()) || [];
      productIds = productIds.filter(id => id !== productId);
      fallbackWishlists.set(userId.toString(), productIds);
      const populated = productIds.map(id => fallbackProducts.find(p => p._id === id)).filter(Boolean);
      res.status(200).json({ success: true, wishlist: populated });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error: any) {
    console.error('removeFromWishlist Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
