"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { Loader2, User } from "lucide-react";
import { useAuth } from "@/app/(mainLayout)/provider/AuthProvider";

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          postalCode: user.address?.postalCode || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await updateUser({
        name: data.name,
        phone: data.phone,
        address: {
          street: data.address?.street || "",
          city: data.address?.city || "",
          postalCode: data.address?.postalCode || "",
          country: data.address?.country || "",
        },
      });
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully!",
        confirmButtonColor: "#e30613",
      });
    } catch (err) {
      console.error("Update profile error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update profile. Please try again.",
        confirmButtonColor: "#e30613",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">My Account</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">My Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your personal information and shipping address.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-3xl font-semibold text-white mb-4">
              {user?.name?.charAt(0).toUpperCase() || <User className="h-12 w-12" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{user?.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
            <div className="mt-4 rounded-full bg-gray-100 px-3 py-1">
              <span className="text-xs font-medium text-slate-600 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-6">Edit Profile</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email (read-only)</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-slate-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                {...register("phone")}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 mt-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-4">Shipping Address</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    {...register("address.street")}
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    {...register("address.city")}
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    {...register("address.postalCode")}
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Country
                  </label>
                  <input
                    type="text"
                    {...register("address.country")}
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
