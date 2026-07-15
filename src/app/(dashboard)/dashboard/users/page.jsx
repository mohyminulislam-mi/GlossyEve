"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Loader2,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  User,
} from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { useAuth } from "@/app/(mainLayout)/provider/AuthProvider";
import { getAllUsers, getUserDetail, updateUserRole } from "@/lib/api";

const RoleBadge = ({ role }) => {
  const styles = {
    customer: "bg-gray-100 text-gray-700",
    manager: "bg-blue-100 text-blue-700",
    admin: "bg-red-100 text-red-700",
  };

  const labels = {
    customer: "Customer",
    manager: "Manager",
    admin: "Admin",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[role] || styles.customer}`}>
      {labels[role] || role}
    </span>
  );
};

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

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [newRole, setNewRole] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const data = await getAllUsers(params);
      setUsers(data?.users || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleViewUser = async (userId) => {
    try {
      setViewingUser(true);
      setSelectedUser(null);
      const data = await getUserDetail(userId);
      setSelectedUser(data);
      setNewRole(data?.user?.role || "");
    } catch (err) {
      console.error("Fetch user detail error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load user details",
        confirmButtonColor: "#e30613",
      });
    } finally {
      setViewingUser(false);
    }
  };

  const handleUpdateRole = async () => {
    const isSelf = currentUser?._id === selectedUser?.user?._id || currentUser?.id === selectedUser?.user?.id;
    if (isSelf) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Change Own Role",
        text: "You cannot modify your own role to prevent accidental lockout.",
        confirmButtonColor: "#e30613",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Change User Role?",
      text: `Are you sure you want to change this user's role to ${newRole}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e30613",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Change Role",
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingRole(true);
      await updateUserRole(selectedUser.user._id || selectedUser.user.id, newRole);
      Swal.fire({
        icon: "success",
        title: "Role Updated",
        text: `User role changed to ${newRole}`,
        confirmButtonColor: "#e30613",
      });
      setSelectedUser((prev) => ({ ...prev, user: { ...prev.user, role: newRole } }));
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          (u._id === selectedUser.user._id || u.id === selectedUser.user.id) ? { ...u, role: newRole } : u
        )
      );
    } catch (err) {
      console.error("Update user role error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update role",
        confirmButtonColor: "#e30613",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Users</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage users and their roles.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Search className="h-3.5 w-3.5" /> Search
              </label>
              <input
                type="text"
                placeholder="Search user name or email..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Filter className="h-3.5 w-3.5" /> Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              >
                <option value="">All</option>
                <option value="customer">Customer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg font-medium text-slate-700">{error}</p>
            <button
              onClick={fetchUsers}
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
        ) : !users.length ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            No users found
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Joined</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {user.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewUser(user._id || user.id)}
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
              {users.map((user) => (
                <div key={user._id || user.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-semibold text-base">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {user.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleViewUser(user._id || user.id)}
                      className="inline-flex items-center cursor-pointer gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
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

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-semibold text-xl">
                    {selectedUser.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {selectedUser.user?.name || "Unknown"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedUser.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full cursor-pointer border border-gray-200 p-2 text-slate-600 transition hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
                {viewingUser ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <>
                    {/* Profile Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Profile</h3>
                        <p className="text-sm text-slate-600 mb-1.5">
                          <span className="font-medium text-slate-700">Name:</span> {selectedUser.user?.name || "N/A"}
                        </p>
                        <p className="text-sm text-slate-600 mb-1.5">
                          <span className="font-medium text-slate-700">Email:</span> {selectedUser.user?.email}
                        </p>
                        {selectedUser.user?.phone && (
                          <p className="text-sm text-slate-600 mb-1.5">
                            <span className="font-medium text-slate-700">Phone:</span> {selectedUser.user.phone}
                          </p>
                        )}
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Joined:</span> {new Date(selectedUser.user?.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Order Summary</h3>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-slate-800">
                            {selectedUser.orderCount || 0}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">Total Orders</p>
                        </div>
                      </div>
                    </div>

                    {/* Role Change (Admin Only) */}
                    {isAdmin && (
                      <div className="rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">Role Management</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Current Role</label>
                            <RoleBadge role={selectedUser.user?.role} />
                          </div>
                          <div className="flex-1">
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">New Role</label>
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              disabled={
                                (currentUser?._id === selectedUser.user?._id || currentUser?.id === selectedUser.user?.id) ||
                                updatingRole
                              }
                              className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-50"
                            >
                              <option value="customer">Customer</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <button
                            onClick={handleUpdateRole}
                            disabled={
                              newRole === selectedUser.user?.role ||
                              (currentUser?._id === selectedUser.user?._id || currentUser?.id === selectedUser.user?.id) ||
                              updatingRole
                            }
                            className="mt-6 inline-flex items-center gap-2 cursor-pointer rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingRole && <Loader2 className="h-4 w-4 animate-spin" />}
                            Update Role
                          </button>
                        </div>
                        {currentUser?._id === selectedUser.user?._id || currentUser?.id === selectedUser.user?.id ? (
                          <p className="text-xs text-orange-600 mt-2">
                            You cannot change your own role.
                          </p>
                        ) : null}
                      </div>
                    )}

                    {/* Recent Orders */}
                    {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 ? (
                      <div className="rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Orders</h3>
                        <div className="space-y-3">
                          {selectedUser.recentOrders.map((order) => (
                            <div
                              key={order._id || order.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
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
                                <p className="text-sm font-semibold text-slate-800">
                                  ${Number(order.total).toFixed(2)}
                                </p>
                                <StatusBadge status={order.orderStatus} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-gray-100 p-4 text-center text-sm text-slate-600">
                        No recent orders.
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 p-5 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
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