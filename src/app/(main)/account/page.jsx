"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Heart,
  LogOut,
  User as UserIcon,
  Clock,
  Star,
  MessageSquare,
  Trash2,
  X,
  ChevronRight,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { getMyOrders, getMyUserReviews, deleteUserReview } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  pending_verification: "bg-orange-100 text-orange-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  pending_verification: "Pending Verification",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest",
        STATUS_STYLES[status] || STATUS_STYLES.pending
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Status Stepper ───────────────────────────────────────────────────────────
const STEPS = [
  { key: "placed", label: "Placed", icon: Package },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function StatusStepper({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
        <XCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {STEPS.map((step, index) => {
        const isActive =
          step.key === "placed" ||
          (step.key === "processing" && ["processing", "shipped", "delivered"].includes(status)) ||
          (step.key === "shipped" && ["shipped", "delivered"].includes(status)) ||
          (step.key === "delivered" && status === "delivered");
        const isLast = index === STEPS.length - 1;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2",
                  isActive
                    ? "border-brand-rose bg-brand-rose text-white"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-8 mb-4",
                  isActive ? "bg-brand-rose" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Order Details</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {order.invoiceNumber || `#${order._id?.slice(-8)}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-slate-100 p-2 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
            {/* Status stepper */}
            <StatusStepper status={order.orderStatus} />

            {/* Items */}
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">
                Items
              </h4>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="h-12 w-10 overflow-hidden rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.name || item.product?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {item.name || item.product?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-rose">
                        ৳{(Number(item.price || item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="rounded-2xl border border-slate-100 p-4">
                <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                  Shipping Address
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {[
                    order.shippingAddress.street,
                    order.shippingAddress.city,
                    order.shippingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Price totals */}
            <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>৳{Number(order.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Shipping</span>
                <span>৳{Number(order.shippingCost || 0).toLocaleString()}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-৳{Number(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span className="text-brand-rose">
                  ৳{Number(order.total || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment info */}
            <div className="rounded-2xl border border-slate-100 p-4">
              <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                Payment
              </h4>
              <p className="text-sm text-slate-700">
                Method:{" "}
                <span className="font-bold capitalize">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : order.paymentMethod}
                </span>
              </p>
              <p className="text-sm text-slate-700 mt-1">
                Status:{" "}
                <span className="font-bold capitalize">
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 p-4">
            <button
              onClick={onClose}
              className="w-full rounded-2xl border-2 border-slate-100 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── My Reviews Section ───────────────────────────────────────────────────────
function MyReviewsSection({ userId }) {
  const router = useRouter();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getMyUserReviews();
      if (data?.reviews && data.reviews.length > 0) {
        setUserReviews(data.reviews);
      } else {
        const localReviews = JSON.parse(
          localStorage.getItem("aura_reviews") || "[]"
        );
        setUserReviews(localReviews.filter((r) => r.userId === userId));
      }
    } catch (e) {
      const localReviews = JSON.parse(
        localStorage.getItem("aura_reviews") || "[]"
      );
      setUserReviews(localReviews.filter((r) => r.userId === userId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteUserReview(reviewId);
      setUserReviews((prev) => prev.filter((r) => (r._id || r.id) !== reviewId));
    } catch (err) {
      const updated = JSON.parse(
        localStorage.getItem("aura_reviews") || "[]"
      ).filter((r) => r.id !== reviewId);
      localStorage.setItem("aura_reviews", JSON.stringify(updated));
      setUserReviews((prev) => prev.filter((r) => (r._id || r.id) !== reviewId));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-rose" />
      </div>
    );
  }

  if (!userReviews.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl bg-white text-center shadow-sm border border-slate-100">
        <MessageSquare className="h-12 w-12 text-slate-200" />
        <p className="text-slate-500">You haven't written any reviews yet.</p>
        <button
          onClick={() => router.push("/shop")}
          className="text-sm font-bold text-brand-rose hover:underline"
        >
          Find Products to Review
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {userReviews.map((review) => {
        const reviewId = review._id || review.id;
        const productName = review.product?.name || review.productName || "Product";
        const productImage = review.product?.images?.[0] || review.productImage;
        const productId = review.product?._id || review.product?.id || review.productId;

        return (
          <motion.div
            key={reviewId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {productImage && (
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <img src={productImage} alt={productName} className="h-full w-full object-cover" />
                  </div>
                )}
                <div>
                  {productId ? (
                    <Link href={`/product/${productId}`} className="font-bold text-slate-900 hover:text-brand-rose transition-colors">
                      {productName}
                    </Link>
                  ) : (
                    <h4 className="font-bold text-slate-900">{productName}</h4>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-4 w-4",
                          s <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteReview(reviewId)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Delete review"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed italic">
              "{review.comment}"
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Reviewed on {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Wishlist Section ─────────────────────────────────────────────────────────
function WishlistSection() {
  const { wishlist, removeFromWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-rose" />
      </div>
    );
  }

  if (!wishlist.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl bg-white text-center shadow-sm border border-slate-100">
        <Heart className="h-12 w-12 text-slate-200" />
        <p className="text-slate-500">Your wishlist is empty.</p>
        <button
          onClick={() => router.push("/shop")}
          className="text-sm font-bold text-brand-rose hover:underline"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {wishlist.map((item) => {
        const id = item.id || item._id;
        const name = item.name || "Product";
        const price = item.price || 0;
        const image = item.images?.[0] || item.image;
        const category = item.category || "General";

        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 transition-all hover:shadow-md"
          >
            <Link href={`/product/${id}`} className="block aspect-[4/3] overflow-hidden bg-slate-50">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <Package className="h-10 w-10" />
                </div>
              )}
            </Link>

            <button
              onClick={() => removeFromWishlist(id)}
              className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-rose-500 backdrop-blur-sm transition-all hover:bg-white hover:scale-110 shadow-sm"
              title="Remove from wishlist"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="p-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {typeof category === "object" ? category.name : category}
              </span>
              <Link href={`/product/${id}`} className="block mt-1">
                <h3 className="truncate font-bold text-slate-900 transition-colors hover:text-brand-rose">
                  {name}
                </h3>
              </Link>
              <p className="mt-2 font-bold text-brand-rose">
                ৳{Number(price).toLocaleString()}
              </p>

              <button
                onClick={() =>
                  addToCart(
                    item,
                    1,
                    item.sizes?.[0] || item.sizes || "",
                    item.colors?.[0] || item.colors || ""
                  )
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white transition-all hover:bg-slate-800"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Profile Edit Form ────────────────────────────────────────────────────────
function ProfileSection({ profile, updateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addressObj =
    typeof profile?.rawAddress === "object" && profile?.rawAddress !== null
      ? profile.rawAddress
      : {};

  const [form, setForm] = useState({
    displayName: profile?.displayName || profile?.name || "",
    phone: profile?.phone || "",
    street: addressObj.street || (typeof profile?.address === "string" ? profile.address : ""),
    city: addressObj.city || "",
    postalCode: addressObj.postalCode || "",
    country: addressObj.country || "Bangladesh",
  });

  useEffect(() => {
    if (profile) {
      const addr =
        typeof profile.rawAddress === "object" && profile.rawAddress !== null
          ? profile.rawAddress
          : {};
      setForm({
        displayName: profile.displayName || profile.name || "",
        phone: profile.phone || "",
        street: addr.street || (typeof profile.address === "string" ? profile.address : ""),
        city: addr.city || "",
        postalCode: addr.postalCode || "",
        country: addr.country || "Bangladesh",
      });
    }
  }, [profile]);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: form.displayName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose transition-all";

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-slate-900">
          Profile Information
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm font-bold uppercase tracking-widest text-brand-rose hover:underline"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Full Name
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {profile?.displayName || profile?.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Email
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {profile?.email || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Phone
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {profile?.phone || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Shipping Address
            </p>
            <p className="mt-1 font-bold text-slate-900">
              {profile?.address || "Not provided"}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.displayName}
                onChange={updateField("displayName")}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={updateField("phone")}
                className={inputClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Street Address
              </label>
              <input
                type="text"
                value={form.street}
                onChange={updateField("street")}
                placeholder="House, Road, Area..."
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                City / District
              </label>
              <input
                type="text"
                value={form.city}
                onChange={updateField("city")}
                placeholder="Dhaka, Chittagong..."
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={updateField("country")}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Sidebar Navigation ───────────────────────────────────────────────────────
const NAV_TABS = [
  { id: "orders", label: "My Orders", icon: Package },
  { id: "profile", label: "Profile Info", icon: UserIcon },
  { id: "reviews", label: "My Reviews", icon: MessageSquare },
  { id: "wishlist", label: "Wishlist", icon: Heart },
];

// ─── Main Account Page ────────────────────────────────────────────────────────
export default function Account() {
  const { user, profile, logout, updateProfile, loading: authLoading } =
    useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await getMyOrders();
      setOrders(data?.orders || []);
    } catch (err) {
      setOrdersError(err.message || "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === "orders") {
      fetchOrders();
    }
  }, [user, activeTab]);

  if (authLoading || !user) {
    return (
      <ProtectedRoute>
        <></>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="w-full lg:w-64 space-y-4">
            {/* Avatar card */}
            <div className="rounded-3xl bg-white p-8 shadow-sm text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-pink text-brand-rose text-3xl font-serif font-bold">
                {user.displayName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                {user.displayName || user.name}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-1">
                {user.email}
              </p>
            </div>

            {/* Nav links */}
            <nav className="rounded-3xl bg-white p-4 shadow-sm space-y-1">
              {NAV_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                    activeTab === id
                      ? "bg-brand-pink text-brand-rose"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5" /> {label}
                </button>
              ))}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 transition-all hover:bg-rose-50"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </nav>
          </aside>

          {/* ── Content area ───────────────────────────────────────── */}
          <div className="flex-grow space-y-6">
            {/* Orders tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-slate-900">
                  Order History
                </h2>

                {ordersLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-rose" />
                  </div>
                ) : ordersError ? (
                  <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <p className="text-slate-600">{ordersError}</p>
                    <button
                      onClick={fetchOrders}
                      className="rounded-full bg-brand-rose px-6 py-2 text-sm font-bold text-white hover:bg-rose-500"
                    >
                      Try Again
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl bg-white text-center shadow-sm">
                    <Package className="h-12 w-12 text-slate-200" />
                    <p className="text-slate-500">
                      You haven't placed any orders yet.
                    </p>
                    <button
                      onClick={() => router.push("/shop")}
                      className="text-sm font-bold text-brand-rose hover:underline"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-md"
                      >
                        {/* Order header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 p-6">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                              {order.invoiceNumber || `#${order._id?.slice(-8)}`}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </div>
                          <StatusBadge status={order.orderStatus} />
                        </div>

                        {/* Order footer */}
                        <div className="flex items-center justify-between p-6">
                          <div>
                            <p className="text-xs text-slate-400">Total</p>
                            <p className="text-lg font-bold text-brand-rose">
                              ৳{Number(order.total || 0).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                          >
                            View Details{" "}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-slate-900">
                  Profile Information
                </h2>
                <ProfileSection
                  profile={profile}
                  updateProfile={updateProfile}
                />
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-slate-900">
                  My Reviews
                </h2>
                <MyReviewsSection userId={user.id || user.uid} />
              </div>
            )}

            {/* Wishlist tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-slate-900">
                  Wishlist
                </h2>
                <WishlistSection />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </ProtectedRoute>
  );
}