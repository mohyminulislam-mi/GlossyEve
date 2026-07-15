"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [], redirectPath = '/login' }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(redirectPath);
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.replace('/');
      }
    }
  }, [user, loading, router, allowedRoles, redirectPath]);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-rose" />
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Loading Session...</p>
        </div>
      </div>
    );
  }

  // Double check authorization to avoid layout flashes
  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
