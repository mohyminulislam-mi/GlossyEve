"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderSummary, 
  isSubmitting 
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-pink text-brand-rose">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Place Order?</h2>
            <p className="mt-2 text-slate-500">Are you sure you want to place this order?</p>
          </div>

          <div className="space-y-4 rounded-3xl bg-slate-50 p-6 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Total Products</span>
              <span className="text-slate-900 font-bold">{orderSummary.itemCount} items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal Price</span>
              <span className="text-slate-900 font-bold">৳{orderSummary.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Delivery Charge</span>
              <span className="text-slate-900 font-bold">৳{orderSummary.shipping.toLocaleString()}</span>
            </div>
            {orderSummary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-bold">
                <span>Discount</span>
                <span>-৳{orderSummary.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">Total Price</span>
              <span className="text-xl font-bold text-brand-rose">৳{orderSummary.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Confirm Order
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full rounded-2xl border-2 border-slate-100 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
