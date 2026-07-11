'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CatalogProduct {
  _id: string;
  name: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
  fabric: string;
  colors: string[];
  stock: number;
  ratings: number;
  description?: string;
  numReviews?: number;
  isActive?: boolean;
}

export interface CartItem {
  product: string; // ID
  name: string;
  image: string;
  price: number;
  quantity: number;
  color: string;
  discount: number;
  stock: number;
}

export interface CouponData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlist: CatalogProduct[];
  recentlyViewed: CatalogProduct[];
  appliedCoupon: CouponData | null;
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (productId: string, color: string) => void;
  updateCartQty: (productId: string, color: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: CatalogProduct) => void;
  isInWishlist: (productId: string) => boolean;
  addRecentlyViewed: (product: CatalogProduct) => void;
  applyCoupon: (coupon: CouponData) => void;
  removeCoupon: () => void;
  getCartTotal: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<CatalogProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CatalogProduct[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);

  // Load from local storage
  useEffect(() => {
    const localCart = localStorage.getItem('sri_sakthi_cart');
    const localWishlist = localStorage.getItem('sri_sakthi_wishlist');
    const localRecent = localStorage.getItem('sri_sakthi_recent');
    const localCoupon = localStorage.getItem('sri_sakthi_coupon');

    if (localCart) setCartItems(JSON.parse(localCart));
    if (localWishlist) setWishlist(JSON.parse(localWishlist));
    if (localRecent) setRecentlyViewed(JSON.parse(localRecent));
    if (localCoupon) setAppliedCoupon(JSON.parse(localCoupon));
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('sri_sakthi_cart', JSON.stringify(items));
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    const existingIndex = cartItems.findIndex(
      (c) => c.product === item.product && c.color === item.color
    );

    const newCart = [...cartItems];
    if (existingIndex > -1) {
      const newQty = newCart[existingIndex].quantity + qty;
      newCart[existingIndex].quantity = Math.min(newQty, item.stock);
    } else {
      newCart.push({ ...item, quantity: Math.min(qty, item.stock) });
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId: string, color: string) => {
    const newCart = cartItems.filter((c) => !(c.product === productId && c.color === color));
    saveCart(newCart);
  };

  const updateCartQty = (productId: string, color: string, qty: number) => {
    const newCart = cartItems.map((c) => {
      if (c.product === productId && c.color === color) {
        return { ...c, quantity: Math.max(1, Math.min(qty, c.stock)) };
      }
      return c;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
  };

  const toggleWishlist = (product: CatalogProduct) => {
    const exists = wishlist.some((w) => w._id === product._id);
    let newWishlist: CatalogProduct[];
    if (exists) {
      newWishlist = wishlist.filter((w) => w._id !== product._id);
    } else {
      newWishlist = [...wishlist, product];
    }
    setWishlist(newWishlist);
    localStorage.setItem('sri_sakthi_wishlist', JSON.stringify(newWishlist));
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((w) => w._id === productId);
  };

  const addRecentlyViewed = (product: CatalogProduct) => {
    const filtered = recentlyViewed.filter((r) => r._id !== product._id);
    const newRecent = [product, ...filtered].slice(0, 5);
    setRecentlyViewed(newRecent);
    localStorage.setItem('sri_sakthi_recent', JSON.stringify(newRecent));
  };

  const applyCoupon = (coupon: CouponData) => {
    setAppliedCoupon(coupon);
    localStorage.setItem('sri_sakthi_coupon', JSON.stringify(coupon));
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('sri_sakthi_coupon');
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return acc + discountedPrice * item.quantity;
    }, 0);
  };

  const getDiscountAmount = () => {
    const total = getCartTotal();
    if (!appliedCoupon) return 0;
    
    if (total < appliedCoupon.minOrderValue) {
      return 0; // Did not qualify
    }

    if (appliedCoupon.discountType === 'percentage') {
      return total * (appliedCoupon.discountValue / 100);
    } else {
      return Math.min(appliedCoupon.discountValue, total);
    }
  };

  const getFinalTotal = () => {
    const total = getCartTotal();
    const discount = getDiscountAmount();
    const shipping = total > 2000 || total === 0 ? 0 : 100;
    return total - discount + shipping;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlist,
        recentlyViewed,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        addRecentlyViewed,
        applyCoupon,
        removeCoupon,
        getCartTotal,
        getDiscountAmount,
        getFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
