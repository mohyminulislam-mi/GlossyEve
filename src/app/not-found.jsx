"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-12"
      >
        <span className="text-[150px] font-serif font-black leading-none text-slate-50 opacity-10 sm:text-[250px]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex h-32 w-32 items-center justify-center rounded-full bg-brand-pink text-brand-rose shadow-2xl shadow-brand-rose/20"
          >
            <Search className="h-16 w-16" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4 font-serif text-5xl font-bold text-slate-900"
      >
        Page Not Found
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12 max-w-md text-slate-500"
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-full bg-brand-rose px-10 py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
        
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-10 py-4 font-bold text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
          Go Back
        </button>
      </motion.div>

      {/* Suggested Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-20"
      >
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">Popular Categories</p>
        <div className="flex flex-wrap justify-center gap-4">
          {['Bras', 'Panties', 'Nightwear', 'Sets'].map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${cat}`}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:text-brand-rose hover:shadow-md"
            >
              {cat}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
