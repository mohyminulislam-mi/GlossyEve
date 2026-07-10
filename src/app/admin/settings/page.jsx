"use client";

import React, { useState, useEffect } from 'react';
import { Globe, CreditCard, Save, Percent, Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const localSettings = localStorage.getItem('aura_settings');
    if (localSettings) {
      setSettings(JSON.parse(localSettings));
    } else {
      const defaultSettings = {
        siteName: 'AURA',
        taxRate: 5,
        shippingFee: 100,
        freeShippingThreshold: 5000,
        paymentMethods: ['cod', 'bkash', 'card']
      };
      localStorage.setItem('aura_settings', JSON.stringify(defaultSettings));
      setSettings(defaultSettings);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      localStorage.setItem('aura_settings', JSON.stringify(settings));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-rose border-t-transparent"></div>
    </div>);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Website Settings</h1>
          <p className="text-slate-500">Configure your store's general preferences and policies.</p>
        </div>
        {showSuccess &&
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
          
            <CheckCircle2 className="h-4 w-4" /> Settings saved successfully!
          </motion.div>
        }
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-brand-pink text-brand-rose">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900">General Configuration</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Store Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose" />
                
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Support Email</label>
                <input
                  type="email"
                  defaultValue="support@aura.com"
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose" />
                
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-brand-pink text-brand-rose">
                <Truck className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900">Shipping & Taxes</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 pl-10 text-sm font-bold outline-none focus:border-brand-rose" />
                  
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Shipping Fee (৳)</label>
                <input
                  type="number"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose" />
                
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Free Shipping (৳)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose" />
                
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-brand-pink text-brand-rose">
                <CreditCard className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900">Payment Options</h2>
            </div>

            <div className="space-y-4">
              {['cod', 'bkash', 'card', 'nagad'].map((method) =>
              <label key={method} className="flex items-center justify-between rounded-xl border-2 border-slate-50 p-4 transition-all hover:border-brand-rose cursor-pointer">
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-600">{method}</span>
                  <input
                  type="checkbox"
                  checked={settings.paymentMethods.includes(method)}
                  onChange={(e) => {
                    const newMethods = e.target.checked ?
                    [...settings.paymentMethods, method] :
                    settings.paymentMethods.filter((m) => m !== method);
                    setSettings({ ...settings, paymentMethods: newMethods });
                  }}
                  className="h-5 w-5 rounded border-slate-300 text-brand-rose focus:ring-brand-rose" />
                
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl transition-all hover:bg-slate-800 disabled:opacity-50">
            
            {saving ?
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> :

            <>
                <Save className="h-5 w-5" /> Save All Changes
              </>
            }
          </button>
        </div>
      </form>
    </div>);

}