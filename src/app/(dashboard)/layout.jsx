"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  ShieldAlert,
  ShoppingBag,
  Store,
  Truck,
  User,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { getAllUsers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const getNavItems = (role, isApproved) => {
  const baseItems = [
    { href: "/dashboard", label: "Dashboard Home", icon: LayoutDashboard },
  ];

  if (role === "admin") {
    // Admin sees everything
    baseItems.push(
      { href: "/dashboard/orders", label: "Manage Orders", icon: ShoppingBag },
      { href: "/dashboard/orders/pending-delivery", label: "Pending Delivery", icon: Truck },
      { href: "/dashboard/orders/create", label: "Create Order", icon: PlusCircle },
      { href: "/dashboard/products", label: "Manage Products", icon: Package },
      { href: "/dashboard/categories", label: "Manage Categories", icon: LayoutGrid },
      { href: "/dashboard/users", label: "Manage Users", icon: User },
      { href: "/dashboard/customers", label: "Customers", icon: Users }
    );
  } else if (role === "manager" && isApproved) {
    // Approved manager: division-scoped order/product management
    baseItems.push(
      { href: "/dashboard/orders", label: "Manage Orders", icon: ShoppingBag },
      { href: "/dashboard/orders/pending-delivery", label: "Pending Delivery", icon: Truck },
      { href: "/dashboard/orders/create", label: "Create Order", icon: PlusCircle },
      { href: "/dashboard/customers", label: "Customers", icon: Users },
      { href: "/dashboard/products", label: "Manage Products", icon: Package },
      { href: "/dashboard/categories", label: "Manage Categories", icon: LayoutGrid }
    );
  } else if (role !== "manager") {
    // Customer
    baseItems.push(
      { href: "/dashboard/my-orders", label: "My Orders", icon: ShoppingBag }
    );
  }
  // Unapproved manager: only Dashboard Home (already in baseItems) + My Profile below

  // Profile is for everyone
  baseItems.push({ href: "/dashboard/profile", label: "My Profile", icon: UserCircle2 });

  return baseItems;
};

const isRouteActive = (href, pathname) => {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/dashboard/orders") {
    return pathname.startsWith("/dashboard/orders") && 
           !pathname.startsWith("/dashboard/orders/pending-delivery") &&
           !pathname.startsWith("/dashboard/orders/create");
  }
  if (href === "/dashboard/users") {
    return pathname.startsWith("/dashboard/users") && !pathname.startsWith("/dashboard/users/pending-approvals");
  }
  return pathname.startsWith(href);
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const navItems = useMemo(
    () => getNavItems(user?.role || "user", user?.isApproved),
    [user?.role, user?.isApproved]
  );

  // Fetch pending manager count for admin badge
  useEffect(() => {
    if (user?.role !== "admin") return;
    getAllUsers({ role: "manager", approved: "false" })
      .then((data) => setPendingCount(data?.total ?? data?.users?.length ?? 0))
      .catch(() => {}); // Silently ignore; badge just won't show
  }, [user?.role]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <p className="text-sm font-semibold text-gray-600">
          {loading ? "Loading dashboard..." : "Redirecting to login..."}
        </p>
      </div>
    );
  }

  const displayName = user?.name || user?.fullName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User";

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA] text-slate-800">
      <div className="flex h-full flex-col md:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-red-100 bg-white/95 shadow-sm backdrop-blur transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-red-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
                  <h2 className="text-lg font-semibold text-slate-800">GlossyEve</h2>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 cursor-pointer text-slate-600 hover:bg-red-50 hover:text-red-600 md:hidden"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#FFF5F5] p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{displayName}</p>
                  <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-red-600 shadow-sm">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isRouteActive(item.href, pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Pending Approvals — admin only */}
              {user?.role === "admin" && (
                <Link
                  href="/dashboard/users/pending-approvals"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isRouteActive("/dashboard/users/pending-approvals", pathname)
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span className="flex-1">Pending Approvals</span>
                  {pendingCount > 0 && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
            </nav>

            <div className="space-y-2 border-t border-red-100 p-4">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <Store className="h-4 w-4" />
                <span>Back to Store</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 cursor-pointer rounded-xl border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex h-full flex-1 flex-col overflow-y-auto">
          <header className="border-b border-red-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
                <h2 className="text-base font-semibold text-slate-800">Welcome back</h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-full p-2 cursor-pointer text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>

          {user?.role === "manager" && user?.isApproved === false && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5 text-sm text-amber-800 md:mx-6 lg:mx-8">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p>
                <span className="font-semibold">Account pending approval.</span>{" "}
                Your account is pending admin approval. Some features are limited until approved.
              </p>
            </div>
          )}
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/30 md:hidden cursor-pointer"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </div>
  );
}
