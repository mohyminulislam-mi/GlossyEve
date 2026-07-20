"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, ShoppingBag, LayoutDashboard, Package } from "lucide-react";

// ─── Success Content (needs Suspense because it reads useSearchParams) ────────
function SuccessContent() {
  const searchParams = useSearchParams();
  const invoiceNumber = searchParams.get("invoiceNumber");
  const trackingId = searchParams.get("trackingId");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-100/50"
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md w-full space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-slate-900">
            Order Confirmed! 🎉
          </h1>
          <p className="text-lg text-slate-500">
            Thank you for your purchase. Your order has been received and is
            being processed.
          </p>
        </div>

        {/* Order details box */}
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 space-y-3 text-left">
          {invoiceNumber && (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">Invoice</span>
              </div>
              <span className="font-mono text-sm font-bold text-slate-900">
                {invoiceNumber}
              </span>
            </div>
          )}

          {trackingId && (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">Tracking ID</span>
              </div>
              <span className="font-mono text-sm font-bold text-slate-900">
                {trackingId}
              </span>
            </div>
          )}

          {!invoiceNumber && !trackingId && (
            <p className="text-sm text-slate-500 text-center">
              Check your dashboard for order details.
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/my-orders"
            className="flex items-center justify-center gap-2 rounded-full bg-brand-rose px-8 py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95"
          >
            <LayoutDashboard className="h-5 w-5" /> Track Your Order
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-100 bg-white px-8 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="h-5 w-5" /> Continue Shopping
          </Link>
        </div>
      </motion.div>

      {/* Footnote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-sm text-slate-400 italic"
      >
        We'll notify you when your order is shipped.
      </motion.p>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-rose border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
