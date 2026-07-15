"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Truck } from "lucide-react";
import Swal from "sweetalert2";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { getAllOrders, updateOrderStatus } from "@/lib/api";

const PendingDeliveryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOrders({ status: "processing", limit: 50 });
      setOrders(data?.orders || []);
    } catch (err) {
      console.error("Fetch pending deliveries error:", err);
      setError(err.message || "Failed to load pending deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmDelivery = async (order) => {
    const confirmed = await Swal.fire({
      title: "Confirm delivery",
      text: `Mark order ${order.invoiceNumber || order._id?.slice(-8)} as delivered?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, confirm delivery",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e30613",
      cancelButtonColor: "#94a3b8",
    });

    if (!confirmed.isConfirmed) {
      return;
    }

    try {
      setConfirmingId(order._id);
      await updateOrderStatus(order._id, "delivered");
      setOrders((prevOrders) => prevOrders.filter((item) => item._id !== order._id));
      Swal.fire({
        icon: "success",
        title: "Delivery confirmed",
        text: "Order has been marked as delivered.",
        confirmButtonColor: "#e30613",
      });
    } catch (err) {
      console.error("Confirm delivery error:", err);
      Swal.fire({
        icon: "error",
        title: "Unable to confirm",
        text: err.message || "Failed to update order status.",
        confirmButtonColor: "#e30613",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-800">Pending Delivery</h1>
              <p className="mt-2 text-sm text-slate-600">
                Orders accepted and waiting for delivery confirmation.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              <Truck className="h-4 w-4" /> Processing orders only
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            <p className="mb-4 text-lg font-medium text-slate-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="rounded-full cursor-pointer bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Refresh
            </button>
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-3/5 rounded-full bg-gray-200" />
              <div className="h-6 w-full rounded-full bg-gray-200" />
              <div className="h-6 w-full rounded-full bg-gray-200" />
              <div className="h-6 w-full rounded-full bg-gray-200" />
            </div>
          </div>
        ) : !orders.length ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-12 text-center text-sm text-slate-600 shadow-sm">
            <p className="mb-3 text-lg font-semibold text-slate-800">No pending deliveries</p>
            <p>Orders with status Processing will appear here once accepted.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Items</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Date Ordered</th>
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
                      {order.user?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleConfirmDelivery(order)}
                        disabled={confirmingId === order._id}
                        className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {confirmingId === order._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Confirm Delivery"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default PendingDeliveryPage;
