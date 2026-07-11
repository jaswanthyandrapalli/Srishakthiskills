'use client';

import React from 'react';
import Link from 'next/link';
import { CatalogProduct, useCart } from '@/context/CartContext';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: CatalogProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  
  const inWishlist = isInWishlist(product._id);
  const effectivePrice = product.price * (1 - product.discount / 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Don't trigger the Link click
    addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      discount: product.discount,
      color: product.colors[0],
      stock: product.stock,
    }, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Don't trigger the Link click
    toggleWishlist(product);
  };

  return (
    <Link href={`/product/${product._id}`} className="group block bg-card-custom border border-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative">
      
      {/* Product Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-bg-custom zoom-container">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-top zoom-image"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs">
            No Saree Image
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-maroon text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm z-10 border border-gold/25">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Button Toggle */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 rounded-full glassmorphism text-fg-custom shadow-md hover:scale-110 transition-transform z-10"
          aria-label="Wishlist Saree"
        >
          <Heart className={`w-4 h-4 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-fg-custom/80'}`} />
        </button>

        {/* Stock warning overlay */}
        {product.stock <= 0 ? (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-serif-lux font-bold text-sm tracking-wide z-10">
            Out Of Stock
          </div>
        ) : product.stock <= 3 ? (
          <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow">
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Saree details */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold">{product.category} Sarees</span>
          <span className="text-[10px] font-light text-fg-custom/50 truncate max-w-[100px]">{product.fabric}</span>
        </div>

        <h3 className="font-serif-lux text-xs sm:text-sm font-bold tracking-wide text-fg-custom line-clamp-1 group-hover:text-gold transition-colors">
          {product.name}
        </h3>

        {/* Ratings review count */}
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-[10px] font-bold text-fg-custom">{product.ratings.toFixed(1)}</span>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="flex justify-between items-center pt-1.5 border-t border-card-border/50">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-xs line-through text-fg-custom/40">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-sm font-extrabold text-gold">₹{Math.round(effectivePrice).toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-sm font-extrabold text-fg-custom">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-full maroon-gradient text-white hover:scale-105 active:scale-95 transition-all shadow-md border border-gold/25"
              aria-label="Quick Add To Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
