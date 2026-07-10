"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-6 px-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-pink text-brand-rose">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-slate-500">Looks like you haven't added anything yet.</p>
        </div>
        <Link
          href="/shop"
          className="rounded-full bg-brand-rose px-8 py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95">
          
          Start Shopping
        </Link>
      </div>);

  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-12 text-4xl font-serif font-bold text-slate-900">Your Shopping Bag</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {cart.map((item) =>
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-6 rounded-3xl bg-white p-6 shadow-sm">
              
                <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="flex flex-grow flex-col justify-between py-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">{item.name}</h3>
                      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                        Size: {item.selectedSize} | Color: {item.selectedColor}
                      </p>
                    </div>
                    <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-500">
                    
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-1">
                      <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-brand-rose">
                      
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-4 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-brand-rose">
                      
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-brand-rose">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-serif font-bold text-slate-900">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({totalItems} items)</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Shipping</span>
                <span className="text-green-600 font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-brand-pink pt-4">
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-brand-rose">৳{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-rose py-5 text-lg font-bold text-white shadow-xl shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95">
              
              Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-brand-pink/50 p-4 text-brand-rose">
            <ShieldCheck className="h-6 w-6" />
            <p className="text-xs font-bold uppercase tracking-wider">Discrete & Private Packaging Guaranteed</p>
          </div>
        </div>
      </div>
    </div>);

}