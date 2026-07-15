"use client";

import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { getAllUsers, approveManager } from "@/lib/api";

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 rounded-full bg-gray-200" style={{ width: `${60 + i * 10}%` }} />
      </td>
    ))}
  </tr>
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded-full bg-gray-200" />
        <div className="h-3 w-44 rounded-full bg-gray-200" />
      </div>
    </div>
    <div className="h-3 w-24 rounded-full bg-gray-200 mb-2" />
    <div className="h-3 w-28 rounded-full bg-gray-200" />
  </div>
);

export default function PendingApprovalsPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchPendingManagers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers({ role: "manager", approved: "false" });
      setManagers(data?.users || []);
    } catch (err) {
      console.error("Fetch pending managers error:", err);
      setError(err.message || "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingManagers();
  }, [fetchPendingManagers]);

  const handleApprove = async (manager) => {
    const result = await Swal.fire({
      title: "Approve Manager?",
      html: `Approve <strong>${manager.name}</strong> as a manager?<br/><span class="text-sm text-gray-500">They will gain full manager access immediately.</span>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setApprovingId(manager._id || manager.id);
      await approveManager(manager._id || manager.id);
      // Remove approved manager from list optimistically
      setManagers((prev) =>
        prev.filter((m) => (m._id || m.id) !== (manager._id || manager.id))
      );
      Swal.fire({
        icon: "success",
        title: "Manager Approved",
        text: `${manager.name} now has full manager access.`,
        confirmButtonColor: "#e30613",
      });
    } catch (err) {
      console.error("Approve manager error:", err);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: err.message || "Could not approve manager. Please try again.",
        confirmButtonColor: "#e30613",
      });
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
                Admin
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-800">
                Pending Approvals
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Manager accounts waiting for your approval before gaining full access.
              </p>
            </div>
            <button
              onClick={fetchPendingManagers}
              disabled={loading}
              title="Refresh list"
              className="mt-1 rounded-full cursor-pointer border border-gray-200 p-2.5 text-slate-500 transition hover:bg-gray-50 hover:text-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Count chip */}
          {!loading && !error && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <ShieldAlert className="h-3.5 w-3.5" />
              {managers.length === 0
                ? "No pending approvals"
                : `${managers.length} pending approval${managers.length !== 1 ? "s" : ""}`}
            </div>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-red-200 bg-white p-8">
            <p className="text-sm font-medium text-slate-700">{error}</p>
            <button
              onClick={fetchPendingManagers}
              className="rounded-full cursor-pointer bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Division", "District", "Registered", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile skeleton */}
            <div className="grid gap-4 md:hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        ) : managers.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-green-200 bg-white p-12 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800">All caught up!</p>
              <p className="mt-1 text-sm text-slate-500">
                There are no manager accounts waiting for approval.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Division</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">District</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Registered</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {managers.map((manager) => {
                    const id = manager._id || manager.id;
                    const isApproving = approvingId === id;
                    return (
                      <tr key={id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                              {manager.name?.charAt(0).toUpperCase() || "M"}
                            </div>
                            <span className="font-medium text-slate-800">
                              {manager.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{manager.email}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {manager.division || <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {manager.district || <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {manager.createdAt
                            ? new Date(manager.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleApprove(manager)}
                            disabled={isApproving}
                            className="inline-flex items-center gap-1.5 cursor-pointer rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isApproving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                            {isApproving ? "Approving…" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {managers.map((manager) => {
                const id = manager._id || manager.id;
                const isApproving = approvingId === id;
                return (
                  <div
                    key={id}
                    className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
                        {manager.name?.charAt(0).toUpperCase() || "M"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">
                          {manager.name || "Unknown"}
                        </p>
                        <p className="truncate text-xs text-slate-500">{manager.email}</p>
                      </div>
                    </div>

                    {(manager.division || manager.district) && (
                      <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {[manager.division, manager.district].filter(Boolean).join(", ")}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        Registered{" "}
                        {manager.createdAt
                          ? new Date(manager.createdAt).toLocaleDateString()
                          : "—"}
                      </p>
                      <button
                        onClick={() => handleApprove(manager)}
                        disabled={isApproving}
                        className="inline-flex items-center gap-1.5 cursor-pointer rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isApproving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5" />
                        )}
                        {isApproving ? "Approving…" : "Approve"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
