"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Trash2, Shield, ShieldAlert, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import mockUsers from '@/data/users.json';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const toggleRole = (uid, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    }
  };

  const handleDelete = (uid) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.uid !== uid));
    }
  };

  const filteredUsers = users.filter((user) =>
  user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500">View and manage your customer base and administrative roles.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-rose" />
          
        </div>
        <button className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 text-sm font-bold text-slate-600 hover:border-brand-rose hover:text-brand-rose">
          <Filter className="h-5 w-5" /> Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Email</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Role</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Wishlist</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) =>
              <tr key={user.uid} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-brand-pink flex items-center justify-center text-brand-rose font-bold">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.displayName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">UID: {user.uid.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                    user.role === 'admin' ? "bg-brand-rose text-white" : "bg-slate-100 text-slate-600"
                  )}>
                      {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-bold text-slate-900">{user.wishlist?.length || 0} items</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <button
                      onClick={() => toggleRole(user.uid, user.role)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        user.role === 'admin' ? "text-amber-500 hover:bg-amber-50" : "text-brand-rose hover:bg-brand-pink"
                      )}
                      title={user.role === 'admin' ? "Demote to Customer" : "Promote to Admin"}>
                      
                        {user.role === 'admin' ? <ShieldAlert className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                      </button>
                      <button
                      onClick={() => handleDelete(user.uid)}
                      className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all"
                      title="Delete User">
                      
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
    </div>);

}