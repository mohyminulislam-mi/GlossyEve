"use client";

import React, { useState, useEffect } from 'react';
import { Search, Eye, Truck, CheckCircle2, XCircle, Clock, AlertCircle, ChevronDown, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import mockOrders from '@/data/orders.json';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const localOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    const allOrders = [...localOrders, ...mockOrders].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    setOrders(allOrders);
    setLoading(false);
  };

  const updateStatus = (orderId, newStatus) => {
    // Check if it's in localStorage
    const localOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    const isLocal = localOrders.some(o => o.id === orderId);

    if (isLocal) {
      const updatedLocal = localOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('aura_orders', JSON.stringify(updatedLocal));
    }
    
    // Update local state
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.shippingAddress.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const orderDate = new Date(order.createdAt);
      if (orderDate) {
        if (dateRange.start) {
          const start = new Date(dateRange.start);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) matchesDate = false;
        }
        if (dateRange.end) {
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'canceled':return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'processing':return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'pending':return 'bg-amber-50 text-amber-600 border-amber-100';
      default:return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':return <CheckCircle2 className="h-3 w-3" />;
      case 'canceled':return <XCircle className="h-3 w-3" />;
      case 'processing':return <Truck className="h-3 w-3" />;
      case 'pending':return <Clock className="h-3 w-3" />;
      default:return <AlertCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Orders Management</h1>
        <p className="text-slate-500">Track and manage customer orders and fulfillment.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-rose" />
            
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 text-sm font-bold text-slate-600 outline-none transition-all focus:border-brand-rose">
              
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Canceled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 text-sm font-bold text-slate-600 outline-none transition-all focus:border-brand-rose">
              
              <option value="all">All Payments</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Calendar className="h-4 w-4" /> Date Range:
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold outline-none focus:border-brand-rose" />
            
            <span className="text-slate-300">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold outline-none focus:border-brand-rose" />
            
            {(dateRange.start || dateRange.end) &&
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="ml-2 text-xs font-bold text-brand-rose hover:underline">
              
                Clear
              </button>
            }
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Order ID</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Customer</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Total</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Payment</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) =>
              <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="p-6">
                    <div>
                      <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                      <p className="text-xs text-slate-400">{order.shippingAddress.phone}</p>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-brand-rose">৳{order.total.toLocaleString()}</td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-slate-600">{order.paymentMethod}</span>
                  </td>
                  <td className="p-6">
                    <div className="relative group/status">
                      <button className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all",
                      getStatusColor(order.status)
                    )}>
                        {getStatusIcon(order.status)}
                        {order.status}
                        <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                      </button>
                      
                      <div className="absolute left-0 top-full z-10 mt-1 hidden w-32 rounded-xl bg-white p-1 shadow-xl border border-slate-100 group-hover/status:block">
                        {['pending', 'processing', 'delivered', 'canceled'].map((s) =>
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-slate-50",
                          order.status === s ? "text-brand-rose" : "text-slate-500"
                        )}>
                        
                            {s}
                          </button>
                      )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 text-slate-400 hover:bg-brand-pink hover:text-brand-rose rounded-lg transition-all">
                    
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder &&
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          
            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Order Details</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">#{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Items */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, i) =>
                  <div key={i} className="flex gap-4">
                        <img src={item.images[0]} alt="" className="h-20 w-16 rounded-xl object-cover" />
                        <div className="flex-grow">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-400 uppercase font-bold">Qty: {item.quantity} | {item.selectedSize} | {item.selectedColor}</p>
                          <p className="font-bold text-brand-rose">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                  )}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-6 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal</span>
                      <span>৳{(selectedOrder.total - 120).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Shipping</span>
                      <span>৳120</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span className="text-brand-rose">৳{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2 mb-4">Customer Info</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-sm text-slate-600">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2 mb-4">Shipping Address</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">{selectedOrder.shippingAddress.address}</p>
                      <p className="text-sm text-slate-600">{selectedOrder.shippingAddress.area}, {selectedOrder.shippingAddress.district}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2 mb-4">Payment & Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Method</span>
                        <span className="text-sm font-bold text-slate-900">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                        <select
                        value={selectedOrder.status}
                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                        className={cn(
                          "rounded-lg border-2 px-3 py-1 text-xs font-bold uppercase tracking-widest outline-none",
                          getStatusColor(selectedOrder.status)
                        )}>
                        
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="canceled">Canceled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}