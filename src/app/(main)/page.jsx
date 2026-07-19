"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, Ruler } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import HeroSection from '@/components/HeroSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Discrete Packaging',
    subtitle: 'Your privacy is our priority',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    subtitle: 'Across all districts in BD',
  },
  {
    icon: Ruler,
    title: 'Perfect Fit',
    subtitle: 'Interactive size calculator',
  },
];

// Fallback seeds for category images when backend has no image
const CATEGORY_SEEDS = ['bras', 'panties', 'nightwear', 'sets', 'lingerie', 'sleepwear'];

// Skeleton loader for categories
function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-200" />
      ))}
    </div>
  );
}

// Skeleton loader for products
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm">
          <div className="aspect-[3/4] rounded-xl bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);

  useEffect(() => {
    // Fetch categories
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      })
      .finally(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    // Fetch featured products
    fetch(`${API_URL}/api/products?limit=8&sort=ratingDesc`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      })
      .finally(() => setLoadingProds(false));
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section (Client Component — manages SizeCalculator modal) */}
      <HeroSection />

      {/* Features Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 rounded-3xl bg-white p-8 shadow-sm sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink text-brand-rose">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{title}</h4>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-serif font-bold text-slate-900">Shop by Category</h2>
          <p className="mt-2 text-slate-500 italic">Find the perfect piece for every mood</p>
        </div>

        {loadingCats ? (
          <CategorySkeleton />
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat, i) => {
              const catName = cat.name || cat;
              const catSlug = cat.slug || String(catName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const catImage = cat.image || `https://picsum.photos/seed/${CATEGORY_SEEDS[i % CATEGORY_SEEDS.length]}/800/1000`;

              return (
                <motion.div
                  key={cat._id || catSlug || i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100">

                  <img
                    src={catImage}
                    alt={catName}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-serif font-bold text-white">{catName}</h3>
                    <Link
                      href={`/shop?category=${catSlug}`}
                      className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-pink transition-colors hover:text-white">
                      Explore <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-serif font-bold text-slate-900">Trending Now</h2>
            <p className="mt-2 text-slate-500 italic">Our most loved pieces this season</p>
          </div>
          <Link href="/shop" className="text-sm font-bold uppercase tracking-widest text-brand-rose hover:underline">
            View All
          </Link>
        </div>

        {loadingProds ? (
          <ProductSkeleton />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-24 text-center shadow-sm">
            <p className="text-2xl font-serif text-slate-400">No products yet</p>
            <p className="mt-2 text-slate-400">Check back soon — new arrivals on the way!</p>
          </div>
        )}
      </section>
    </div>
  );
}