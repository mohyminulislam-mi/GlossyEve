"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Chrome, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      router.push('/account');
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-slate-200/50 border border-slate-50"
      >
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-serif text-4xl font-bold text-slate-900"
          >
            Welcome Back
          </motion.h2>
          <p className="mt-3 text-slate-500">Please enter your details to sign in</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-500"
          >
            <AlertCircle className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand-rose focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
              <Link href="#" className="text-xs font-bold text-brand-rose hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand-rose focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
            {!isSubmitting && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>

        <div className="relative py-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Or continue with</span>
        </div>

        <button
          onClick={loginWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose active:scale-[0.98]"
        >
          <Chrome className="h-5 w-5" />
          Google Account
        </button>

        <p className="text-center text-sm font-medium text-slate-500 pt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-brand-rose hover:underline">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
