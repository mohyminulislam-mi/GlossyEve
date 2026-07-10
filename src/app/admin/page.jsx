"use client";

import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, AlertCircle, Ticket } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/constants';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import mockOrders from '@/data/orders.json';
import mockUsers from '@/data/users.json';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: MOCK_PRODUCTS.length,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    const allOrders = [...localOrders, ...mockOrders];
    
    const revenue = allOrders.reduce((sum, order) => sum + (order.status !== 'canceled' ? order.total : 0), 0);
    
    setStats({
      totalUsers: mockUsers.length,
      totalOrders: allOrders.length,
      totalRevenue: revenue,
      totalProducts: MOCK_PRODUCTS.length,
      recentOrders: allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    });
    setLoading(false);
  }, []);

  const statCards = [
  { label: 'Total Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+12.5%', isUp: true },
  { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-brand-rose', bg: 'bg-brand-pink', trend: '+8.2%', isUp: true },
  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+5.1%', isUp: true },
  { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-2.4%', isUp: false }];


  if (loading) return <div>Loading statistics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) =>
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
              stat.isUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
            )}>
                {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-slate-900">Recent Orders</h2>
            <button className="text-sm font-bold text-brand-rose hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-50">
                  <th className="pb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Order ID</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentOrders.map((order) =>
                <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 text-sm text-slate-600">{order.shippingAddress.fullName}</td>
                    <td className="py-4 text-sm font-bold text-brand-rose">৳{order.total.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                      order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" :
                      order.status === 'canceled' ? "bg-rose-50 text-rose-600" :
                      order.status === 'processing' ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                        {order.status === 'delivered' && <CheckCircle2 className="h-3 w-3" />}
                        {order.status === 'canceled' && <XCircle className="h-3 w-3" />}
                        {order.status === 'processing' && <Clock className="h-3 w-3" />}
                        {order.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 hover:border-brand-rose hover:bg-brand-pink/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-pink text-brand-rose">
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">Add New Product</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand-rose" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 hover:border-brand-rose hover:bg-brand-pink/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                  <Ticket className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">Create Coupon</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand-rose" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 hover:border-brand-rose hover:bg-brand-pink/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">Sales Report</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand-rose" />
            </button>
          </div>
        </div>
      </div>
    </div>);

}