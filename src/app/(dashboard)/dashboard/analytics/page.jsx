"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Loader2,
  PieChart,
  BarChart3,
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
import RoleGuard from "@/components/dashboard/RoleGuard";
import { getDashboardStats, getDashboardCharts } from "@/lib/api";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"];

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="rounded-2xl bg-red-50 p-3 text-red-600">
        <Icon className="h-5 w-5" />
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

const SkeletonChart = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="h-5 w-32 mb-4 animate-pulse rounded-full bg-gray-200" />
    <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-100" />
  </div>
);

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, chartsData] = await Promise.all([
        getDashboardStats(),
        getDashboardCharts(),
      ]);
      setStats(statsData?.stats || null);
      setCharts(chartsData?.charts || null);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load analytics data",
        confirmButtonColor: "#e30613",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Analytics</h1>
          <p className="mt-2 text-sm text-slate-600">
            Detailed insights into your store performance.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              {stats?.totalRevenue !== undefined && (
                <StatCard
                  title="Total Revenue"
                  value={`$${Number(stats.totalRevenue).toLocaleString()}`}
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
                  value={`$${Number(stats.totalInvestments).toLocaleString()}`}
                  icon={TrendingUp}
                />
              )}
            </>
          )}
        </div>

        {error && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50 p-8">
            <p className="text-lg font-medium text-slate-700">{error}</p>
            <button
              onClick={fetchData}
              className="rounded-full bg-red-600 px-6 py-2 cursor-pointer text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Charts */}
        {!loading && charts && !error && (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Monthly Revenue */}
            {charts.revenueChart && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-slate-500" />
                  <h3 className="text-lg font-semibold text-slate-800">Monthly Revenue</h3>
                </div>
                <div className="h-80">
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
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Sales by Category */}
            {charts.categoryChart && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-5 w-5 text-slate-500" />
                  <h3 className="text-lg font-semibold text-slate-800">Sales by Category</h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={charts.categoryChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
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

            {/* Order Status Distribution */}
            {charts.orderChart && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-slate-500" />
                  <h3 className="text-lg font-semibold text-slate-800">Order Status Distribution</h3>
                </div>
                <div className="h-80">
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

        {/* Loading Skeleton for Charts */}
        {loading && (
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
