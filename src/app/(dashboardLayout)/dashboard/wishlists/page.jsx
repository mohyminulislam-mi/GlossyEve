"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Search, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/constants';
import mockUsers from '@/data/users.json';

export default function Wishlists() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsers(mockUsers);
    setProducts(MOCK_PRODUCTS);
    setLoading(false);
  }, []);

  // Calculate popular products
  const wishlistCounts = users.reduce((acc, user) => {
    user.wishlist?.forEach((productId) => {
      acc[productId] = (acc[productId] || 0) + 1;
    });
    return acc;
  }, {});

  const popularProducts = Object.entries(wishlistCounts).
  map(([id, count]) => ({
    product: products.find((p) => p.id === id),
    count: count
  })).
  filter((item) => item.product).
  sort((a, b) => b.count - a.count).
  slice(0, 5);

  const usersWithWishlist = users.filter((u) => (u.wishlist?.length || 0) > 0);
  const filteredUsers = usersWithWishlist.filter((u) =>
  u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Wishlist Monitoring</h1>
        <p className="text-slate-500">Track user interests and popular products to optimize your inventory.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Popular Products Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-brand-pink text-brand-rose">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900">Popular Items</h2>
            </div>

            <div className="space-y-6">
              {popularProducts.map((item, index) =>
              <div key={item.product?.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50">
                    <img
                    src={item.product?.images[0]}
                    alt={item.product?.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer" />
                  
                    <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center bg-brand-rose text-[10px] font-bold text-white">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="truncate font-bold text-slate-900">{item.product?.name}</h4>
                    <p className="text-xs font-bold text-brand-rose uppercase tracking-widest">{item.count} Wishlists</p>
                  </div>
                </div>
              )}
              {popularProducts.length === 0 &&
              <p className="text-center text-sm text-slate-400 py-8">No data available yet.</p>
              }
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-4">Inventory Tip</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Products with high wishlist counts but low sales might need a small discount or promotional push.
            </p>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-bold transition-all hover:bg-white/20">
              Create Campaign <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* User Wishlists Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users with wishlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-rose" />
              
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-50">
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Items Count</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Latest Item</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => {
                    const latestProductId = user.wishlist?.[user.wishlist.length - 1];
                    const latestProduct = products.find((p) => p.id === latestProductId);

                    return (
                      <tr key={user.uid} className="group hover:bg-slate-50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-brand-pink flex items-center justify-center text-brand-rose font-bold">
                              {user.displayName?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{user.displayName}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-brand-rose fill-brand-rose" />
                            <span className="text-sm font-bold text-slate-900">{user.wishlist?.length || 0}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          {latestProduct ?
                          <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-50">
                                <img
                                src={latestProduct.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer" />
                              
                              </div>
                              <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{latestProduct.name}</span>
                            </div> :

                          <span className="text-xs text-slate-400">-</span>
                          }
                        </td>
                        <td className="p-6">
                          <button className="p-2 text-slate-400 hover:bg-brand-pink hover:text-brand-rose rounded-lg transition-all">
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>);

                  })}
                  {filteredUsers.length === 0 &&
                  <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No wishlists found matching your search.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>);

}