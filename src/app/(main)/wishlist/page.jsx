"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/context/CartContext';
import { MOCK_PRODUCTS } from '@/constants';

export default function Wishlist() {
  const { wishlist, toggleWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();

  const wishlistProducts = MOCK_PRODUCTS.filter((p) =>
    wishlist.some(item => item.id === p.id)
  );

  if (!isLoaded) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900">My Wishlist</h1>
        <p className="mt-2 text-slate-500">{wishlistProducts.length} items saved for later</p>
      </div>

      {wishlistProducts.length > 0 ?
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {wishlistProducts.map((product) =>
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 transition-all hover:shadow-xl">
            
                <Link href={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden">
                  <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer" />
              
                </Link>

                <button
              onClick={() => toggleWishlist({ id: product.id })}
              className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-brand-rose backdrop-blur-sm transition-all hover:bg-white">
              
                  <Trash2 className="h-5 w-5" />
                </button>

                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product.category}</span>
                    <span className="font-bold text-brand-rose">৳{product.price.toLocaleString()}</span>
                  </div>
                  <Link href={`/product/${product.id}`} className="block">
                    <h3 className="mb-4 truncate font-bold text-slate-900 transition-colors hover:text-brand-rose">{product.name}</h3>
                  </Link>

                  <button
                onClick={() => addToCart(product, 1, product.sizes[0], product.colors[0])}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800">
                
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </button>
                </div>
              </motion.div>
          )}
          </AnimatePresence>
        </div> :

      <div className="flex h-96 flex-col items-center justify-center space-y-6 rounded-[3rem] bg-slate-50 text-center">
          <div className="rounded-full bg-white p-8 shadow-sm">
            <Heart className="h-12 w-12 text-slate-200" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Your wishlist is empty</h2>
            <p className="text-slate-500">Explore our collection and save your favorites!</p>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 rounded-2xl bg-brand-rose px-8 py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500">
            Start Shopping <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      }
    </div>);

}