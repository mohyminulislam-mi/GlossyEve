"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Loader2,
  Search,
  Filter,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { getAllOrders, getOrderDetail, updateOrderStatus } from "@/lib/api";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    pending_verification: "bg-orange-100 text-orange-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const labelMap = {
    pending: "Pending",
    pending_verification: "Pending Verification",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
      {labelMap[status] || status}
    </span>
  );
};

const SkeletonTable = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
        <div className="h-8 w-24 rounded-full bg-gray-200" />
        <div className="h-8 w-32 rounded-full bg-gray-200" />
        <div className="h-8 w-16 rounded-full bg-gray-200" />
        <div className="h-8 w-20 rounded-full bg-gray-200" />
        <div className="h-8 w-24 rounded-full bg-gray-200" />
        <div className="h-8 w-24 rounded-full bg-gray-200" />
        <div className="h-8 w-12 rounded-full bg-gray-200" />
      </div>
    ))}
  </div>
);

const SkeletonCards = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
        <div className="h-6 w-32 rounded-full bg-gray-200 mb-4" />
        <div className="h-4 w-40 rounded-full bg-gray-200 mb-3" />
        <div className="h-4 w-24 rounded-full bg-gray-200" />
      </div>
    ))}
  </div>
);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const data = await getAllOrders(params);
      setOrders(data?.orders || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleViewOrder = async (orderId) => {
    try {
      setViewingOrder(true);
      setSelectedOrder(null);
      const data = await getOrderDetail(orderId);
      setSelectedOrder(data?.order || data);
    } catch (err) {
      console.error("Fetch order detail error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load order details",
        confirmButtonColor: "#e30613",
      });
    } finally {
      setViewingOrder(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateOrderStatus(selectedOrder._id, newStatus);
      Swal.fire({
        icon: "success",
        title: "Order Updated",
        text: `Order status changed to ${newStatus}`,
        confirmButtonColor: "#e30613",
      });
      setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === selectedOrder._id ? { ...o, orderStatus: newStatus } : o
        )
      );
    } catch (err) {
      console.error("Update order status error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update order status",
        confirmButtonColor: "#e30613",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getNextActions = (status) => {
    switch (status) {
      case "pending":
      case "pending_verification":
        return [
          {
            label: "Accept",
            value: "processing",
            color: "bg-green-600 hover:bg-green-700",
            note: "After accepting, order will appear in Pending Delivery page",
          },
          { label: "Reject", value: "cancelled", color: "bg-red-600 hover:bg-red-700" },
        ];
      case "processing":
        return [
          { label: "Mark as Shipped", value: "shipped", color: "bg-purple-600 hover:bg-purple-700" },
          { label: "Cancel", value: "cancelled", color: "bg-red-600 hover:bg-red-700" },
        ];
      case "shipped":
        return [
          { label: "Mark as Delivered", value: "delivered", color: "bg-green-600 hover:bg-green-700" },
        ];
      case "delivered":
      case "cancelled":
      default:
        return [];
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-800">Orders</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage and track all customer orders.
            </p>
          </div>
          <Link
            href="/dashboard/orders/create"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm whitespace-nowrap self-start sm:self-center cursor-pointer"
          >
            + Create Order
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Search className="h-3.5 w-3.5" /> Search
              </label>
              <input
                type="text"
                placeholder="Search customer name, email, tracking ID..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Filter className="h-3.5 w-3.5" /> Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Calendar className="h-3.5 w-3.5" /> From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Calendar className="h-3.5 w-3.5" /> To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg font-medium text-slate-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="rounded-full cursor-pointer bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <>
            <div className="hidden md:block">
              <SkeletonTable />
            </div>
            <div className="md:hidden">
              <SkeletonCards />
            </div>
          </>
        ) : !orders.length ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            No orders found
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Items</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {order.invoiceNumber || `#${order._id?.slice(-8)}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.user?.name || order.customerName || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        ৳{Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="inline-flex items-center gap-1 cursor-pointer rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {orders.map((order) => (
                <div key={order._id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {order.invoiceNumber || `#${order._id?.slice(-8)}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.user?.name || order.customerName || "Unknown"}
                      </p>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-600">
                    <div>Items: {order.items?.length || 0}</div>
                    <div className="text-right font-semibold text-slate-800">
                      ৳{Number(order.total).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleViewOrder(order._id)}
                      className="inline-flex items-center gap-1 cursor-pointer rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={filters.page <= 1}
                  className="rounded-full cursor-pointer border border-gray-200 p-2 text-slate-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                  disabled={filters.page >= totalPages}
                  className="rounded-full cursor-pointer border border-gray-200 p-2 text-slate-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
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
                  className="rounded-full cursor-pointer border border-gray-200 p-2 text-slate-600 transition hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
                {viewingOrder ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <>
                    {/* Status Actions */}
                    {(() => {
                      const actions = getNextActions(selectedOrder.orderStatus);
                      if (!actions.length) return null;
                      return (
                        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                          <div className="flex flex-wrap gap-3">
                            {actions.map((action) => (
                              <button
                                key={action.value}
                                onClick={() => handleStatusUpdate(action.value)}
                                disabled={updatingStatus}
                                className={`inline-flex items-center gap-2 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                              >
                                {updatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                                {action.label}
                              </button>
                            ))}
                          </div>
                          {actions.some((action) => action.note) && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                              {actions.map((action) => action.note && (
                                <p key={action.value}>{action.note}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Customer & Shipping Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Customer</h3>
                        <p className="text-sm text-slate-600">Name: {selectedOrder.user?.name || selectedOrder.customerName || "N/A"}</p>
                        {selectedOrder.user?.email && <p className="text-sm text-slate-600">Email: {selectedOrder.user.email}</p>}
                        {selectedOrder.customerPhone && <p className="text-sm text-slate-600">Phone: {selectedOrder.customerPhone}</p>}
                      </div>
                      <div className="rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Payment</h3>
                        <p className="text-sm text-slate-600">
                          Method: {selectedOrder.paymentMethod}
                        </p>
                        <p className="text-sm text-slate-600">
                          Status:{" "}
                          <span className="capitalize">{selectedOrder.paymentStatus}</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-4">
                      <h3 className="text-sm font-semibold text-slate-800 mb-3">Shipping Address</h3>
                      <p className="text-sm text-slate-600">
                        {selectedOrder.managerCreated ? (
                          <>
                            {selectedOrder.customerAddress?.streetAddress && <>{selectedOrder.customerAddress.streetAddress}<br /></>}
                            {selectedOrder.customerAddress?.city && <>{selectedOrder.customerAddress.city}</>}
                            {selectedOrder.customerAddress?.postalCode && <>, {selectedOrder.customerAddress.postalCode}<br /></>}
                            {selectedOrder.customerAddress?.country && <>{selectedOrder.customerAddress.country}</>}
                          </>
                        ) : (
                          <>
                            {selectedOrder.shippingAddress?.street && <>{selectedOrder.shippingAddress.street}<br /></>}
                            {selectedOrder.shippingAddress?.city && <>{selectedOrder.shippingAddress.city}, </>}
                            {selectedOrder.shippingAddress?.postalCode && <>{selectedOrder.shippingAddress.postalCode}<br /></>}
                            {selectedOrder.shippingAddress?.country && <>{selectedOrder.shippingAddress.country}</>}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <h3 className="text-sm font-semibold text-slate-800 mb-4">Order Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 rounded-xl bg-gray-50"
                          >
                            <div className="h-14 w-14 overflow-hidden rounded-xl border border-gray-200 bg-white">
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
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <Package className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-800">
                                ৳{Number(item.price).toFixed(2)}
                              </p>
                              <p className="text-xs text-slate-500">
                                ৳{(Number(item.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
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
                  </>
                )}
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
    </RoleGuard>
  );
}