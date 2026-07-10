"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Ticket, Trash2, Edit2, Calendar, Hash, X, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localCoupons = localStorage.getItem('aura_coupons');
    if (localCoupons) {
      setCoupons(JSON.parse(localCoupons));
    } else {
      const defaultCoupons = [
        { id: 'c1', code: 'AURA10', discountType: 'percentage', discountValue: 10, expirationDate: '2024-12-31', usageLimit: 100, usageCount: 5, isActive: true }
      ];
      localStorage.setItem('aura_coupons', JSON.stringify(defaultCoupons));
      setCoupons(defaultCoupons);
    }
    setLoading(false);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      const localCoupons = JSON.parse(localStorage.getItem('aura_coupons') || '[]');
      const updated = localCoupons.filter(c => c.id !== id);
      localStorage.setItem('aura_coupons', JSON.stringify(updated));
      setCoupons(updated);
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const localCoupons = JSON.parse(localStorage.getItem('aura_coupons') || '[]');
    const updated = localCoupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c);
    localStorage.setItem('aura_coupons', JSON.stringify(updated));
    setCoupons(updated);
  };

  const filteredCoupons = coupons.filter((c) =>
  c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Coupon Management</h1>
          <p className="text-slate-500">Create and manage discount codes for your customers.</p>
        </div>
        <button
          onClick={() => {setEditingCoupon(null);setIsModalOpen(true);}}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-rose px-6 py-3 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95">
          
          <Plus className="h-5 w-5" /> Create Coupon
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-rose" />
          
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.map((coupon) =>
        <motion.div
          key={coupon.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
          
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-brand-pink text-brand-rose">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-wider">{coupon.code}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `৳${coupon.discountValue} OFF`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                onClick={() => {setEditingCoupon(coupon);setIsModalOpen(true);}}
                className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-all">
                
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                onClick={() => handleDelete(coupon.id)}
                className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all">
                
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Expires
                </span>
                <span className="font-bold text-slate-900">{new Date(coupon.expirationDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Usage
                </span>
                <span className="font-bold text-slate-900">{coupon.usageCount} / {coupon.usageLimit}</span>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                coupon.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                  {coupon.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                className="text-xs font-bold text-brand-rose hover:underline">
                
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isModalOpen &&
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          
            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <CouponForm
              coupon={editingCoupon}
              onClose={() => setIsModalOpen(false)} />
            
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}

function CouponForm({ coupon, onClose }) {
  const [formData, setFormData] = useState(coupon || {
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    usageCount: 0,
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const localCoupons = JSON.parse(localStorage.getItem('aura_coupons') || '[]');
      
      if (coupon?.id) {
        // Update
        const updated = localCoupons.map(c => c.id === coupon.id ? formData : c);
        localStorage.setItem('aura_coupons', JSON.stringify(updated));
      } else {
        // Add new
        const newCoupon = { ...formData, id: `c-${Math.random().toString(36).substr(2, 9)}` };
        localStorage.setItem('aura_coupons', JSON.stringify([...localCoupons, newCoupon]));
      }
      
      window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Coupon Code</label>
        <input
          required
          type="text"
          placeholder="e.g., SUMMER20"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold tracking-wider outline-none focus:border-brand-rose" />
        
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Discount Type</label>
          <select
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose">
            
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (৳)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Value</label>
          <input
            required
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
          
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Expiration Date</label>
          <input
            required
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
          
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Usage Limit</label>
          <input
            required
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
          
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500">
        
        {coupon ? 'Update Coupon' : 'Create Coupon'}
      </button>
    </form>);

}