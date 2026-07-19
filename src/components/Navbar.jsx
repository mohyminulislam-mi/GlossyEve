"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, Menu, X, Home, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';

// ─── Nav category links (desktop) ────────────────────────────────────────────
// Needs Suspense boundary because it reads useSearchParams
function NavLinks() {
  const searchParams = useSearchParams();

  return (
    <div className="hidden items-center gap-8 lg:flex">
      {['Bras', 'Panties', 'Nightwear', 'Sets'].map((item) => (
        <Link
          key={item}
          href={`/shop?category=${item}`}
          className={cn(
            'text-sm font-medium tracking-wide transition-colors hover:text-brand-rose',
            searchParams.get('category') === item
              ? 'text-brand-rose'
              : 'text-slate-600',
          )}
        >
          {item}
        </Link>
      ))}
    </div>
  );
}

// ─── Bottom nav item ──────────────────────────────────────────────────────────
function BottomNavItem({ href, icon: Icon, label, badge = 0, isActive }) {
  return (
    <Link
      href={href}
      className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
    >
      <span className="relative">
        <Icon
          className={cn(
            'h-6 w-6 transition-colors',
            isActive ? 'text-brand-rose' : 'text-slate-500',
          )}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-rose text-[9px] font-bold text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span
        className={cn(
          'text-[10px] font-medium leading-none transition-colors',
          isActive ? 'text-brand-rose' : 'text-slate-500',
        )}
      >
        {label}
      </span>
    </Link>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, isLoaded: isCartLoaded } = useCart();
  const { wishlistCount, isLoaded: isWishlistLoaded } = useWishlist();
  const { user } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close search overlay on route change
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const accountHref =
    user && (user.role === 'admin' || user.role === 'manager')
      ? '/dashboard'
      : '/account';

  // Bottom-nav items config
  const bottomNavItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: LayoutGrid, label: 'Shop' },
    {
      href: '/wishlist',
      icon: Heart,
      label: 'Wishlist',
      badge: isWishlistLoaded ? wishlistCount : 0,
    },
    {
      href: '/cart',
      icon: ShoppingBag,
      label: 'Cart',
      badge: isCartLoaded ? totalItems : 0,
    },
    { href: accountHref, icon: User, label: 'Account' },
  ];

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full border-b border-brand-pink bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left – logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-serif font-bold tracking-tighter text-brand-rose">
                AURA
              </span>
            </Link>
          </div>

          {/* Center – desktop category links */}
          <Suspense
            fallback={
              <div className="hidden items-center gap-8 lg:flex">
                {['Bras', 'Panties', 'Nightwear', 'Sets'].map((item) => (
                  <span
                    key={item}
                    className="text-sm font-medium tracking-wide text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            }
          >
            <NavLinks />
          </Suspense>

          {/* Right – action icons (always visible on desktop; hidden on mobile for bottom-nav) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search – shown on all sizes */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
              className="p-2 text-slate-600 hover:text-brand-rose"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist / Cart / Account – hidden on mobile (handled by bottom nav) */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden p-2 text-slate-600 hover:text-brand-rose lg:inline-flex"
            >
              <Heart className="h-5 w-5" />
              {isWishlistLoaded && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-rose text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href={accountHref}
              aria-label="Account"
              className="hidden p-2 text-slate-600 hover:text-brand-rose lg:inline-flex"
            >
              <User className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className="relative hidden p-2 text-slate-600 hover:text-brand-rose lg:inline-flex"
            >
              <ShoppingBag className="h-5 w-5" />
              {isCartLoaded && totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-rose text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Search Overlay ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-x-0 top-0 z-50 flex h-20 items-center bg-white px-4 shadow-lg sm:px-6 lg:px-8"
            >
              <form
                onSubmit={handleSearch}
                className="mx-auto flex w-full max-w-7xl items-center gap-4"
              >
                <Search className="h-6 w-6 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for bras, panties, nightwear…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-medium text-slate-900 outline-none placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────────────────────── */}
      {/* Visible only on screens smaller than lg (1024 px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-pink bg-white/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottomNavItems.map(({ href, icon, label, badge }) => (
          <BottomNavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            badge={badge ?? 0}
            isActive={
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href)
            }
          />
        ))}
      </nav>
    </>
  );
}