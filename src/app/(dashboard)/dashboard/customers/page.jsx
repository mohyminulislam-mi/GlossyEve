"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Loader2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
} from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useAuth } from "@/app/(mainLayout)/provider/AuthProvider";
import { getAllUsers, getUserDetail } from "@/lib/api";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    pending_verification: "bg-orange-100 text-orange-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="rounded-2xl bg-red-50 p-3 text-red-600">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="h-8 w-32 rounded-full bg-gray-200" />
        <div className="h-8 w-40 rounded-full bg-gray-200" />
        <div className="h-8 w-20 rounded-full bg-gray-200" />
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
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 rounded-full bg-gray-200" />
            <div className="h-4 w-40 rounded-full bg-gray-200" />
          </div>
        </div>
        <div className="h-4 w-24 rounded-full bg-gray-200" />
      </div>
    ))}
  </div>
);

export default function CustomersPage() {
  const { user: currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(false);

  const isManager = currentUser?.role === "manager";
  const division = currentUser?.division;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        role: "customer",
        page,
        limit: 10,
      };
      
      if (search) {
        params.search = search;
      }
      
      if (isManager && division) {
        params.division = division;
      }
      
      const data = await getAllUsers(params);
      
      setCustomers(data?.users || []);
      setTotalCustomers(data?.total || 0);
      setTotalPages(data?.totalPages || 0);
      
      // Calculate total orders or read from backend if available
      const computedOrders = data?.totalOrders ?? data?.users?.reduce((sum, u) => sum + (u.orderCount || 0), 0) ?? 0;
      setTotalOrders(computedOrders);
      
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, isManager, division]);

  const handleViewCustomer = async (customerId) => {
    try {
      setViewingCustomer(true);
      // Pre-set empty structure to avoid undefined reads during loading
      setSelectedCustomer({ user: {}, recentOrders: [], orderCount: 0 });
      const data = await getUserDetail(customerId);
      setSelectedCustomer(data);
    } catch (err) {
      console.error("Fetch customer detail error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load customer details",
        confirmButtonColor: "#e30613",
      });
      setSelectedCustomer(null);
    } finally {
      setViewingCustomer(false);
    }
  };

  const subtitle = isManager
    ? `${division || "Your"} Division Customers`
    : "Manage all customers across all divisions";

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Customers</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Customers" value={totalCustomers} icon={Users} />
          <StatCard title="Total Orders (This Page)" value={totalOrders} icon={ShoppingBag} />
        </div>

        {/* Filter / Search Bar */}
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Search className="h-3.5 w-3.5" /> Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg font-medium text-slate-700">{error}</p>
            <button
              onClick={fetchCustomers}
              className="rounded-full bg-red-600 px-6 py-2 cursor-pointer text-sm font-semibold text-white transition hover:bg-red-700"
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
        ) : !customers.length ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            No customers found
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Avatar</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">District</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Joined</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((cust) => (
                    <tr key={cust._id || cust.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-semibold text-sm">
                          {cust.name?.charAt(0).toUpperCase() || "C"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {cust.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {cust.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {cust.district || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewCustomer(cust._id || cust.id)}
                          className="inline-flex items-center gap-1 cursor-pointer rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {customers.map((cust) => (
                <div key={cust._id || cust.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-semibold text-base">
                      {cust.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {cust.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {cust.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 border-t border-b border-gray-50 py-2">
                    <div>
                      <span className="font-semibold text-slate-600">District:</span> {cust.district || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">Joined:</span> {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewCustomer(cust._id || cust.id)}
                      className="w-full cursor-pointer sm:w-auto inline-flex items-center justify-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-gray-200 p-2 cursor-pointer text-slate-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="rounded-full cursor-pointer border border-gray-200 p-2 text-slate-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Customer Detail Drawer / Modal */}
        {(selectedCustomer || viewingCustomer) && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 p-5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-semibold text-xl">
                    {selectedCustomer?.user?.name?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {selectedCustomer?.user?.name || "Loading..."}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedCustomer?.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-full cursor-pointer border border-gray-200 p-2 text-slate-600 transition hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-6 flex-1">
                {viewingCustomer ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <>
                    {/* Profile details */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-gray-50 pb-2">Profile Details</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <User className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{selectedCustomer.user?.name || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{selectedCustomer.user?.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{selectedCustomer.user?.phone || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-gray-50 pb-2">Location & Stats</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {[selectedCustomer.user?.district, selectedCustomer.user?.division].filter(Boolean).join(", ") || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>Joined: {selectedCustomer.user?.createdAt ? new Date(selectedCustomer.user.createdAt).toLocaleDateString() : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <ShoppingBag className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>Total Orders: <strong className="text-slate-800 font-semibold">{selectedCustomer.orderCount || 0}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders List */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Orders</h3>
                      {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCustomer.recentOrders.map((order) => (
                            <div
                              key={order._id || order.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-all border border-gray-100"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {order.invoiceNumber || `#${(order._id || order.id)?.slice(-8)}`}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-800 mb-0.5">
                                  ${Number(order.total).toFixed(2)}
                                </p>
                                <StatusBadge status={order.orderStatus} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-gray-100 p-8 text-center text-sm text-slate-600">
                          No recent orders found.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 p-5 flex justify-end shrink-0 bg-gray-50/50">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-full border cursor-pointer border-gray-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-100"
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
