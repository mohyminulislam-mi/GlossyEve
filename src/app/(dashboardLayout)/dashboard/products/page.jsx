"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,

  Edit2,
  Trash2,
  Filter,
  X,
  Image as ImageIcon,
  CheckCircle2,
  XCircle } from
'lucide-react';
import { MOCK_PRODUCTS } from '@/constants';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    const localProducts = JSON.parse(localStorage.getItem('aura_products') || '[]');
    // Combine mock products with local ones, prioritizing local ones if IDs clash (though they shouldn't)
    const combined = [...localProducts, ...MOCK_PRODUCTS.filter(mp => !localProducts.some(lp => lp.id === mp.id))];
    setProducts(combined);
    setLoading(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const localProducts = JSON.parse(localStorage.getItem('aura_products') || '[]');
      const updatedLocal = localProducts.filter(p => p.id !== id);
      localStorage.setItem('aura_products', JSON.stringify(updatedLocal));
      
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter((p) =>
  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-500">Manage your product catalog, stock, and pricing.</p>
        </div>
        <button
          onClick={() => {setEditingProduct(null);setIsModalOpen(true);}}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-rose px-6 py-3 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95">
          
          <Plus className="h-5 w-5" /> Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-rose" />
          
        </div>
        <button className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 text-sm font-bold text-slate-600 hover:border-brand-rose hover:text-brand-rose">
          <Filter className="h-5 w-5" /> Filters
        </button>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Product</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Category</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Price</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Stock</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) =>
              <tr key={product.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img src={product.images[0]} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-slate-900">৳{product.price.toLocaleString()}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                      "h-2 w-2 rounded-full",
                      product.inStock ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                      <span className="text-sm font-medium text-slate-600">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                    product.inStock ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                      {product.inStock ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {product.inStock ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <button
                      onClick={() => {setEditingProduct(product);setIsModalOpen(true);}}
                      className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-all">
                      
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all">
                      
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
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
            className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <ProductForm
              product={editingProduct}
              onClose={() => setIsModalOpen(false)} />
            
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}

function ProductForm({ product, onClose }) {
  const [formData, setFormData] = useState(product || {
    name: '',
    price: 0,
    category: 'Bras',
    description: '',
    images: [''],
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    sku: `AURA-${Math.floor(Math.random() * 10000)}`,
    inStock: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const localProducts = JSON.parse(localStorage.getItem('aura_products') || '[]');
      
      if (product?.id) {
        // Update
        const updatedLocal = localProducts.map(p => p.id === product.id ? formData : p);
        // If not in local yet (it was from MOCK_PRODUCTS), add it to local
        if (!localProducts.some(p => p.id === product.id)) {
          updatedLocal.push(formData);
        }
        localStorage.setItem('aura_products', JSON.stringify(updatedLocal));
      } else {
        // Add new
        const newProduct = { ...formData, id: `p-${Math.random().toString(36).substr(2, 9)}` };
        localStorage.setItem('aura_products', JSON.stringify([...localProducts, newProduct]));
      }
      
      // Force refresh or just close
      window.location.reload(); // Simple way to refresh the list
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Product Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
          
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Price (৳)</label>
          <input
            required
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
          
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose">
            
            <option value="Bras">Bras</option>
            <option value="Panties">Panties</option>
            <option value="Nightwear">Nightwear</option>
            <option value="Sets">Sets</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">SKU</label>
          <input
            required
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
          
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
        
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Image URL</label>
        <div className="flex gap-2">
          <input
            required
            type="url"
            value={formData.images?.[0]}
            onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
            className="flex-grow rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose" />
          
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <ImageIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.inStock}
            onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
            className="h-5 w-5 rounded border-slate-300 text-brand-rose focus:ring-brand-rose" />
          
          <span className="text-sm font-bold text-slate-700">In Stock</span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500">
        
        {product ? 'Update Product' : 'Add Product'}
      </button>
    </form>);

}