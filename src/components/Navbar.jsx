"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';

// Inner component that uses useSearchParams (needs Suspense boundary)
function NavLinks() {
  const searchParams = useSearchParams();
  return (
    <div className="hidden items-center gap-8 lg:flex">
      {['Bras', 'Panties', 'Nightwear', 'Sets'].map((item) =>
      <Link
        key={item}
        href={`/shop?category=${item}`}
        className={cn(
          "text-sm font-medium tracking-wide transition-colors hover:text-brand-rose",
          searchParams.get('category') === item ? "text-brand-rose" : "text-slate-600"
        )}>
        
          {item}
        </Link>
      )}
    </div>);

}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, isLoaded: isCartLoaded } = useCart();
  const { wishlistCount, isLoaded } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close search on route change
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

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-brand-pink bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold tracking-tighter text-brand-rose">AURA</span>
          </Link>
        </div>

        {/* Wrap the part that uses useSearchParams in Suspense */}
        <Suspense fallback={
        <div className="hidden items-center gap-8 lg:flex">
            {['Bras', 'Panties', 'Nightwear', 'Sets'].map((item) =>
          <span key={item} className="text-sm font-medium tracking-wide text-slate-600">{item}</span>
          )}
          </div>
        }>
          <NavLinks />
        </Suspense>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-600 hover:text-brand-rose">
            
            <Search className="h-5 w-5" />
          </button>
          <Link href="/wishlist" className="relative p-2 text-slate-600 hover:text-brand-rose">
            <Heart className="h-5 w-5" />
            {isLoaded && wishlistCount > 0 &&
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-rose text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            }
          </Link>
          <Link href="/account" className="p-2 text-slate-600 hover:text-brand-rose">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative p-2 text-slate-600 hover:text-brand-rose">
            <ShoppingBag className="h-5 w-5" />
            {isCartLoaded && totalItems > 0 &&
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-rose text-[10px] font-bold text-white">
                {totalItems}
              </span>
            }
          </Link>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen &&
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute inset-x-0 top-0 z-50 flex h-20 items-center bg-white px-4 shadow-lg sm:px-6 lg:px-8">
          
            <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-7xl items-center gap-4">
              <Search className="h-6 w-6 text-slate-400" />
              <input
              autoFocus
              type="text"
              placeholder="Search for bras, panties, nightwear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-lg font-medium text-slate-900 outline-none placeholder:text-slate-300" />
            
              <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600">
              
                <X className="h-6 w-6" />
              </button>
            </form>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

}