"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';

export default function ProductCard({ product, className }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { profile } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Normalize product data — supports both mock data & backend API response
  const productId = product._id || product.id;
  const productName = product.name;
  const productPrice = product.discountPrice || product.price;
  const productOriginalPrice = product.discountPrice ? product.price : null;
  const productImages = product.images || [];
  const productImage = productImages[0] || 'https://picsum.photos/seed/placeholder/600/800';
  const productInStock = product.inStock !== undefined
    ? product.inStock
    : (product.stock !== undefined ? product.stock > 0 : true);
  const productCategory = typeof product.category === 'object' && product.category !== null
    ? product.category.name
    : product.category;
  const productSizes = product.sizes || [];
  const productColors = product.colors || [];
  const productSlug = product.slug || productId;

  const isWishlisted = isInWishlist(productId);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Build a normalized product object for the cart
    const cartProduct = {
      ...product,
      id: productId,
      images: productImages,
      sizes: productSizes,
      colors: productColors,
    };
    addToCart(cartProduct, 1, productSizes[0], productColors[0]);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist({ ...product, id: productId });
  };

  const handleCardClick = () => {
    router.push(`/product/${productSlug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className={cn("group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-xl", className)}>
      
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
        <img
          src={productImage}
          alt={productName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer" />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-rose shadow-lg transition-transform hover:scale-110 active:scale-95">
            
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            onClick={handleWishlist}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95",
              isWishlisted ? "bg-brand-rose text-white" : "bg-white text-brand-rose"
            )}>
            
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-rose shadow-lg transition-transform hover:scale-110 active:scale-95">
            
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Out of Stock badge */}
        {!productInStock &&
          <div className="absolute top-4 left-4 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Out of Stock
          </div>
        }

        {/* Discount badge */}
        {productOriginalPrice && (
          <div className="absolute top-4 right-4 rounded-full bg-brand-rose px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Sale
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        {productCategory && (
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{productCategory}</p>
        )}
        <h3 className="font-serif text-lg font-semibold text-slate-900 line-clamp-1">{productName}</h3>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-brand-rose">৳{productPrice?.toLocaleString()}</p>
          {productOriginalPrice && (
            <p className="text-sm text-slate-400 line-through">৳{productOriginalPrice.toLocaleString()}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}