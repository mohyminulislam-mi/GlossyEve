"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Download, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Cell, Pie } from 'recharts';
import mockOrders from '@/data/orders.json';
import { MOCK_PRODUCTS } from '@/constants';

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    setOrders([...localOrders, ...mockOrders]);
    setProducts(MOCK_PRODUCTS);
    setLoading(false);
  }, []);

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map((date) => {
    const dayOrders = orders.filter((o) => new Date(o.createdAt).toISOString().split('T')[0] === date);
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length
    };
  });

  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find((item) => item.name === p.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: p.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500">Track your business performance and customer trends.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 py-3 font-bold text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose">
          <Download className="h-5 w-5" /> Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          trend="+12.5%"
          isPositive={true}
          icon={<DollarSign className="h-6 w-6" />} />
        
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          trend="+8.2%"
          isPositive={true}
          icon={<ShoppingBag className="h-6 w-6" />} />
        
        <StatCard
          title="Avg. Order Value"
          value={`৳${avgOrderValue.toFixed(0)}`}
          trend="-2.4%"
          isPositive={false}
          icon={<TrendingUp className="h-6 w-6" />} />
        
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          trend="+1.1%"
          isPositive={true}
          icon={<BarChart3 className="h-6 w-6" />} />
        
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Sales Overview */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif font-bold text-slate-900">Sales Overview</h2>
            <select className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-transparent outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} />
                
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                
                <Bar dataKey="revenue" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-8">Product Categories</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {categoryData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {categoryData.map((item, index) =>
            <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}

function StatCard({ title, value, trend, isPositive, icon





}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-brand-pink text-brand-rose">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold",
          isPositive ? "text-emerald-500" : "text-rose-500"
        )}>
          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {trend}
        </div>
      </div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</h3>
      <p className="text-3xl font-serif font-bold text-slate-900">{value}</p>
    </div>);

}