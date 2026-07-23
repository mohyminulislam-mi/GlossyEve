"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Ruler,
  ShieldCheck,
  Truck,
  ChevronRight,
  ChevronLeft,
  Zap,
  CheckCircle2,
  MapPin,
  AlertCircle,
  Star,
  Maximize2,
  Share2,
  ArrowLeft,
  Lock,
  Sparkles,
  X,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductDetail } from "@/lib/api";
import { cn } from "@/lib/utils";

import SizeCalculator from "@/components/SizeCalculator";
import ProductReviews from "@/components/ProductReviews";

// ─── Color Map Helper ────────────────────────────────────────────────────────
const COLOR_MAP = {
  "rose gold": "#E0A899",
  "black": "#1A1A1A",
  "cream": "#FFFDD0",
  "midnight blue": "#191970",
  "emerald": "#50C878",
  "burgundy": "#800020",
  "floral pink": "#FFC0CB",
  "deep red": "#850101",
  "nude": "#E6C2B4",
  "white": "#FFFFFF",
  "lavender": "#E6E6FA",
  "mint green": "#98FF98",
  "beige": "#F5F5DC",
  "ivory white": "#FFFFF0",
  "blush pink": "#FEADB9",
  "crimson red": "#DC143C",
  "champagne": "#F7E7CE",
  "navy blue": "#000080",
};

function getColorHex(color) {
  const normalized = color.toLowerCase().trim();
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];
  return color;
}

// ─── Helper: Normalize API product to frontend shape ──────────────────────────
function normalizeProduct(raw) {
  const specs = raw.specifications || [];

  let sizes = raw.sizes || [];
  if (!sizes.length && specs.length) {
    const sizeSpec = specs.find((s) => {
      const k = s.key?.toLowerCase().trim();
      return k === "size" || k === "sizes" || k === "available sizes" || k === "available size";
    });
    if (sizeSpec && sizeSpec.value) {
      sizes = sizeSpec.value.split(",").map((v) => v.trim()).filter(Boolean);
    }
  }

  let colors = raw.colors || [];
  if (!colors.length && specs.length) {
    const colorSpec = specs.find((s) => {
      const k = s.key?.toLowerCase().trim();
      return k === "color" || k === "colors" || k === "available colors" || k === "available color";
    });
    if (colorSpec && colorSpec.value) {
      colors = colorSpec.value.split(",").map((v) => v.trim()).filter(Boolean);
    }
  }

  const price = raw.discountPrice ?? raw.price;
  const originalPrice = raw.discountPrice ? raw.price : null;
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return {
    ...raw,
    id: raw._id || raw.id,
    price,
    originalPrice,
    discountPercent,
    images:
      raw.images?.length
        ? raw.images
        : raw.image_url
          ? [raw.image_url]
          : ["https://picsum.photos/seed/placeholder/600/800"],
    category:
      typeof raw.category === "object" && raw.category !== null
        ? raw.category.name
        : raw.category,
    sizes,
    colors,
    stock: raw.stock ?? 0,
    inStock:
      raw.inStock !== undefined
        ? raw.inStock
        : raw.stock !== undefined
          ? raw.stock > 0
          : true,
  };
}

// ─── Sub-component: Image Gallery with Lightbox ──────────────────────────────
function ImageGallery({ images, productName, discountPercent, isOutOfStock }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-md">
        <img
          src={images[activeIndex]}
          alt={productName}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {discountPercent && (
            <span className="rounded-full bg-brand-rose px-3.5 py-1 text-xs font-bold text-white shadow-lg shadow-brand-rose/30 uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-slate-900/90 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>

        {/* Lightbox / Zoom Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-110 hover:text-brand-rose z-10"
          aria-label="Expand image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Next/Prev Navigation overlay (visible on hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 opacity-0 shadow-md backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 opacity-0 shadow-md backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300",
                activeIndex === i
                  ? "border-brand-rose ring-4 ring-brand-rose/20 scale-95 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-slate-300"
              )}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl">
            <img
              src={images[activeIndex]}
              alt={productName}
              className="max-h-[85vh] max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: Color Selector ───────────────────────────────────────────
function ColorSelector({ colors, selectedColor, onChange, disabled, error }) {
  if (!colors || !colors.length) return null;
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl p-4 transition-all duration-300 border",
        error
          ? "bg-rose-50/60 border-rose-300 shadow-sm"
          : "bg-slate-50/60 border-slate-200/60"
      )}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Color:{" "}
          <span className="font-extrabold text-brand-rose ml-1">
            {selectedColor || "Please Select"}
          </span>
        </label>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const hex = getColorHex(color);
          const isSelected = selectedColor === color;

          return (
            <button
              key={color}
              type="button"
              disabled={disabled}
              onClick={() => onChange(color)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95",
                isSelected
                  ? "border-brand-rose bg-slate-900 text-white shadow-md shadow-brand-rose/20 ring-2 ring-brand-rose/30"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-rose/50 hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border shadow-inner transition-transform",
                  isSelected ? "border-white scale-110" : "border-slate-300"
                )}
                style={{ backgroundColor: hex }}
              />
              <span>{color}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse mt-1">
          <AlertCircle className="h-4 w-4" /> Please select a color option
        </p>
      )}
    </div>
  );
}

// ─── Sub-component: Size Selector ────────────────────────────────────────────
function SizeSelector({ sizes, selectedSize, onChange, onOpenGuide, disabled, error }) {
  if (!sizes || !sizes.length) return null;
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl p-4 transition-all duration-300 border",
        error
          ? "bg-rose-50/60 border-rose-300 shadow-sm"
          : "bg-slate-50/60 border-slate-200/60"
      )}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Size:{" "}
          <span className="font-extrabold text-brand-rose ml-1">
            {selectedSize || "Please Select"}
          </span>
        </label>
        <button
          type="button"
          onClick={onOpenGuide}
          disabled={disabled}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-rose hover:underline disabled:opacity-50"
        >
          <Ruler className="h-3.5 w-3.5" /> Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              disabled={disabled}
              onClick={() => onChange(size)}
              className={cn(
                "flex h-11 min-w-[3.25rem] items-center justify-center rounded-xl border px-4 text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95",
                isSelected
                  ? "border-brand-rose bg-brand-rose text-white shadow-md shadow-brand-rose/25 ring-2 ring-brand-rose/30"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-rose/50 hover:bg-slate-50"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse mt-1">
          <AlertCircle className="h-4 w-4" /> Please select a size option
        </p>
      )}
    </div>
  );
}

// ─── Sub-component: Quantity Picker ──────────────────────────────────────────
function QuantityPicker({ quantity, onChange, disabled }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-800">
        Quantity
      </label>
      <div className="flex w-36 items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={disabled || quantity <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40 transition-all"
          aria-label="Decrease quantity"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-extrabold text-slate-900 text-sm">{quantity}</span>
        <button
          type="button"
          onClick={() => onChange(quantity + 1)}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40 transition-all"
          aria-label="Increase quantity"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 animate-pulse">
        <div className="aspect-[3/4] rounded-3xl bg-slate-200 lg:col-span-7" />
        <div className="space-y-6 lg:col-span-5">
          <div className="h-4 w-24 rounded-full bg-slate-200" />
          <div className="h-10 w-3/4 rounded-2xl bg-slate-200" />
          <div className="h-8 w-32 rounded-full bg-slate-200" />
          <div className="space-y-3 pt-6">
            <div className="h-16 w-full rounded-2xl bg-slate-200" />
            <div className="h-16 w-full rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeCalcOpen, setIsSizeCalcOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ size: false, color: false });
  const [toastMessage, setToastMessage] = useState(null);

  // ── Fetch product from API ───────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProductDetail(id);
      const raw = data.product || data;
      const normalized = normalizeProduct(raw);
      setProduct(normalized);
    } catch (err) {
      console.error("Product fetch error:", err);
      setError(err.message || "Product not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Option Handlers ──────────────────────────────────────────────────────
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setValidationErrors((prev) => ({ ...prev, size: false }));
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setValidationErrors((prev) => ({ ...prev, color: false }));
  };

  const validateSelection = () => {
    const errs = { size: false, color: false };
    let hasError = false;

    if (product.sizes?.length > 0 && !selectedSize) {
      errs.size = true;
      hasError = true;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      errs.color = true;
      hasError = true;
    }

    setValidationErrors(errs);
    return !hasError;
  };

  // ── Action Handlers ──────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    showToast("Added to bag successfully!");
  };

  const handleOrderNow = () => {
    if (!validateSelection()) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    router.push("/checkout");
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    showToast(isInWishlist(product?.id) ? "Removed from Wishlist" : "Saved to Wishlist!");
  };

  const scrollToReviews = () => {
    const element = document.getElementById("customer-reviews");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ── Render States ────────────────────────────────────────────────────────
  if (loading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 px-4 text-center">
        <div className="rounded-full bg-rose-50 p-6 text-brand-rose">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900">Product Not Found</h2>
        <p className="max-w-md text-sm text-slate-500">
          {error || "The item you requested may have been removed or is temporarily unavailable."}
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="rounded-full bg-brand-rose px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-rose/30 transition-all hover:bg-rose-500 hover:scale-105"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = !product.inStock || product.stock <= 0;
  const brandName =
    typeof product.brand === "object" && product.brand !== null
      ? product.brand.name
      : product.brand;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-pink/20 via-white to-white pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-12">
        {/* ── Breadcrumb Navigation ────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1">
          <Link href="/" className="hover:text-brand-rose transition-colors flex-shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <Link href="/shop" className="hover:text-brand-rose transition-colors flex-shrink-0">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              <span className="text-slate-700 font-bold flex-shrink-0">{product.category}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <span className="text-slate-400 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── MAIN CONTENT GRID ──────────────────────────────────────────────
            LEFT COLUMN (col-span-7): Image Gallery + Customer Reviews directly underneath
            RIGHT COLUMN (col-span-5): Buy Box + Description + Specs + Benefits + Delivery
        ──────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          {/* LEFT COLUMN: Image Gallery & Customer Reviews directly underneath */}
          <div className="lg:col-span-7 space-y-10">
            <ImageGallery
              images={product.images}
              productName={product.name}
              discountPercent={product.discountPercent}
              isOutOfStock={isOutOfStock}
            />

            {/* Customer Reviews in the space directly under the image gallery */}
            <div className="border-t border-slate-200/80 pt-8">
              <ProductReviews productId={product.id} />
            </div>
          </div>

          {/* RIGHT COLUMN: Buy Box & Product Specifications/Details */}
          <div className="lg:col-span-5 space-y-8">
            {/* Header / Titles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-brand-pink border border-brand-rose/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-rose">
                  {brandName ? `${brandName} • ` : ""}
                  {product.category}
                </span>
                {product.sku && (
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-serif font-extrabold text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
                {product.name}
              </h1>

              {/* Quick Ratings Jump */}
              <button
                onClick={scrollToReviews}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-rose transition-colors"
              >
                <div className="flex items-center text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="underline decoration-slate-300 underline-offset-4">
                  See Customer Reviews
                </span>
              </button>

              {/* Price & Stock Row */}
              <div className="flex flex-wrap items-baseline gap-3 pt-2">
                <span className="text-3xl font-extrabold text-brand-rose tracking-tight">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-lg font-semibold text-slate-400 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}

                <span
                  className={cn(
                    "ml-auto rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider border",
                    isOutOfStock
                      ? "bg-red-50 text-red-700 border-red-200"
                      : product.stock <= 5
                        ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  )}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : product.stock <= 5
                      ? `Only ${product.stock} Left!`
                      : `In Stock`}
                </span>
              </div>
            </div>

            {/* Option Selectors */}
            <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onChange={handleColorChange}
                disabled={isOutOfStock}
                error={validationErrors.color}
              />

              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onChange={handleSizeChange}
                onOpenGuide={() => setIsSizeCalcOpen(true)}
                disabled={isOutOfStock}
                error={validationErrors.size}
              />

              <QuantityPicker
                quantity={quantity}
                onChange={setQuantity}
                disabled={isOutOfStock}
              />

              {/* CTA Buttons */}
              <div className="space-y-3 pt-3">
                <div className="flex gap-3">
                  <button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl border-2 border-brand-rose bg-white py-4 text-sm font-bold text-brand-rose transition-all hover:bg-pink-50 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 flex-shrink-0",
                      isWishlisted
                        ? "border-brand-rose bg-brand-rose text-white shadow-md shadow-brand-rose/25"
                        : "border-slate-200 bg-white text-slate-600 hover:border-brand-rose hover:text-brand-rose"
                    )}
                    aria-label="Add to wishlist"
                  >
                    <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                  </button>
                </div>

                <button
                  disabled={isOutOfStock}
                  onClick={handleOrderNow}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-rose py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-brand-rose/30 transition-all hover:bg-rose-500 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Zap className="h-5 w-5 fill-current" />
                  {isOutOfStock ? "Out of Stock" : "Order Now (Express)"}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 rounded-3xl border border-brand-pink bg-brand-pink/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-rose shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase">100% Discrete</h5>
                  <p className="text-[10px] font-medium text-slate-500">Private packaging guaranteed</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-rose shadow-sm">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Fast Delivery</h5>
                  <p className="text-[10px] font-medium text-slate-500">All over Bangladesh</p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            {product.description && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="h-5 w-5 text-brand-rose" /> Description
                </h4>
                <p className="text-sm leading-relaxed text-slate-600 font-normal">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                <h4 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Specifications
                </h4>
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-200/60">
                      {product.specifications.map((spec, index) => (
                        <tr key={index} className="hover:bg-slate-100/50 transition-colors">
                          <td className="px-4 py-3 font-bold uppercase tracking-wider text-slate-400 w-1/3">
                            {spec.key}
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-semibold">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Key Benefits Checklist */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                <h4 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Key Benefits
                </h4>
                <ul className="space-y-3">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-brand-rose flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available Delivery Divisions */}
            {product.availableDivisions && product.availableDivisions.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-4">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="h-4 w-4 text-brand-rose" /> Delivery Availability
                </h4>
                <p className="text-xs text-slate-500">
                  We deliver directly to your address in these divisions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.availableDivisions.map((div, index) => (
                    <span
                      key={index}
                      className="rounded-xl border border-brand-rose/20 bg-brand-pink/40 px-3 py-1.5 text-xs font-bold text-brand-rose"
                    >
                      {div}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY MOBILE ACTION BAR ─────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 p-3 backdrop-blur-md shadow-2xl flex items-center gap-3">
        <div className="flex-grow pl-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</p>
          <p className="text-lg font-extrabold text-brand-rose">৳{product.price.toLocaleString()}</p>
        </div>
        <button
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="rounded-xl border-2 border-brand-rose bg-white px-4 py-2.5 text-xs font-bold text-brand-rose disabled:opacity-50"
        >
          Add to Bag
        </button>
        <button
          disabled={isOutOfStock}
          onClick={handleOrderNow}
          className="rounded-xl bg-brand-rose px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-brand-rose/30 disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>

      {/* Size Calculator Modal */}
      <SizeCalculator
        isOpen={isSizeCalcOpen}
        onClose={() => setIsSizeCalcOpen(false)}
      />
    </div>
  );
}