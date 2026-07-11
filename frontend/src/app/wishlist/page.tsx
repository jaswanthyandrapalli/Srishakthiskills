'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { t } = useLanguage();
  const { wishlist } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans-lux">
      <div>
        <h1 className="font-serif-lux text-3xl font-extrabold tracking-wide">My Wishlist</h1>
        <p className="text-xs text-fg-custom/60 font-light mt-1">Sarees you have saved for later.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-card-custom border border-card-border rounded-2xl space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <p className="text-sm text-fg-custom/60 leading-relaxed font-light">{t('wishlist_empty')}</p>
          <Link href="/shop" className="inline-block gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider px-6 py-3.5 rounded-xl shadow">
            Browse Saree Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in-25 duration-300">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
