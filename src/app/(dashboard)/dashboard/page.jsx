"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Loader2,
  ArrowRight,
  PieChart,
  BarChart3,
  User,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getDashboardStats,
  getDashboardCharts,
  getAllOrders,
  getMyOrders,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
        {trend !== undefined && (
          <p className={`mt-2 text-xs font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? "+" : ""}{trend} from last month
          </p>
        )}
      </div>
      <div className="rounded-2xl bg-red-50 p-3 text-red-600">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200" />
    <div className="mt-3 h-8 w-32 animate-pulse rounded-full bg-gray-200" />
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    pending_verification: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
    </span>
  );
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [orders, setOrders] = useState([]);

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isAdminOrManager) {
          const [statsData, chartsData, ordersData] = await Promise.all([
            getDashboardStats(),
            getDashboardCharts(),
            getAllOrders({ limit: 5 }),
          ]);
          setStats(statsData?.stats || null);
          setCharts(chartsData?.charts || null);
          setOrders(ordersData?.orders || []);
        } else {
          const myOrders = await getMyOrders();
          setOrders(myOrders?.orders || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to load dashboard data",
          confirmButtonColor: "#e30613",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, isAdminOrManager]);

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
          onClick={() => window.location.reload()}
          className="rounded-full bg-red-600 px-6 py-2 cursor-pointer text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isAdminOrManager) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Welcome back, {user?.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              {stats?.totalRevenue !== undefined && (
                <StatCard
                  title="Total Revenue"
                  value={`৳${Number(stats.totalRevenue).toLocaleString()}`}
                  icon={DollarSign}
                />
              )}
              {stats?.totalOrders !== undefined && (
                <StatCard
                  title="Total Orders"
                  value={Number(stats.totalOrders).toLocaleString()}
                  icon={ShoppingCart}
                />
              )}
              {stats?.totalProducts !== undefined && (
                <StatCard
                  title="Total Products"
                  value={Number(stats.totalProducts).toLocaleString()}
                  icon={Package}
                />
              )}
              {stats?.totalCustomers !== undefined && (
                <StatCard
                  title="Total Customers"
                  value={Number(stats.totalCustomers).toLocaleString()}
                  icon={Users}
                />
              )}
              {stats?.lowStockCount !== undefined && (
                <StatCard
                  title="Low Stock"
                  value={Number(stats.lowStockCount).toLocaleString()}
                  icon={AlertTriangle}
                />
              )}
              {stats?.totalInvestments !== undefined && (
                <StatCard
                  title="Total Investments"
                  value={`৳${Number(stats.totalInvestments).toLocaleString()}`}
                  icon={TrendingUp}
                />
              )}
            </>
          )}
        </div>

        {/* Charts */}
        {!loading && charts && (
          <div className="grid gap-4 lg:grid-cols-2">
            {charts.revenueChart && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-slate-500" />
                  <h3 className="font-semibold text-slate-800">Monthly Revenue</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value) => [`৳${value}`, "Revenue"]}
                      />
                      <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.categoryChart && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-5 w-5 text-slate-500" />
                  <h3 className="font-semibold text-slate-800">Sales by Category</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={charts.categoryChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {charts.categoryChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Sales"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.orderChart && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-slate-500" />
                  <h3 className="font-semibold text-slate-800">Order Status Distribution</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.orderChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {charts.orderChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Orders */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Orders</h3>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded-full bg-gray-200" />
                    <div className="h-3 w-24 rounded-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : !orders.length ? (
            <p className="text-center text-sm text-slate-500 py-8">No orders yet</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {order.invoiceNumber || order._id?.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.user?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        ৳{Number(order.total).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Customer View
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">Welcome back, {user?.name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          View your orders and manage your profile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/my-orders"
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">My Orders</h3>
              <p className="text-xs text-slate-500">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-red-600">
            View All Orders <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">My Profile</h3>
              <p className="text-xs text-slate-500">
                Manage your info
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-red-600">
            Edit Profile <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <div className="rounded-3xl border border-red-100 bg-[#fff5f5] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Browse Products</h3>
            <p className="text-xs text-slate-600">
              Discover our premium lubricants and engine oils.
            </p>
          </div>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Shop Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Preview */}
      {orders.length > 0 && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Recent Orders</h3>
            <Link
              href="/dashboard/my-orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                <div>
                  <p className="text-xs font-medium text-slate-800">
                    {order.invoiceNumber || `#${order._id?.slice(-8)}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-800">
                    ৳{Number(order.total).toLocaleString()}
                  </p>
                  <StatusBadge status={order.orderStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}