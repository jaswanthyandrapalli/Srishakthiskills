'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Sparkles, Tag } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function CartPage() {
  const { t } = useLanguage();
  const { 
    cartItems, 
    updateCartQty, 
    removeFromCart, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    getCartTotal, 
    getDiscountAmount, 
    getFinalTotal,
    recentlyViewed
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess(false);

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Seeding validation check
    const total = getCartTotal();

    if (code === 'WELCOME500') {
      if (total < 3000) {
        setCouponError('Minimum order value of ₹3,000 required for WELCOME500.');
        return;
      }
      applyCoupon({
        code: 'WELCOME500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderValue: 3000
      });
      setCouponSuccess(true);
      setCouponCode('');
    } else if (code === 'FESTIVE20') {
      if (total < 5000) {
        setCouponError('Minimum order value of ₹5,000 required for FESTIVE20.');
        return;
      }
      applyCoupon({
        code: 'FESTIVE20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 5000
      });
      setCouponSuccess(true);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME500 or FESTIVE20.');
    }
  };

  const total = getCartTotal();
  const discount = getDiscountAmount();
  const shipping = total > 2000 || total === 0 ? 0 : 100;
  const finalTotal = getFinalTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 font-sans-lux">
      <div>
        <h1 className="font-serif-lux text-3xl font-extrabold tracking-wide">Shopping Bag</h1>
        <p className="text-xs text-fg-custom/60 font-light mt-1">Review your premium sarees before checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-card-custom border border-card-border rounded-2xl space-y-4">
          <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <p className="text-sm text-fg-custom/60 leading-relaxed font-light">{t('cart_empty')}</p>
          <Link href="/shop" className="inline-block gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider px-6 py-3.5 rounded-xl shadow">
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const discountedPrice = item.price * (1 - item.discount / 100);
              return (
                <div key={`${item.product}-${item.color}`} className="flex flex-col sm:flex-row items-start sm:items-center bg-card-custom border border-card-border p-4 rounded-2xl gap-4 shadow-sm relative">
                  
                  {/* Saree Thumbnail */}
                  <div className="w-24 aspect-[3/4] rounded-lg overflow-hidden border border-card-border flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                  </div>

                  {/* Saree Info */}
                  <div className="flex-grow space-y-1">
                    <h3 className="font-serif-lux text-sm font-bold text-fg-custom line-clamp-1">{item.name}</h3>
                    <p className="text-[10px] text-fg-custom/50 font-light">Color selected: <span className="font-bold text-gold">{item.color}</span></p>
                    
                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-sm font-extrabold text-gold">₹{Math.round(discountedPrice).toLocaleString('en-IN')}</span>
                      {item.discount > 0 && (
                        <span className="text-xs line-through text-fg-custom/40">₹{item.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center border border-card-border rounded-lg overflow-hidden bg-bg-custom sm:self-center">
                    <button
                      onClick={() => updateCartQty(item.product, item.color, item.quantity - 1)}
                      className="px-2.5 py-1 text-fg-custom/60 hover:bg-gold/10 transition-colors font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-fg-custom">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.product, item.color, item.quantity + 1)}
                      className="px-2.5 py-1 text-fg-custom/60 hover:bg-gold/10 transition-colors font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Trash action */}
                  <button
                    onClick={() => removeFromCart(item.product, item.color)}
                    className="p-2 text-fg-custom/40 hover:text-red-500 transition-colors sm:self-center"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                </div>
              );
            })}
          </div>

          {/* Pricing Summary Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-6">
              <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom border-b border-card-border pb-3">Bag Summary</h2>
              
              <div className="space-y-3 text-xs font-light text-fg-custom/85">
                <div className="flex justify-between">
                  <span>Saree Subtotal</span>
                  <span className="font-bold">₹{Math.round(total).toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-500 font-medium">
                    <span className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1" /> Coupon ({appliedCoupon.code})</span>
                    <span>- ₹{Math.round(discount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  {shipping === 0 ? (
                    <span className="text-green-500 font-medium">FREE</span>
                  ) : (
                    <span className="font-bold">₹{shipping}</span>
                  )}
                </div>

                {shipping > 0 && (
                  <p className="text-[10px] text-fg-custom/50 italic font-light pt-1">Add ₹{(2000 - total).toLocaleString('en-IN')} more to get FREE shipping!</p>
                )}
              </div>

              {/* Final price */}
              <div className="border-t border-card-border pt-4 flex justify-between items-baseline">
                <span className="font-serif-lux text-xs font-bold uppercase tracking-wider">Estimated Total</span>
                <span className="text-xl font-extrabold text-gold">₹{Math.round(finalTotal).toLocaleString('en-IN')}</span>
              </div>

              {/* Coupon Form input */}
              <div className="border-t border-card-border pt-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-fg-custom/60 flex items-center">
                  <Tag className="w-3.5 h-3.5 text-gold mr-1" />
                  <span>Promo Code</span>
                </span>
                
                {appliedCoupon ? (
                  <div className="bg-green-500/10 border border-green-500/25 p-3 rounded-lg flex justify-between items-center text-xs text-green-500">
                    <div>
                      <p className="font-bold">{appliedCoupon.code} Active</p>
                      <p className="text-[10px] text-green-500/80">Saving ₹{discount.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-[10px] uppercase font-bold text-red-500 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME500"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-bg-custom border border-card-border rounded-l-lg text-xs px-3 py-2.5 w-full focus:outline-none focus:border-gold text-fg-custom uppercase font-bold"
                    />
                    <button type="submit" className="gold-gradient text-maroon-950 text-xs font-bold uppercase px-4 rounded-r-lg hover:opacity-90 transition-opacity">
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[10px] text-green-500 font-bold">Promo code applied successfully!</p>
                )}
              </div>

              {/* Checkout Button link */}
              <Link
                href="/checkout"
                className="w-full text-center shimmer-btn maroon-gradient text-white border border-gold/15 font-bold uppercase text-xs tracking-wider py-4 rounded-xl hover:opacity-95 shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-1"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>
          </div>

        </div>
      )}

      {/* RECENTLY VIEWED PRODUCTS */}
      {recentlyViewed.length > 0 && (
        <section className="border-t border-card-border pt-12 space-y-8">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="font-serif-lux text-xl sm:text-2xl font-bold tracking-wide">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
