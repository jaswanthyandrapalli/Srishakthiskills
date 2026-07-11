'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth, API_URL } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingBag, ArrowLeft, Star, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();
  const { user, getAuthHeaders } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist, addRecentlyViewed } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Interactive Zoom states
  const [zoomStyle, setZoomStyle] = useState({ backgroundImage: '', backgroundPosition: '0% 0%', display: 'none' });

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch Product & Reviews
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();
        
        if (res.ok && data.product) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setActiveImage(data.product.images[0]);
          setSelectedColor(data.product.colors[0]);
          addRecentlyViewed(data.product);
        }

        // Fetch Recommendations
        const recRes = await fetch(`${API_URL}/products/${id}/recommendations`);
        const recData = await recRes.json();
        if (recRes.ok) {
          setRecommendations(recData);
        }
      } catch (err) {
        console.warn('API error fetching product details. Initializing mock data.');
        
        // Mock fallback Saree
        const mockSaree = {
          _id: id,
          name: 'Kanchipuram Pure Silk Bridal Saree',
          price: 12500,
          discount: 10,
          category: 'Bridal',
          images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'An exquisite hand-woven pure Kanchipuram silk saree with rich zari border and traditional temple motifs. Hand-loomed with precision, this saree represents centuries of tradition and modern Indian luxury.',
          fabric: 'Pure Mulberry Silk with Gold Zari',
          colors: ['Deep Maroon', 'Scarlet Red', 'Royal Gold'],
          stock: 8,
          ratings: 4.8,
          numReviews: 2
        };

        const mockReviews = [
          { _id: 'r1', name: 'Anjali R.', rating: 5, comment: 'Simply stunning! The silk is heavy and has a beautiful shine.', createdAt: new Date().toISOString() },
          { _id: 'r2', name: 'Divya P.', rating: 4, comment: 'Perfect for weddings. The packing was premium too.', createdAt: new Date().toISOString() }
        ];

        setProduct(mockSaree);
        setReviews(mockReviews);
        setActiveImage(mockSaree.images[0]);
        setSelectedColor(mockSaree.colors[0]);
        addRecentlyViewed(mockSaree);
        setRecommendations([
          { _id: 'mock-rec-1', name: 'Venkatagiri Fine Cotton Saree', price: 2499, discount: 5, category: 'Cotton', images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'], fabric: 'Cotton', colors: ['Off-White'], stock: 15, ratings: 4.5 },
          { _id: 'mock-rec-2', name: 'Dharmavaram Double Silk Saree', price: 8999, discount: 15, category: 'Silk', images: ['https://images.unsplash.com/photo-1610030470298-40b355e71713?auto=format&fit=crop&w=600&q=80'], fabric: 'Silk', colors: ['Peacock Blue'], stock: 10, ratings: 4.7 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  // Handle image mouse movement for Zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      display: 'block'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle(prev => ({ ...prev, display: 'none' }));
  };

  const handleAddToCart = () => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      discount: product.discount,
      color: selectedColor,
      stock: product.stock
    }, quantity);
  };

  const handleBuyNow = () => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      discount: product.discount,
      color: selectedColor,
      stock: product.stock
    }, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError('Please write your review comment');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${product._id}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();

      if (res.ok) {
        setReviewSuccess(true);
        setReviews([data.review, ...reviews]);
        setComment('');
        // Reload product details to update average rating
        const pRes = await fetch(`${API_URL}/products/${product._id}`);
        const pData = await pRes.json();
        if (pRes.ok) {
          setProduct(pData.product);
        }
      } else {
        setReviewError(data.message || 'Could not submit review');
      }
    } catch (err) {
      setReviewError('Server offline. Reviews cannot be stored at this moment.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs font-light">
        Draping saree details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-sm text-red-500">Saree details could not be loaded.</p>
        <button onClick={() => router.back()} className="text-xs uppercase font-bold text-gold mt-4 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const effectivePrice = product.price * (1 - product.discount / 100);
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 font-sans-lux">
      
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center space-x-1 text-xs font-bold text-fg-custom/60 hover:text-gold transition-colors uppercase"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Images & Zoom Panel */}
        <div className="space-y-4">
          <div 
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-bg-custom border border-card-border cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />

            {/* Magnifier Glass overlay */}
            <div 
              className="absolute inset-0 pointer-events-none bg-repeat shadow-inner transition-opacity duration-200"
              style={{
                ...zoomStyle,
                backgroundSize: '200%',
              }}
            ></div>
          </div>

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {product.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img ? 'border-gold shadow-md scale-95' : 'border-card-border/55 hover:border-gold/50'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Configuration & Details */}
        <div className="space-y-6">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-widest text-gold">{product.category} Collection</span>
              
              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-full border border-card-border hover:bg-gold/10 transition-colors ${
                  inWishlist ? 'text-red-500 bg-red-500/5' : 'text-fg-custom/75'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
              </button>
            </div>
            
            <h1 className="font-serif-lux text-2xl sm:text-4xl font-extrabold tracking-wide text-fg-custom leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.ratings) ? 'fill-yellow-500 text-yellow-500' : 'text-fg-custom/25'}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-fg-custom">{product.ratings.toFixed(1)}</span>
              <span className="text-xs text-fg-custom/40">|</span>
              <span className="text-xs text-fg-custom/50 font-light">{reviews.length} reviews</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="bg-card-custom border border-card-border p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-extrabold text-gold">₹{Math.round(effectivePrice).toLocaleString('en-IN')}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-sm line-through text-fg-custom/40">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs bg-maroon text-white font-bold px-2 py-0.5 rounded-full">{product.discount}% OFF</span>
                </>
              )}
            </div>

            {/* Stock Level Tag */}
            <div>
              {product.stock <= 0 ? (
                <span className="text-xs text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-3 py-1 rounded-full">Out Of Stock</span>
              ) : product.stock <= 3 ? (
                <span className="text-xs text-orange-500 font-bold uppercase tracking-wider bg-orange-500/10 px-3 py-1 rounded-full">Only {product.stock} Left!</span>
              ) : (
                <span className="text-xs text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-3 py-1 rounded-full">In Stock</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-fg-custom/75">Description</h3>
            <p className="text-xs font-light text-fg-custom/80 leading-relaxed">{product.description}</p>
          </div>

          {/* Fabric Specifications */}
          <div className="grid grid-cols-2 gap-4 border-y border-card-border py-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-fg-custom/55">Fabric details</span>
              <p className="text-xs font-medium text-fg-custom">{product.fabric}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-fg-custom/55">Craft techniques</span>
              <p className="text-xs font-medium text-fg-custom">Handloom woven accents</p>
            </div>
          </div>

          {/* Colors Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-fg-custom/55">Select Saree Color</span>
              <div className="flex space-x-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                      selectedColor === color
                        ? 'border-gold text-gold bg-gold/5 font-bold shadow-sm'
                        : 'border-card-border text-fg-custom/80 hover:border-gold/40'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-[10px] uppercase font-bold text-fg-custom/55">Quantity</span>
                <div className="flex items-center border border-card-border rounded-lg overflow-hidden bg-bg-custom">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-xs text-fg-custom/60 hover:bg-gold/10 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-fg-custom">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-xs text-fg-custom/60 hover:bg-gold/10 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center space-x-2 border border-maroon text-maroon hover:bg-maroon/5 font-bold uppercase text-xs tracking-wider py-4 rounded-xl transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="shimmer-btn maroon-gradient text-white border border-gold/10 font-bold uppercase text-xs tracking-wider py-4 rounded-xl hover:opacity-95 shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Buy Saree Now</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* REVIEWS & FEEDBACK */}
      <section className="border-t border-card-border pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Review Form */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="font-serif-lux text-xl font-bold tracking-wide text-fg-custom">Customer Feedback</h2>
            <p className="text-xs text-fg-custom/60 font-light mt-1">Have you purchased this Saree? Share your feedback with us.</p>
          </div>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-4 shadow-sm">
              <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-gold">Write Review</h3>
              
              {reviewError && (
                <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs flex items-center space-x-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold">
                  Review published successfully! Thank you.
                </div>
              )}

              {/* Rating selection */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-fg-custom/60">Rating</span>
                <div className="flex space-x-1.5">
                  {[1,2,3,4,5].map((stars) => (
                    <button
                      type="button"
                      key={stars}
                      onClick={() => setRating(stars)}
                      className="text-xl text-yellow-500 transition-transform hover:scale-110"
                    >
                      {stars <= rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-fg-custom/60">Your Review</span>
                <textarea
                  placeholder="Review comments..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full bg-bg-custom text-xs border border-card-border rounded-xl p-3 focus:outline-none focus:border-gold text-fg-custom leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                className="w-full gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider py-3 rounded-lg shadow hover:opacity-90 transition-opacity"
              >
                Submit Feedback
              </button>
            </form>
          ) : (
            <div className="p-5 bg-card-custom border border-card-border rounded-2xl text-center space-y-3 shadow-sm">
              <p className="text-xs text-fg-custom/60 leading-relaxed font-light">Please log in to submit a review for this saree.</p>
              <Link href="/login" className="inline-block gold-gradient text-maroon-950 font-bold uppercase text-[10px] tracking-wider px-4 py-2.5 rounded-lg shadow">
                Log In
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom/80 border-b border-card-border pb-3">Reviews Feed ({reviews.length})</h3>

          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-card-custom/40 border border-card-border/60 rounded-xl">
              <p className="text-xs text-fg-custom/50 font-light">No reviews posted yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-card-custom border border-card-border p-5 rounded-2xl space-y-2 shadow-sm animate-in fade-in-25">
                  <div className="flex justify-between items-center">
                    <h4 className="font-serif-lux text-xs font-bold">{rev.name}</h4>
                    <span className="text-[9px] text-fg-custom/40 font-light">{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i} className="text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-fg-custom/80 font-light leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* AI PRODUCT RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <section className="border-t border-card-border pt-12 space-y-8">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="font-serif-lux text-xl sm:text-2xl font-bold tracking-wide">Recommended For You</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
