'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_URL } from '@/context/AuthContext';
import { CatalogProduct } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, ArrowLeftRight, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = ['Silk', 'Cotton', 'Bridal', 'Designer', 'Party Wear', 'Handloom'];

function ShopCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync params with URL and fetch products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (category) queryParams.set('category', category);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (sort) queryParams.set('sort', sort);
        queryParams.set('page', page.toString());
        queryParams.set('limit', '8');

        // Update browser URL
        router.replace(`/shop?${queryParams.toString()}`);

        const res = await fetch(`${API_URL}/products?${queryParams.toString()}`);
        const data = await res.json();
        
        if (res.ok && data.products) {
          setProducts(data.products);
          setPages(data.pages);
          setTotal(data.total);
        }
      } catch (err) {
        console.warn('API connection refused. Fallback to mock saree catalog items.');
        // Seed mock data
        const mockProducts = [
          { _id: 'mock-silk-1', name: 'Kanchipuram Pure Silk Bridal Saree', price: 12500, discount: 10, category: 'Bridal', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'], fabric: 'Mulberry Silk', colors: ['Deep Maroon'], stock: 8, ratings: 4.8 },
          { _id: 'mock-cotton-1', name: 'Venkatagiri Fine Cotton Saree', price: 2499, discount: 5, category: 'Cotton', images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'], fabric: 'Venkatagiri Cotton', colors: ['Off-White'], stock: 15, ratings: 4.5 },
          { _id: 'mock-silk-2', name: 'Dharmavaram Double Silk Saree', price: 8999, discount: 15, category: 'Silk', images: ['https://images.unsplash.com/photo-1610030470298-40b355e71713?auto=format&fit=crop&w=600&q=80'], fabric: 'Dharmavaram Silk', colors: ['Peacock Blue'], stock: 10, ratings: 4.7 },
          { _id: 'mock-des-1', name: 'Banarasi Soft Georgette Saree', price: 6499, discount: 20, category: 'Designer', images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'], fabric: 'Georgette', colors: ['Crimson Red'], stock: 12, ratings: 4.6 },
          { _id: 'mock-hand-1', name: 'Gadwal Pure Handloom Saree', price: 5200, discount: 10, category: 'Handloom', images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'], fabric: 'Cotton-Silk Blend', colors: ['Emerald Green'], stock: 3, ratings: 4.9 },
          { _id: 'mock-party-1', name: 'Fancy Organza Party Saree', price: 3500, discount: 8, category: 'Party Wear', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'], fabric: 'Premium Organza', colors: ['Lavender Rose'], stock: 7, ratings: 4.4 }
        ];

        // Filter mocks client-side for consistent UX even when server is down
        let filtered = [...mockProducts];
        if (category) filtered = filtered.filter(p => p.category === category);
        if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
        if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
        if (sort === 'price_asc') filtered.sort((a,b) => a.price*(1-a.discount/100) - b.price*(1-b.discount/100));
        if (sort === 'price_desc') filtered.sort((a,b) => b.price*(1-b.discount/100) - a.price*(1-a.discount/100));

        setProducts(filtered.slice((page-1)*8, page*8));
        setPages(Math.ceil(filtered.length / 8) || 1);
        setTotal(filtered.length);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [search, category, minPrice, maxPrice, sort, page]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans-lux">
      
      {/* Header info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-card-border pb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="font-serif-lux text-3xl font-extrabold tracking-wide">Sri Sakthi Catalog</h1>
          <p className="text-xs text-fg-custom/60 font-light mt-1">Found {total} premium sarees crafted with traditional design.</p>
        </div>

        {/* Clear Filters indicator */}
        {(category || search || minPrice || maxPrice || sort) && (
          <button 
            onClick={clearFilters}
            className="flex items-center space-x-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase border border-red-500/20 px-3 py-1.5 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS PANEL */}
        <aside className="space-y-6 lg:col-span-1 bg-card-custom border border-card-border p-6 rounded-2xl h-fit">
          <div className="flex items-center space-x-2 border-b border-card-border pb-3">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider">Filters</h2>
          </div>

          {/* Search filter input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-fg-custom/60">Search</label>
            <input
              type="text"
              placeholder="Keyword..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom"
            />
          </div>

          {/* Categories filter list */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-fg-custom/60">Category</label>
            <div className="space-y-1.5">
              <button
                onClick={() => { setCategory(''); setPage(1); }}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition-colors ${
                  category === '' ? 'bg-gold/10 text-gold font-bold' : 'text-fg-custom/80 hover:bg-gold/5'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition-colors ${
                    category === cat ? 'bg-gold/10 text-gold font-bold' : 'text-fg-custom/80 hover:bg-gold/5'
                  }`}
                >
                  {cat} Sarees
                </button>
              ))}
            </div>
          </div>

          {/* Price Filters */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-fg-custom/60">Price Range (₹)</label>
            <div className="flex space-x-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-2.5 py-2 focus:outline-none focus:border-gold text-fg-custom text-center"
              />
              <span className="text-fg-custom/40 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-2.5 py-2 focus:outline-none focus:border-gold text-fg-custom text-center"
              />
            </div>
          </div>

          {/* Sorting Options */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 pb-1 border-t border-card-border pt-4">
              <ArrowLeftRight className="w-3.5 h-3.5 text-gold" />
              <label className="text-[10px] uppercase font-bold tracking-widest text-fg-custom/60">Sort By</label>
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom"
            >
              <option value="">Latest Collection</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="ratings">Avg Customer Review</option>
            </select>
          </div>

        </aside>

        {/* PRODUCTS SECTION */}
        <section className="lg:col-span-3 space-y-10">
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-fg-custom/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-card-custom border border-card-border rounded-2xl space-y-3">
              <p className="text-sm text-fg-custom/60">No premium sarees match your active filters.</p>
              <button 
                onClick={clearFilters}
                className="text-xs font-bold text-gold uppercase hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-in fade-in-20 duration-300">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-6 border-t border-card-border">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-card-border rounded-lg hover:border-gold disabled:opacity-40 disabled:hover:border-card-border transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold font-sans-lux px-4">
                    Page {page} of {pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="p-2 border border-card-border rounded-lg hover:border-gold disabled:opacity-40 disabled:hover:border-card-border transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </section>

      </div>
    </div>
  );
}

export default function ShopCatalog() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs font-light">
        Loading Luxury Catalog...
      </div>
    }>
      <ShopCatalogContent />
    </Suspense>
  );
}
