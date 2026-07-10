"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500"
      >
        <AlertCircle className="h-12 w-12" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 font-serif text-4xl font-bold text-slate-900"
      >
        Oops! Something went wrong
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12 max-w-md text-slate-500"
      >
        We encountered an unexpected error. Don't worry, our team has been notified. 
        In the meantime, you can try refreshing the page.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-full bg-brand-rose px-8 py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:scale-105 active:scale-95"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </motion.div>

      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 w-full max-w-2xl overflow-hidden rounded-3xl bg-slate-50 p-6 text-left"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Error Details (Dev Mode):</p>
          <pre className="overflow-x-auto text-sm text-rose-600 font-mono">
            {error?.message || 'Unknown error'}
            {error?.stack && `\n\n${error.stack}`}
          </pre>
        </motion.div>
      )}
    </div>
  );
}