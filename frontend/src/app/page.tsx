'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { API_URL } from '@/context/AuthContext';
import { CatalogProduct } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { Sparkles, ArrowRight, Heart, Award, ShieldCheck, Truck } from 'lucide-react';

const CATEGORIES = [
  { name: 'Silk', label: 'Silk Sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80' },
  { name: 'Cotton', label: 'Cotton Sarees', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80' },
  { name: 'Bridal', label: 'Bridal Sarees', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
  { name: 'Designer', label: 'Designer Sarees', img: 'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=300&q=80' },
  { name: 'Party Wear', label: 'Party Wear', img: 'https://images.unsplash.com/photo-1610030470298-40b355e71713?auto=format&fit=crop&w=300&q=80' },
  { name: 'Handloom', label: 'Handloom', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80' },
];

const TESTIMONIALS = [
  { name: 'Anjali R.', city: 'Vijayawada', text: 'The Kanchipuram silk saree I ordered for my daughters wedding is breath-taking! The zari work is pure and the weight feels authentic. True luxury.', rating: 5 },
  { name: 'Prathyusha K.', city: 'Hyderabad', text: 'I am so impressed by their Venkatagiri cotton sarees. Super light, perfect for hot days, and the colors are vibrant even after multiple washes.', rating: 5 },
  { name: 'Sujatha M.', city: 'Nandigama', text: 'I have been buying from Sri Sakthi Sarees physically in Raithupeta for years. Having their collection online is wonderful! Their collection is always unique.', rating: 5 }
];

const INSTAGRAM_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1610030470298-40b355e71713?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=250&q=80'
];

export default function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await fetch(`${API_URL}/products?limit=8`);
        const data = await res.json();
        if (res.ok && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.warn('Backend server offline. Displaying client-side sample products.');
        // Fallback mockup local data
        setProducts([
          {
            _id: 'sample-1',
            name: 'Kanchipuram Pure Silk Bridal Saree',
            price: 12500,
            discount: 10,
            category: 'Bridal',
            images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'],
            description: 'Exquisite hand-woven pure Kanchipuram silk saree with rich gold zari.',
            fabric: 'Mulberry Silk',
            colors: ['Deep Maroon', 'Gold'],
            stock: 5,
            ratings: 4.9
          },
          {
            _id: 'sample-2',
            name: 'Venkatagiri Fine Cotton Saree',
            price: 2499,
            discount: 5,
            category: 'Cotton',
            images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'],
            description: 'Lightweight and highly breathable cotton Saree.',
            fabric: 'Venkatagiri Cotton',
            colors: ['Off-White'],
            stock: 12,
            ratings: 4.6
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        {/* Background Saree Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80"
            alt="Saree Banner"
            className="w-full h-full object-cover object-top filter brightness-40"
          />
          {/* Elegant Maroon Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4D0000]/90 via-[#800000]/60 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-white space-y-6">
          <div className="flex items-center space-x-2 text-gold">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold">Traditional Luxury Wear</span>
          </div>

          <h1 className="font-serif-lux text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-wide max-w-4xl">
            {t('hero_title')}
          </h1>

          <p className="text-sm sm:text-lg max-w-xl font-light text-[#F4EFEA]/80 tracking-wide font-sans-lux leading-relaxed">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Link 
              href="/shop" 
              className="shimmer-btn gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider px-8 py-4 rounded shadow-lg hover:shadow-2xl transition-transform active:scale-95 text-center"
            >
              {t('btn_shop_now')}
            </Link>
            <Link 
              href="/contact" 
              className="border border-[#F8D97D] text-[#F8D97D] hover:bg-[#F8D97D]/10 font-bold uppercase text-xs tracking-wider px-8 py-4 rounded transition-colors text-center"
            >
              {t('btn_contact_us')}
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED BENEFITS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gold/10 rounded-xl text-gold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-lux text-xs font-bold uppercase tracking-wider">Premium Quality</h4>
              <p className="text-[10px] text-fg-custom/60 font-light">100% genuine pure silk & cotton</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gold/10 rounded-xl text-gold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-lux text-xs font-bold uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[10px] text-fg-custom/60 font-light">On all orders above ₹2,000</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gold/10 rounded-xl text-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-lux text-xs font-bold uppercase tracking-wider">Secure Checkout</h4>
              <p className="text-[10px] text-fg-custom/60 font-light">Verified Razorpay payment gateway</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gold/10 rounded-xl text-gold">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-lux text-xs font-bold uppercase tracking-wider">Loyalty Perks</h4>
              <p className="text-[10px] text-fg-custom/60 font-light">Exclusive coupon code discounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif-lux text-2xl sm:text-4xl font-bold tracking-wide">Curated Saree Collections</h2>
          <div className="h-[1px] w-24 maroon-gradient mx-auto"></div>
          <p className="text-xs text-fg-custom/60 font-light max-w-md mx-auto">Explore high-quality sarees handpicked for weddings, festivals, parties and daily comfort.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, index) => (
            <Link
              key={index}
              href={`/shop?category=${cat.name}`}
              className="group relative h-60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-card-border"
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-90 group-hover:brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-center">
                <span className="font-serif-lux text-xs font-bold text-white tracking-widest uppercase">
                  {cat.label}
                </span>
                <span className="text-[9px] text-gold font-light mt-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  View All <ArrowRight className="w-2.5 h-2.5 ml-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end border-b border-card-border pb-4">
          <div>
            <h2 className="font-serif-lux text-2xl sm:text-3xl font-bold tracking-wide">{t('best_sellers')}</h2>
            <p className="text-xs text-fg-custom/60 font-light mt-1">Our most loved, high-demand pure silk and handloom designs.</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-gold hover:underline flex items-center space-x-1 uppercase tracking-wider">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-fg-custom/5 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-[#800000]/5 py-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-serif-lux text-2xl sm:text-4xl font-bold tracking-wide text-fg-custom">Words From Our Customers</h2>
            <div className="h-[1px] w-20 maroon-gradient mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, index) => (
              <div key={index} className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex text-gold">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <p className="text-xs font-light text-fg-custom/80 italic leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <h4 className="font-serif-lux text-xs font-bold text-fg-custom">{t.name}</h4>
                  <span className="text-[9px] text-fg-custom/50 font-light">{t.city}, AP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <h2 className="font-serif-lux text-xl font-bold uppercase tracking-widest text-fg-custom/90">#SriSakthiSarees</h2>
          <p className="text-[10px] text-fg-custom/50 font-light mt-1">Tag us on Instagram to get featured in our saree catalog.</p>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {INSTAGRAM_IMAGES.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-card-border">
              <img
                src={img}
                alt={`Instagram Feature ${index}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-white font-bold tracking-wider">♥ Like</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
