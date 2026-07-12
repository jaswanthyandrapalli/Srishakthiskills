'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, API_URL } from './AuthContext';

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
  const { user, getAuthHeaders } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<CatalogProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CatalogProduct[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);

  // Load non-cart and non-wishlist settings from local storage
  useEffect(() => {
    const localRecent = localStorage.getItem('sri_sakthi_recent');
    const localCoupon = localStorage.getItem('sri_sakthi_coupon');

    if (localRecent) setRecentlyViewed(JSON.parse(localRecent));
    if (localCoupon) setAppliedCoupon(JSON.parse(localCoupon));
  }, []);

  // Load wishlist from backend if logged in, or local storage if guest
  useEffect(() => {
    // Synchronously reset / load user-specific cached data from localStorage to prevent flash/stale leak
    if (user) {
      const localUserWishlist = localStorage.getItem(`sri_sakthi_wishlist_${user._id}`);
      setWishlist(localUserWishlist ? JSON.parse(localUserWishlist) : []);
    } else {
      const localWishlist = localStorage.getItem('sri_sakthi_wishlist_guest');
      setWishlist(localWishlist ? JSON.parse(localWishlist) : []);
    }

    const fetchWishlist = async () => {
      if (user) {
        try {
          const res = await fetch(`${API_URL}/wishlist`, {
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const serverWishlist = data.wishlist || [];
            setWishlist(serverWishlist);
            localStorage.setItem(`sri_sakthi_wishlist_${user._id}`, JSON.stringify(serverWishlist));
          } else {
            console.error('Failed to load wishlist:', data.message);
          }
        } catch (error) {
          console.error('Error fetching wishlist from server:', error);
        }
      }
    };
    fetchWishlist();
  }, [user]);

  // Load user-specific cart from backend if logged in, or local storage if guest
  useEffect(() => {
    // Synchronously reset / load user-specific cached data from localStorage to prevent flash/stale leak
    if (user) {
      const localUserCart = localStorage.getItem(`sri_sakthi_cart_${user._id}`);
      setCartItems(localUserCart ? JSON.parse(localUserCart) : []);
    } else {
      const localCart = localStorage.getItem('sri_sakthi_cart_guest');
      setCartItems(localCart ? JSON.parse(localCart) : []);
    }

    const fetchCart = async () => {
      if (user) {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const items = data.cart?.items || [];
            setCartItems(items);
            localStorage.setItem(`sri_sakthi_cart_${user._id}`, JSON.stringify(items));
          } else {
            console.error('Failed to load cart:', data.message);
          }
        } catch (error) {
          console.error('Error fetching cart from server:', error);
        }
      }
    };
    fetchCart();
  }, [user]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    if (user) {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...item, quantity: qty }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const updatedItems = data.cart?.items || [];
          setCartItems(updatedItems);
          localStorage.setItem(`sri_sakthi_cart_${user._id}`, JSON.stringify(updatedItems));
        } else {
          console.error('Failed to add to cart on server:', data.message);
        }
      } catch (error) {
        console.error('Error adding to cart on server:', error);
      }
    } else {
      // Guest mode
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
      setCartItems(newCart);
      localStorage.setItem('sri_sakthi_cart_guest', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (productId: string, color: string) => {
    if (user) {
      try {
        const res = await fetch(`${API_URL}/cart/${productId}/${encodeURIComponent(color)}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const updatedItems = data.cart?.items || [];
          setCartItems(updatedItems);
          localStorage.setItem(`sri_sakthi_cart_${user._id}`, JSON.stringify(updatedItems));
        } else {
          console.error('Failed to remove from cart on server:', data.message);
        }
      } catch (error) {
        console.error('Error removing from cart on server:', error);
      }
    } else {
      const newCart = cartItems.filter((c) => !(c.product === productId && c.color === color));
      setCartItems(newCart);
      localStorage.setItem('sri_sakthi_cart_guest', JSON.stringify(newCart));
    }
  };

  const updateCartQty = async (productId: string, color: string, qty: number) => {
    if (user) {
      try {
        const res = await fetch(`${API_URL}/cart/qty`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ product: productId, color, quantity: qty }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const updatedItems = data.cart?.items || [];
          setCartItems(updatedItems);
          localStorage.setItem(`sri_sakthi_cart_${user._id}`, JSON.stringify(updatedItems));
        } else {
          console.error('Failed to update cart quantity on server:', data.message);
        }
      } catch (error) {
        console.error('Error updating cart quantity on server:', error);
      }
    } else {
      const newCart = cartItems.map((c) => {
        if (c.product === productId && c.color === color) {
          return { ...c, quantity: Math.max(1, Math.min(qty, c.stock)) };
        }
        return c;
      });
      setCartItems(newCart);
      localStorage.setItem('sri_sakthi_cart_guest', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCartItems([]);
          localStorage.setItem(`sri_sakthi_cart_${user._id}`, JSON.stringify([]));
        } else {
          console.error('Failed to clear cart on server:', data.message);
        }
      } catch (error) {
        console.error('Error clearing cart on server:', error);
      }
    } else {
      setCartItems([]);
      localStorage.setItem('sri_sakthi_cart_guest', JSON.stringify([]));
    }
    removeCoupon();
  };

  const toggleWishlist = async (product: CatalogProduct) => {
    const exists = wishlist.some((w) => w._id === product._id);
    
    // Optimistic UI update
    let newWishlist: CatalogProduct[];
    if (exists) {
      newWishlist = wishlist.filter((w) => w._id !== product._id);
    } else {
      newWishlist = [...wishlist, product];
    }
    setWishlist(newWishlist);

    if (user) {
      // Optimistic user-specific localStorage update
      localStorage.setItem(`sri_sakthi_wishlist_${user._id}`, JSON.stringify(newWishlist));
      try {
        if (exists) {
          // Delete from server wishlist
          const res = await fetch(`${API_URL}/wishlist/${product._id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (!res.ok) {
            // Revert optimistic update
            setWishlist(wishlist);
            localStorage.setItem(`sri_sakthi_wishlist_${user._id}`, JSON.stringify(wishlist));
            console.error('Failed to remove from server wishlist');
          }
        } else {
          // Add to server wishlist
          const res = await fetch(`${API_URL}/wishlist`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId: product._id }),
          });
          if (!res.ok) {
            // Revert optimistic update
            setWishlist(wishlist);
            localStorage.setItem(`sri_sakthi_wishlist_${user._id}`, JSON.stringify(wishlist));
            console.error('Failed to add to server wishlist');
          }
        }
      } catch (error) {
        // Revert optimistic update
        setWishlist(wishlist);
        localStorage.setItem(`sri_sakthi_wishlist_${user._id}`, JSON.stringify(wishlist));
        console.error('Error syncing wishlist with server:', error);
      }
    } else {
      // Guest mode
      localStorage.setItem('sri_sakthi_wishlist_guest', JSON.stringify(newWishlist));
    }
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
