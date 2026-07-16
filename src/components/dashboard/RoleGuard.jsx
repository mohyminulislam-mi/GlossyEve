"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RoleGuard({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-brand-rose" />
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Verifying Permissions...</p>
        </div>
      </div>
    );
  }

  const hasAccess = user && (allowedRoles.length === 0 || allowedRoles.includes(user.role));

  if (!hasAccess) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-white border border-rose-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Access Denied</h2>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">
            You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-rose py-3 px-4 text-sm font-bold text-white shadow-lg shadow-brand-rose/10 transition-all hover:bg-rose-500 active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
