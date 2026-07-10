"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Smartphone, Copy, Check, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [pendingOrder, setPendingOrder] = useState(null);
  const [formData, setFormData] = useState({
    transactionId: '',
    senderNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const BKASH_NUMBER = "01700000000";

  useEffect(() => {
    const data = sessionStorage.getItem('pending_order');
    if (!data) {
      router.push('/checkout');
      return;
    }
    setPendingOrder(JSON.parse(data));
  }, [router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.transactionId.length < 8) {
      setError('Please enter a valid Transaction ID');
      return;
    }
    if (formData.senderNumber.length < 11) {
      setError('Please enter a valid bKash number');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate payment validation
    setTimeout(() => {
      try {
        const orderData = {
          ...pendingOrder,
          paymentDetails: {
            transactionId: formData.transactionId,
            senderNumber: formData.senderNumber,
            paidAt: new Date().toISOString()
          },
          status: 'processing'
        };

        // Save to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
        localStorage.setItem('aura_orders', JSON.stringify([orderData, ...existingOrders]));
        
        // Clear session and cart
        sessionStorage.removeItem('pending_order');
        clearCart();
        
        // Redirect to success
        router.push(`/success?orderId=${orderData.id}`);
      } catch (err) {
        setError('Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    }, 1500);
  };

  if (!pendingOrder) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <button
        onClick={() => router.push('/checkout')}
        className="mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-brand-rose"
      >
        <ArrowLeft className="h-4 w-4" /> Change Payment Method
      </button>

      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100 overflow-hidden relative">
        {/* bKash Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#E2136E]" />
        
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E2136E]/10">
            <Smartphone className="h-8 w-8 text-[#E2136E]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">bKash Payment</h1>
            <p className="text-slate-500 text-sm">Follow instructions to complete your order</p>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl bg-slate-50 p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Amount to Pay</span>
              <span className="text-2xl font-bold text-brand-rose">৳{pendingOrder.total.toLocaleString()}</span>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">Instruction:</p>
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Send Money to this bKash number:</p>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-dashed border-slate-300">
                  <span className="text-lg font-mono font-bold text-slate-900">{BKASH_NUMBER}</span>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-bold text-[#E2136E] hover:underline"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-700">Sender bKash Number</label>
              <input
                required
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.senderNumber}
                onChange={(e) => setFormData({...formData, senderNumber: e.target.value})}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 outline-none ring-[#E2136E]/10 transition-all focus:border-[#E2136E] focus:ring-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-700">Transaction ID</label>
              <input
                required
                type="text"
                placeholder="e.g. 8N7X6W5V"
                value={formData.transactionId}
                onChange={(e) => setFormData({...formData, transactionId: e.target.value.toUpperCase()})}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 outline-none ring-[#E2136E]/10 transition-all focus:border-[#E2136E] focus:ring-4"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-rose-600 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#E2136E] py-5 text-lg font-bold text-white shadow-xl shadow-[#E2136E]/20 transition-all hover:bg-[#c0105d] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </div>
            ) : "I Have Paid"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-brand-pink/30 p-4 text-brand-rose">
          <ShieldCheck className="h-6 w-6" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Your payment is secured and verified manually within 30 minutes.</p>
        </div>
      </div>
    </div>
  );
}
