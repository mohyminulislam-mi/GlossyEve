"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, ArrowRight, User } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-100/50"
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md space-y-4"
      >
        <h1 className="text-4xl font-serif font-bold text-slate-900">Order Confirmed!</h1>
        <p className="text-lg text-slate-500">
          Thank you for your purchase. We've received your order and it's being processed.
        </p>
        
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
          <p className="text-xl font-mono font-bold text-slate-900">#{orderId || 'N/A'}</p>
        </div>

        <div className="pt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.push('/account')}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-rose px-8 py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95"
          >
            <User className="h-5 w-5" /> View Order Status
          </button>
          <button
            onClick={() => router.push('/shop')}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-100 bg-white px-8 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="h-5 w-5" /> Continue Shopping
          </button>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-sm text-slate-400 italic"
      >
        A confirmation email has been sent to your registered address.
      </motion.p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex h-[70vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-rose border-t-transparent"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
