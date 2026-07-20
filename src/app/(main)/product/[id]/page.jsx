"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  "navy blue": "#000080"
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
    const sizeSpec = specs.find(s => {
      const k = s.key?.toLowerCase().trim();
      return k === "size" || k === "sizes" || k === "available sizes" || k === "available size";
    });
    if (sizeSpec && sizeSpec.value) {
      sizes = sizeSpec.value.split(",").map(v => v.trim()).filter(Boolean);
    }
  }

  let colors = raw.colors || [];
  if (!colors.length && specs.length) {
    const colorSpec = specs.find(s => {
      const k = s.key?.toLowerCase().trim();
      return k === "color" || k === "colors" || k === "available colors" || k === "available color";
    });
    if (colorSpec && colorSpec.value) {
      colors = colorSpec.value.split(",").map(v => v.trim()).filter(Boolean);
    }
  }

  return {
    ...raw,
    id: raw._id || raw.id,
    price: raw.discountPrice ?? raw.price,
    originalPrice: raw.discountPrice ? raw.price : null,
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

// ─── Sub-component: Image Gallery ────────────────────────────────────────────
function ImageGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-slate-100 shadow-lg">
        <img
          src={images[activeIndex]}
          alt={productName}
          className="h-full w-full object-cover transition-all duration-300"
          referrerPolicy="no-referrer"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                activeIndex === i
                  ? "border-brand-rose scale-95"
                  : "border-transparent opacity-60 hover:opacity-90"
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
    </div>
  );
}

// ─── Sub-component: Color Selector ───────────────────────────────────────────
function ColorSelector({ colors, selectedColor, onChange, disabled, error }) {
  if (!colors.length) return null;
  return (
    <div className={cn(
      "space-y-3 p-4 rounded-2xl transition-all duration-300", 
      error ? "bg-rose-50/50 border border-rose-200/80 shadow-sm shadow-rose-100" : "bg-transparent border border-transparent"
    )}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-widest text-slate-900">
          Color:{" "}
          <span className="font-semibold text-brand-rose">
            {selectedColor || "Select Color"}
          </span>
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const hex = getColorHex(color);
          const isSelected = selectedColor === color;
          const isWhiteOrCream = color.toLowerCase().includes("white") || color.toLowerCase().includes("cream") || color.toLowerCase().includes("ivory");
          
          return (
            <button
              key={color}
              type="button"
              disabled={disabled}
              onClick={() => onChange(color)}
              className={cn(
                "flex items-center gap-2.5 px-4.5 py-2.5 rounded-full border-2 text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-[0.97]",
                isSelected
                  ? "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-rose/40 hover:bg-slate-50/50"
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border transition-transform duration-300 shadow-sm",
                  isSelected ? "border-white/80 scale-110" : "border-slate-300"
                )}
                style={{ backgroundColor: hex }}
              />
              <span>{color}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse mt-1.5">
          <AlertCircle className="h-4 w-4" /> Please select a color
        </p>
      )}
    </div>
  );
}

// ─── Sub-component: Size Selector ────────────────────────────────────────────
function SizeSelector({ sizes, selectedSize, onChange, onOpenGuide, disabled, error }) {
  if (!sizes.length) return null;
  return (
    <div className={cn(
      "space-y-3 p-4 rounded-2xl transition-all duration-300", 
      error ? "bg-rose-50/50 border border-rose-200/80 shadow-sm shadow-rose-100" : "bg-transparent border border-transparent"
    )}>
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-widest text-slate-900">
          Size:{" "}
          <span className="font-semibold text-brand-rose">
            {selectedSize || "Select Size"}
          </span>
        </label>
        <button
          type="button"
          onClick={onOpenGuide}
          disabled={disabled}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-rose hover:underline disabled:opacity-50"
        >
          <Ruler className="h-4 w-4" /> Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              disabled={disabled}
              onClick={() => onChange(size)}
              className={cn(
                "flex h-12 min-w-[3.5rem] px-4.5 items-center justify-center rounded-xl border-2 text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-[0.97]",
                isSelected
                  ? "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-rose/40 hover:bg-slate-50/50"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse mt-1.5">
          <AlertCircle className="h-4 w-4" /> Please select a size
        </p>
      )}
    </div>
  );
}

// ─── Sub-component: Quantity Picker ──────────────────────────────────────────
function QuantityPicker({ quantity, onChange, disabled }) {
  return (
    <div>
      <label className="mb-3 block text-sm font-bold uppercase tracking-widest text-slate-900">
        Quantity
      </label>
      <div className="flex w-32 items-center justify-between rounded-xl border-2 border-slate-200 p-1 bg-white">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={disabled}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-bold text-slate-900">{quantity}</span>
        <button
          onClick={() => onChange(quantity + 1)}
          disabled={disabled}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50"
          aria-label="Increase quantity"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 animate-pulse">
        <div className="aspect-[3/4] rounded-3xl bg-slate-200" />
        <div className="space-y-6">
          <div className="h-4 w-24 rounded-full bg-slate-200" />
          <div className="h-10 w-3/4 rounded-2xl bg-slate-200" />
          <div className="h-8 w-32 rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-full bg-slate-200" />
            <div className="h-4 w-5/6 rounded-full bg-slate-200" />
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
      // Removed auto-selection to let the user select their size and color explicitly
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

  // ── Option Change Handlers with auto error clearing ──────────────────────
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setValidationErrors((prev) => ({ ...prev, size: false }));
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setValidationErrors((prev) => ({ ...prev, color: false }));
  };

  // ── Validation helper ────────────────────────────────────────────────────
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

  // ── Action handlers ──────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleOrderNow = () => {
    if (!validateSelection()) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    router.push("/checkout");
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  // ── Render states ────────────────────────────────────────────────────────
  if (loading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-serif font-bold">Product Not Found</h2>
        <p className="text-slate-500">{error || "The product you're looking for doesn't exist."}</p>
        <button
          onClick={() => router.push("/shop")}
          className="rounded-full bg-brand-rose px-6 py-3 font-bold text-white transition-all hover:bg-rose-500"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = !product.inStock || product.stock <= 0;
  const brandName = typeof product.brand === "object" && product.brand !== null ? product.brand.name : product.brand;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* ── Image Gallery ──────────────────────────────────────────── */}
        <ImageGallery images={product.images} productName={product.name} />

        {/* ── Product Information ────────────────────────────────────── */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-rose">
              {brandName ? `${brandName} • ` : ""}{product.category}
            </p>
            <h1 className="mt-2 text-4xl font-serif font-bold text-slate-900 sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p className="text-3xl font-bold text-brand-rose">
                ৳{product.price.toLocaleString()}
              </p>
              {product.originalPrice && (
                <p className="text-lg text-slate-400 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </p>
              )}
              <span
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider",
                  isOutOfStock ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                )}
              >
                {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} units)`}
              </span>
            </div>
            {product.sku && (
              <p className="mt-2 text-xs uppercase tracking-widest text-slate-400 font-bold">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {/* Selectors */}
          <div className="space-y-6">
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl border-2 border-brand-rose py-5 text-lg font-bold text-brand-rose transition-all hover:bg-brand-pink hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
                >
                  <ShoppingBag className="h-6 w-6" /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  onClick={handleWishlist}
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95",
                    isWishlisted
                      ? "border-brand-rose bg-brand-rose text-white shadow-lg shadow-brand-rose/20"
                      : "border-brand-rose text-brand-rose hover:bg-brand-pink"
                  )}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={cn("h-6 w-6", isWishlisted && "fill-current")}
                  />
                </button>
              </div>
              <button
                disabled={isOutOfStock}
                onClick={handleOrderNow}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-rose py-5 text-lg font-bold text-white shadow-xl shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Zap className="h-6 w-6 fill-current" /> {isOutOfStock ? "Out of Stock" : "Order Now"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-brand-pink/50 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-rose" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Discrete Packaging
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-brand-rose" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fast BD Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-4 border-t border-brand-pink pt-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Description
              </h4>
              <p className="leading-relaxed text-slate-600 text-sm font-medium">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="space-y-4 border-t border-brand-pink pt-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Specifications
              </h4>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-200/60">
                    {product.specifications.map((spec, index) => (
                      <tr key={index} className="hover:bg-slate-100/30 transition-colors">
                        <td className="px-5 py-3.5 font-bold uppercase text-[10px] tracking-wider text-slate-400 w-1/3">
                          {spec.key}
                        </td>
                        <td className="px-5 py-3.5 text-slate-800 font-semibold">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Benefits Bullet Checklist */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="space-y-4 border-t border-brand-pink pt-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Key Benefits
              </h4>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-brand-rose flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Available Delivery Divisions */}
          {product.availableDivisions && product.availableDivisions.length > 0 && (
            <div className="space-y-4 border-t border-brand-pink pt-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-rose" /> Delivery Availability
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.availableDivisions.map((div, index) => (
                  <span
                    key={index}
                    className="rounded-xl border border-brand-pink/30 bg-brand-pink/15 px-3.5 py-1.5 text-xs font-bold text-brand-rose transition-all hover:bg-brand-pink/25 cursor-default"
                  >
                    {div}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ProductReviews productId={product.id} />
        </div>
      </div>

      <SizeCalculator
        isOpen={isSizeCalcOpen}
        onClose={() => setIsSizeCalcOpen(false)}
      />
    </div>
  );
}