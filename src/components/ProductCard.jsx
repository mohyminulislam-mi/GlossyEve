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

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Quick add using first size and color
    addToCart(product, 1, product.sizes[0], product.colors[0]);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
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
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer" />
        
        
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
            onClick={(e) => {e.stopPropagation();handleCardClick();}}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-rose shadow-lg transition-transform hover:scale-110 active:scale-95">
            
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {!product.inStock &&
        <div className="absolute top-4 left-4 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Out of Stock
          </div>
        }
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{product.category}</p>
        <h3 className="font-serif text-lg font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
        <p className="text-lg font-bold text-brand-rose">৳{product.price.toLocaleString()}</p>
      </div>
    </motion.div>);

}