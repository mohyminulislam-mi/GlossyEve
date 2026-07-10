"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/constants';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Bras', 'Panties', 'Nightwear', 'Sets'];
const SIZES = ['S', 'M', 'L', 'XL', '32B', '34B', '36B', '34C'];
const COLORS = ['Rose Gold', 'Black', 'Cream', 'Midnight Blue', 'Emerald', 'Burgundy', 'Floral Pink', 'Deep Red'];
const ITEMS_PER_PAGE = 12;

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const categoryFilter = searchParams.get('category');
  const sizeFilter = searchParams.get('size');
  const colorFilter = searchParams.get('color');
  const searchFilter = searchParams.get('search');
  const sortFilter = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProducts();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Fetch products error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, sizeFilter, colorFilter, searchFilter, sortFilter]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      result = result.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
      );
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (sizeFilter) {
      result = result.filter((p) => p.sizes.includes(sizeFilter));
    }
    if (colorFilter) {
      result = result.filter((p) => p.colors.includes(colorFilter));
    }

    if (sortFilter === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortFilter === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [categoryFilter, sizeFilter, colorFilter, sortFilter, searchFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const clearFilters = () => {
    router.replace(pathname);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 space-y-8 lg:block">
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900">Categories</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) =>
              <button
                key={cat}
                onClick={() => updateFilter('category', categoryFilter === cat ? null : cat)}
                className={cn(
                  "block w-full text-left text-sm transition-colors hover:text-brand-rose",
                  categoryFilter === cat ? "font-bold text-brand-rose" : "text-slate-500"
                )}>
                
                  {cat}
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) =>
              <button
                key={size}
                onClick={() => updateFilter('size', sizeFilter === size ? null : size)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-bold transition-all",
                  sizeFilter === size ?
                  "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20" :
                  "border-slate-200 bg-white text-slate-600 hover:border-brand-rose"
                )}>
                
                  {size}
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) =>
              <button
                key={color}
                onClick={() => updateFilter('color', colorFilter === color ? null : color)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium transition-all",
                  colorFilter === color ?
                  "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20" :
                  "border-slate-200 bg-white text-slate-600 hover:border-brand-rose"
                )}>
                
                  {color}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow space-y-8">
          {/* Header & Mobile Controls */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900">
                {categoryFilter || 'All Collection'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{filteredProducts.length} products found</p>
            </div>

            <div className="flex w-full items-center gap-4 sm:w-auto">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose lg:hidden">
                
                <Filter className="h-4 w-4" /> Filters
              </button>
              
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortFilter}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-white px-6 py-3 pr-10 text-sm font-bold text-slate-600 outline-none transition-all hover:border-brand-rose focus:border-brand-rose">
                  
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(categoryFilter || sizeFilter || colorFilter) &&
          <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Active:</span>
              {categoryFilter &&
            <span className="flex items-center gap-1 rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-brand-rose">
                  {categoryFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('category', null)} />
                </span>
            }
              {sizeFilter &&
            <span className="flex items-center gap-1 rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-brand-rose">
                  Size: {sizeFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('size', null)} />
                </span>
            }
              {colorFilter &&
            <span className="flex items-center gap-1 rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-brand-rose">
                  {colorFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('color', null)} />
                </span>
            }
              <button onClick={clearFilters} className="text-xs font-bold text-slate-400 hover:text-brand-rose hover:underline">
                Clear All
              </button>
            </div>
          }

          {/* Product Grid */}
          {paginatedProducts.length > 0 ?
          <div className="space-y-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProducts.map((product) =>
              <ProductCard key={product.id} product={product} />
              )}
              </div>

              {/* Pagination */}
              {totalPages > 1 &&
            <div className="flex items-center justify-center gap-4 pt-8">
                  <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-600">
                
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) =>
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all",
                    currentPage === page ?
                    "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20" :
                    "border-slate-100 bg-white text-slate-600 hover:border-brand-rose"
                  )}>
                  
                        {page}
                      </button>
                )}
                  </div>

                  <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-600">
                
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
            }
            </div> :

          <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl bg-white text-center shadow-sm">
              <SlidersHorizontal className="h-12 w-12 text-slate-200" />
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-slate-900">No products found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters to find what you&apos;re looking for.</p>
              </div>
              <button onClick={clearFilters} className="text-sm font-bold text-brand-rose hover:underline">
                Clear all filters
              </button>
            </div>
          }
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {isFilterOpen &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
            <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 h-full w-full max-w-xs bg-white p-8 shadow-2xl">
            
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-slate-900">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-10 overflow-y-auto pb-20">
                {/* Same filter sections as desktop */}
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) =>
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', categoryFilter === cat ? null : cat)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-medium transition-all",
                      categoryFilter === cat ? "border-brand-rose bg-brand-rose text-white" : "border-slate-200 text-slate-500"
                    )}>
                    
                        {cat}
                      </button>
                  )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) =>
                  <button
                    key={size}
                    onClick={() => updateFilter('size', sizeFilter === size ? null : size)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-bold transition-all",
                      sizeFilter === size ? "border-brand-rose bg-brand-rose text-white" : "border-slate-200 text-slate-500"
                    )}>
                    
                        {size}
                      </button>
                  )}
                  </div>
                </div>

                <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20">
                
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}

export default function Shop() {
  return (
    <Suspense fallback={
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-rose border-t-transparent" />
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>);

}