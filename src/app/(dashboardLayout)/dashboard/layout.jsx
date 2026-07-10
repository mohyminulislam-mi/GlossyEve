"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Heart,
  BarChart3 } from
'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
{ icon: LayoutDashboard, label: 'Overview', path: '/admin' },
{ icon: Package, label: 'Products', path: '/admin/products' },
{ icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
{ icon: Users, label: 'Users', path: '/admin/users' },
{ icon: Heart, label: 'Wishlists', path: '/admin/wishlists' },
{ icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
{ icon: BarChart3, label: 'Reports', path: '/admin/reports' },
{ icon: Settings, label: 'Settings', path: '/admin/settings' }];


export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen &&
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        onClick={() => setIsSidebarOpen(false)} />

      }

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-serif font-bold tracking-tighter text-brand-rose">AURA</span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-pink text-brand-rose px-2 py-0.5 rounded">Admin</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <nav className="flex-grow space-y-1 p-4 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path || item.path !== '/admin' && pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                    isActive ?
                    "bg-brand-rose text-white shadow-lg shadow-brand-rose/20" :
                    "text-slate-500 hover:bg-slate-50 hover:text-brand-rose"
                  )}>
                  
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>);

            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50">
              
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 lg:hidden">
              
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden relative sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="h-10 w-64 rounded-xl bg-slate-50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-rose/20" />
              
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-50">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-rose border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.displayName || 'Admin'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Super Admin</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-pink flex items-center justify-center text-brand-rose font-bold">
                {user?.displayName?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>);

}