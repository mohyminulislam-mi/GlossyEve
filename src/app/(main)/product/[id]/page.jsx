"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ShoppingBag, Heart, Ruler, ShieldCheck, Truck, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

import { useCart } from '@/context/CartContext';

import { useWishlist } from '@/hooks/useWishlist';
import SizeCalculator from '@/components/SizeCalculator';
import ProductReviews from '@/components/ProductReviews';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSizeCalcOpen, setIsSizeCalcOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    setLoading(true);
    fetch(`${API_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          const fetchedProduct = data.product;
          const normalized = {
            ...fetchedProduct,
            id: fetchedProduct._id || fetchedProduct.id,
            price: fetchedProduct.discountPrice || fetchedProduct.price,
            originalPrice: fetchedProduct.discountPrice ? fetchedProduct.price : null,
            images: fetchedProduct.images && fetchedProduct.images.length 
              ? fetchedProduct.images 
              : (fetchedProduct.image_url ? [fetchedProduct.image_url] : ['https://picsum.photos/seed/placeholder/600/800']),
            category: typeof fetchedProduct.category === 'object' && fetchedProduct.category !== null 
              ? fetchedProduct.category.name 
              : fetchedProduct.category,
            sizes: fetchedProduct.sizes || [],
            colors: fetchedProduct.colors || [],
            inStock: fetchedProduct.inStock !== undefined 
              ? fetchedProduct.inStock 
              : (fetchedProduct.stock !== undefined ? fetchedProduct.stock > 0 : true),
          };
          setProduct(normalized);

          if (normalized.sizes.length > 0) setSelectedSize(normalized.sizes[0]);
          if (normalized.colors.length > 0) setSelectedColor(normalized.colors[0]);
        } else {
          setProduct(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-rose border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-serif font-bold">Product Not Found</h2>
        <button onClick={() => router.push('/shop')} className="text-brand-rose hover:underline">
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleOrderNow = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    router.push('/cart');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-slate-100 shadow-lg">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer" />
            
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, i) =>
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={cn(
                "relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                activeImage === i ? "border-brand-rose" : "border-transparent opacity-60"
              )}>
              
                <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-rose">{product.category}</p>
            <h1 className="mt-2 text-4xl font-serif font-bold text-slate-900 sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-4">
              <p className="text-3xl font-bold text-brand-rose">৳{product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-lg text-slate-400 line-through">৳{product.originalPrice.toLocaleString()}</p>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400 uppercase tracking-widest">SKU: {product.sku}</p>
          </div>

          <div className="space-y-6">
            {/* Color Selection */}
            <div>
              <label className="mb-3 block text-sm font-bold uppercase tracking-widest text-slate-900">
                Color: <span className="text-slate-500 font-medium">{selectedColor || 'Select'}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) =>
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "rounded-full border-2 px-6 py-2 text-sm font-medium transition-all",
                    selectedColor === color ?
                    "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20" :
                    "border-slate-200 bg-white text-slate-600 hover:border-brand-rose"
                  )}>
                  
                    {color}
                  </button>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-900">
                  Size: <span className="text-slate-500 font-medium">{selectedSize || 'Select'}</span>
                </label>
                <button
                  onClick={() => setIsSizeCalcOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand-rose hover:underline">
                  
                  <Ruler className="h-4 w-4" /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) =>
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all",
                    selectedSize === size ?
                    "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20" :
                    "border-slate-200 bg-white text-slate-600 hover:border-brand-rose"
                  )}>
                  
                    {size}
                  </button>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-3 block text-sm font-bold uppercase tracking-widest text-slate-900">Quantity</label>
              <div className="flex w-32 items-center justify-between rounded-xl border-2 border-slate-200 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                  
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                  
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl border-2 border-brand-rose py-5 text-lg font-bold text-brand-rose transition-all hover:bg-brand-pink hover:scale-[1.02] active:scale-95">
                  
                  <ShoppingBag className="h-6 w-6" /> Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95",
                    isWishlisted ?
                    "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20" :
                    "border-brand-rose text-brand-rose hover:bg-brand-pink"
                  )}>
                  
                  <Heart className={cn("h-6 w-6", isWishlisted && "fill-current")} />
                </button>
              </div>
              <button
                onClick={handleOrderNow}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-rose py-5 text-lg font-bold text-white shadow-xl shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95">
                
                <Zap className="h-6 w-6 fill-current" /> Order Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-brand-pink/50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-rose" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Discrete Packaging</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-brand-rose" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Fast BD Delivery</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-brand-pink pt-8">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Description</h4>
            <p className="leading-relaxed text-slate-600">{product.description}</p>
          </div>

          <ProductReviews productId={product.id} />
        </div>
      </div>

      <SizeCalculator isOpen={isSizeCalcOpen} onClose={() => setIsSizeCalcOpen(false)} />
    </div>);

}