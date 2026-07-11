import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
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

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
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

    const user = await User.findByIdAndUpdate(
      req.user._id,
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
