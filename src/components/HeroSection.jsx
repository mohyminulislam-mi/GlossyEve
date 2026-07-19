"use client";

import { motion } from 'motion/react';
import { ArrowRight, Ruler } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import SizeCalculator from '@/components/SizeCalculator';

export default function HeroSection() {
  const [isSizeCalcOpen, setIsSizeCalcOpen] = useState(false);

  return (
    <>
      <section className="relative h-[80vh] w-full overflow-hidden bg-brand-pink">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/lingerie-hero/1920/1080?blur=4"
            alt="Hero"
            className="h-full w-full object-cover opacity-60"
            referrerPolicy="no-referrer" />
          
          <div className="absolute inset-0 bg-gradient-to-r from-brand-pink via-brand-pink/40 to-transparent" />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}>
              
              <h1 className="text-6xl font-serif font-bold leading-tight tracking-tight text-slate-900 sm:text-7xl">
                Elegance in <br />
                <span className="text-brand-rose italic">Every Layer</span>
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-slate-600">
                Discover our curated collection of premium intimate apparel. 
                Designed for comfort, crafted for confidence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-wrap gap-4">
              
              <Link
                href="/shop"
                className="flex items-center gap-2 rounded-full bg-brand-rose px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95">
                
                Shop Collection <ArrowRight className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsSizeCalcOpen(true)}
                className="flex items-center gap-2 rounded-full border-2 border-brand-rose bg-white/50 px-8 py-4 text-lg font-semibold text-brand-rose backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95">
                
                Find Your Size <Ruler className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <SizeCalculator isOpen={isSizeCalcOpen} onClose={() => setIsSizeCalcOpen(false)} />
    </>
  );
}
