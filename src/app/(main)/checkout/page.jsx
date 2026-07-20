"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Tag,
  CheckCircle2,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/api";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";
import ProtectedRoute from "@/components/ProtectedRoute";

// ─── Constants ────────────────────────────────────────────────────────────────
const DISTRICTS = [
  { name: "Dhaka", shipping: 60 },
  { name: "Chittagong", shipping: 120 },
  { name: "Sylhet", shipping: 120 },
  { name: "Rajshahi", shipping: 120 },
  { name: "Khulna", shipping: 120 },
  { name: "Barisal", shipping: 120 },
  { name: "Rangpur", shipping: 120 },
  { name: "Mymensingh", shipping: 120 },
];

const INITIAL_FORM = {
  fullName: "",
  phone: "",
  district: "Dhaka",
  area: "",
  address: "",
  paymentMethod: "cod",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A labelled text/tel/textarea input with consistent styling */
function FormField({ label, required, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold uppercase tracking-widest text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 p-4 outline-none ring-brand-rose/20 transition-all focus:border-brand-rose focus:ring-4";

/** Radio-style payment method button */
function PaymentOption({ id, label, description, selected, onSelect }) {
  return (
    <button
      type="button"
      id={id}
      onClick={() => onSelect()}
      className={cn(
        "flex items-center justify-between rounded-2xl border-2 p-6 transition-all",
        selected
          ? "border-brand-rose bg-brand-pink/30"
          : "border-slate-100 hover:border-brand-rose"
      )}
    >
      <div className="text-left">
        <p className="font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border-2",
          selected ? "border-brand-rose bg-brand-rose" : "border-slate-200"
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Pre-fill form from logged-in user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) router.replace("/cart");
  }, [cart, router]);

  // ── Computed values ────────────────────────────────────────────────────────
  const shippingCost =
    DISTRICTS.find((d) => d.name === formData.district)?.shipping || 120;

  // Coupon discount is calculated server-side; show estimated only
  const grandTotal = totalPrice + shippingCost;

  // ── Coupon handler ─────────────────────────────────────────────────────────
  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    // Real validation happens server-side on order submission
    setCouponApplied(true);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponError("");
  };

  // ── Form submit → open confirmation modal ─────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderError("");
    setIsModalOpen(true);
  };

  // ── Confirm order → API call ───────────────────────────────────────────────
  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setOrderError("");

    try {
      // Build shipping address to match server schema
      const shippingAddress = {
        street: [formData.area, formData.address].filter(Boolean).join(", "),
        city: formData.district,
        postalCode: "1207",      // Default BD postal code; can be extended later
        country: "Bangladesh",
      };

      // Map cart items to server-expected format
      const items = cart.map((item) => ({
        product: item.productId,   // MongoDB _id stored in cart
        quantity: item.quantity,
      }));

      const orderPayload = {
        items,
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: formData.paymentMethod,
        ...(couponApplied && couponCode.trim()
          ? { couponCode: couponCode.trim().toUpperCase() }
          : {}),
      };

      const result = await createOrder(orderPayload);

      // API returns the created order (api.js extracts data.data ?? data)
      const createdOrder = result.order || result;

      clearCart();
      router.push(
        `/success?invoiceNumber=${createdOrder.invoiceNumber}&trackingId=${createdOrder.trackingId}`
      );
    } catch (err) {
      console.error("Order creation error:", err);
      setOrderError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  // ── Field update helper ───────────────────────────────────────────────────
  const updateField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  if (cart.length === 0) return null;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/cart")}
          className="mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-brand-rose transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </button>

        <h1 className="mb-12 text-4xl font-serif font-bold text-slate-900">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-12 lg:grid-cols-3"
        >
          {/* ── Left: Shipping + Payment ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping details card */}
            <div className="rounded-3xl bg-white p-8 shadow-sm space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-serif font-bold text-slate-900">
                <Truck className="h-6 w-6 text-brand-rose" /> Shipping Details
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField label="Full Name" required>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={updateField("fullName")}
                    className={inputClass}
                    placeholder="e.g., Nusrat Jahan"
                  />
                </FormField>

                <FormField label="Phone Number" required>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={updateField("phone")}
                    className={inputClass}
                    placeholder="e.g., 017XXXXXXXX"
                  />
                </FormField>

                <FormField label="District">
                  <select
                    value={formData.district}
                    onChange={updateField("district")}
                    className={inputClass}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Area / Thana" required>
                  <input
                    required
                    type="text"
                    value={formData.area}
                    onChange={updateField("area")}
                    className={inputClass}
                    placeholder="e.g., Dhanmondi"
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Full Address" required>
                    <textarea
                      required
                      rows={3}
                      value={formData.address}
                      onChange={updateField("address")}
                      className={inputClass}
                      placeholder="House #, Road #, Flat #"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Payment method card */}
            <div className="rounded-3xl bg-white p-8 shadow-sm space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-serif font-bold text-slate-900">
                <CreditCard className="h-6 w-6 text-brand-rose" /> Payment
                Method
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PaymentOption
                  id="payment-cod"
                  label="Cash on Delivery"
                  description="Pay when you receive"
                  selected={formData.paymentMethod === "cod"}
                  onSelect={() =>
                    setFormData((prev) => ({ ...prev, paymentMethod: "cod" }))
                  }
                />
                <PaymentOption
                  id="payment-online"
                  label="Online Payment"
                  description="bKash, Nagad, Card"
                  selected={formData.paymentMethod === "manual"}
                  onSelect={() =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: "manual",
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary ────────────────────────────────── */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-serif font-bold text-slate-900">
                <ShoppingBag className="h-5 w-5 text-brand-rose" /> Order
                Summary
              </h2>

              {/* Cart items list */}
              <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-1">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="h-16 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Qty: {item.quantity}
                        {item.selectedSize && ` | ${item.selectedSize}`}
                      </p>
                      <p className="text-sm font-bold text-brand-rose">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="space-y-2 mb-4">
                {!couponApplied ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-rose"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Coupon "{couponCode.toUpperCase()}" applied
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[10px] text-red-500">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-[10px] text-slate-400 italic">
                    Final discount applied at checkout.
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 border-t border-brand-pink pt-4 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>৳{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping ({formData.district})</span>
                  <span>৳{shippingCost.toLocaleString()}</span>
                </div>
                <div className="border-t border-brand-pink pt-3">
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Estimated Total</span>
                    <span className="text-brand-rose">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                  </div>
                  {couponApplied && (
                    <p className="mt-1 text-[10px] text-slate-400 italic">
                      * Coupon discount will be applied on final total
                    </p>
                  )}
                </div>
              </div>

              {/* Error message */}
              {orderError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {orderError}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-rose py-5 text-lg font-bold text-white shadow-xl shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                Confirm Order
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 rounded-2xl bg-brand-pink/50 p-4 text-brand-rose">
              <ShieldCheck className="h-6 w-6 flex-shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Discrete &amp; Private Packaging Guaranteed
              </p>
            </div>
          </div>
        </form>

        {/* Confirmation modal */}
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmOrder}
          isSubmitting={isSubmitting}
          orderSummary={{
            itemCount: cart.length,
            subtotal: totalPrice,
            shipping: shippingCost,
            discount: 0,
            total: grandTotal,
          }}
        />
      </div>
    </ProtectedRoute>
  );
}