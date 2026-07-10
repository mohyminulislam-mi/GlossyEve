"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, ArrowRight, Chrome, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPromptModal({ isOpen, onClose, onGuestMode, loginWithGoogle }) {
  const router = useRouter();

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
          className="relative w-full max-w-md rounded-[2.5rem] bg-white p-10 text-center shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-pink text-brand-rose">
            <User className="h-10 w-10" />
          </div>

          <h2 className="text-3xl font-serif font-bold text-slate-900">Checkout</h2>
          <p className="mt-3 text-slate-500">
            You are not logged in. Login করলে আপনার order history save থাকবে।
          </p>

          <div className="mt-10 space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95"
            >
              ✅ Login to Account
            </button>
            
            <button
              onClick={loginWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose active:scale-95"
            >
              <Chrome className="h-5 w-5" />
              Sign in with Google
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Or</span>
            </div>

            <button
              onClick={onGuestMode}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
            >
              ➡️ Continue as Guest
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
