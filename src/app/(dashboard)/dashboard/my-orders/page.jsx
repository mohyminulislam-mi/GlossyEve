"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Loader2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/app/(mainLayout)/provider/AuthProvider";
import { getMyOrders } from "@/lib/api";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    pending_verification: "bg-orange-100 text-orange-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const labels = {
    pending: "Pending",
    pending_verification: "Pending Verification",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

const StatusStepper = ({ status }) => {
  const steps = [
    { key: "placed", label: "Placed", icon: Package, active: true },
    { key: "processing", label: "Processing", icon: Clock, active: ["processing", "shipped", "delivered"].includes(status) },
    { key: "shipped", label: "Shipped", icon: Truck, active: ["shipped", "delivered"].includes(status) },
    { key: "delivered", label: "Delivered", icon: CheckCircle2, active: status === "delivered" },
  ];

  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
        <XCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.active
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-700">{step.label}</p>
            </div>
            {!isLast && (
              <div
                className={`h-0.5 w-12 ${
                  step.active ? "bg-red-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const SkeletonOrder = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-10 w-10 rounded-full bg-gray-200" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-32 rounded-full bg-gray-200" />
        <div className="h-3 w-24 rounded-full bg-gray-200" />
      </div>
    </div>
    <div className="h-32 rounded-2xl bg-gray-100" />
  </div>
);

export default function MyOrdersPage() {
  const { loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOrders();
      setOrders(data?.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchOrders();
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-slate-700">{error}</p>
        <button
          onClick={fetchOrders}
          className="rounded-full cursor-pointer bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">My Account</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">My Orders</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and track all your orders.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonOrder key={i} />
          ))}
        </div>
      ) : !orders.length ? (
        <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">You haven&apos;t placed any orders yet</h3>
          <p className="text-sm text-slate-600 mb-6">
            Explore our products and place your first order.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {order.invoiceNumber || `#${order._id?.slice(-8)}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={order.orderStatus} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                  </p>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1 cursor-pointer rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TODO: Pagination (if backend supports it for my-orders) */}
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Order Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedOrder.invoiceNumber || `#${selectedOrder._id?.slice(-8)}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border cursor-pointer border-gray-200 p-2 text-slate-600 transition hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
              {/* Status Stepper */}
              <StatusStepper status={selectedOrder.orderStatus} />

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                        {item.product?.images?.[0] || item.product?.image ? (
                          <img
                            src={
                              Array.isArray(item.product.images)
                                ? item.product.images[0]
                                : item.product.image
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">
                          ${Number(item.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="rounded-2xl border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Shipping Address</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {selectedOrder.shippingAddress.street}
                    {selectedOrder.shippingAddress.city && (
                      <>, {selectedOrder.shippingAddress.city}</>
                    )}
                    {selectedOrder.shippingAddress.postalCode && (
                      <>
                        <br />
                        {selectedOrder.shippingAddress.postalCode}
                      </>
                    )}
                    {selectedOrder.shippingAddress.country && (
                      <>
                        <br />
                        {selectedOrder.shippingAddress.country}
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Payment */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Payment</h3>
                <p className="text-sm text-slate-600">
                  Method: {selectedOrder.paymentMethod}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Status: {selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1) || "Pending"}
                </p>
              </div>

              {/* Totals */}
              <div className="rounded-2xl border border-gray-100 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>৳{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span>
                    {Number(selectedOrder.shippingCost) > 0
                      ? `৳${Number(selectedOrder.shippingCost).toFixed(2)}`
                      : "Free"}
                  </span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex items-center justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span>-৳{Number(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2 text-base font-semibold text-slate-800">
                  <span>Total</span>
                  <span>৳{Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-5 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full cursor-pointer border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
