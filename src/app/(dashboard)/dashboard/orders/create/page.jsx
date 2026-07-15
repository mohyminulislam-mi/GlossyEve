"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Loader2,
  Lock,
  MapPin,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/app/(mainLayout)/provider/AuthProvider";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { getProducts, createManagerOrder } from "@/lib/api";
import { DIVISIONS, DISTRICTS } from "@/lib/bangladeshData";

export default function CreateOrderPage() {
  const { user } = useAuth();
  const router = useRouter();

  // React Hook Form for Customer Information (Section 1)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      customerName: "",
      customerPhone: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      country: "Bangladesh",
      division: "",
      district: "",
    },
  });

  const selectedDivision = watch("division");

  // Pre-fill manager's own division and district from user profile
  useEffect(() => {
    if (user && user.role === "manager") {
      setValue("division", user.division || "");
      setValue("district", user.district || "");
    }
  }, [user, setValue]);

  // Section 2: Products list and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [items, setItems] = useState([]);

  // Debounced search for products (300ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await getProducts({ search: searchQuery, limit: 10 });
        const list = Array.isArray(data) ? data : (data?.products || data?.data || []);
        setSearchResults(list);
      } catch (err) {
        console.error("Search products error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleBrowseAll = async () => {
    try {
      setSearching(true);
      const data = await getProducts({ limit: 50 });
      const list = Array.isArray(data) ? data : (data?.products || data?.data || []);
      setSearchResults(list);
    } catch (err) {
      console.error("Browse all products error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddItem = (product) => {
    if (product.stock <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Out of Stock",
        text: `${product.name} is currently out of stock.`,
        confirmButtonColor: "#e30613",
      });
      return;
    }

    const existingIndex = items.findIndex((item) => item.product === (product._id || product.id));
    if (existingIndex > -1) {
      const updated = [...items];
      if (updated[existingIndex].quantity >= product.stock) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limit Reached",
          text: `Cannot add more. Only ${product.stock} units are available.`,
          confirmButtonColor: "#e30613",
        });
        return;
      }
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      const activePrice = product.discountPrice != null ? product.discountPrice : product.price;
      setItems([
        ...items,
        {
          product: product._id || product.id,
          name: product.name,
          price: activePrice,
          quantity: 1,
          stock: product.stock,
        },
      ]);
    }

    // Clear search
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveItem = (productId) => {
    setItems(items.filter((item) => item.product !== productId));
  };

  const handleQtyChange = (productId, qty) => {
    const updated = items.map((item) => {
      if (item.product === productId) {
        const newQty = Math.max(1, Math.min(item.stock, qty));
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setItems(updated);
  };

  // Math summary
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 ? (subtotal > 150 ? 0 : 5.0) : 0;
  const total = Math.max(0, subtotal + shippingCost);

  const onSubmit = async (data) => {
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Product Required",
        text: "Please add at least one product to the order.",
        confirmButtonColor: "#e30613",
      });
      return;
    }

    try {
      const payload = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: {
          streetAddress: data.streetAddress,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          division: data.division,
          district: data.district,
        },
        items: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      };

      const res = await createManagerOrder(payload);

      await Swal.fire({
        icon: "success",
        title: "Order Created Successfully",
        html: `Order ID/Invoice: <strong>${res?.order?.invoiceNumber || res?.order?._id || ""}</strong>`,
        confirmButtonColor: "#e30613",
      });

      router.push("/dashboard/orders");
    } catch (err) {
      console.error("Submit order error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Create Order",
        text: err.message || "Something went wrong.",
        confirmButtonColor: "#e30613",
      });
    }
  };

  const isAdmin = user?.role === "admin";
  const districtsForDivision = selectedDivision ? DISTRICTS[selectedDivision] || [] : [];

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-800">Create Order</h1>
            <p className="mt-2 text-sm text-slate-600">Create an order on behalf of a customer</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-50 self-start sm:self-center"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
          {/* Left Column (Forms) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Customer Information */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-gray-50 pb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" /> Customer Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Customer Name *</label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    {...register("customerName", { required: "Name is required" })}
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Customer Phone *</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    {...register("customerPhone", { required: "Phone number is required" })}
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  {errors.customerPhone && <p className="text-xs text-red-500 mt-1">{errors.customerPhone.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Street Address *</label>
                  <input
                    type="text"
                    placeholder="Street name, holding no, apartment details"
                    {...register("streetAddress", { required: "Street address is required" })}
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  {errors.streetAddress && <p className="text-xs text-red-500 mt-1">{errors.streetAddress.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    {...register("city", { required: "City is required" })}
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Postal Code *</label>
                  <input
                    type="text"
                    placeholder="Postal Code"
                    {...register("postalCode", { required: "Postal code is required" })}
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Country *</label>
                  <input
                    type="text"
                    placeholder="Country"
                    {...register("country", { required: "Country is required" })}
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
                </div>

                {/* Division dropdown (admin) or read-only input (manager) */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 flex items-center gap-1">
                    Division * {!isAdmin && <Lock className="h-3 w-3 text-slate-400 animate-pulse" />}
                  </label>
                  {isAdmin ? (
                    <select
                      {...register("division", { required: "Division is required" })}
                      className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="">Select Division</option>
                      {DIVISIONS.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      {...register("division")}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                    />
                  )}
                  {errors.division && <p className="text-xs text-red-500 mt-1">{errors.division.message}</p>}
                </div>

                {/* District dropdown (admin) or read-only input (manager) */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 flex items-center gap-1">
                    District * {!isAdmin && <Lock className="h-3 w-3 text-slate-400 animate-pulse" />}
                  </label>
                  {isAdmin ? (
                    <select
                      disabled={!selectedDivision}
                      {...register("district", { required: "District is required" })}
                      className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
                      {districtsForDivision.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      {...register("district")}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                    />
                  )}
                  {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Products Search & List */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-gray-50 pb-3 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-red-500" /> Products Selection
              </h2>

              {/* Product Search */}
              <div className="relative">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Search Product</label>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  {searching && <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-slate-400" />}
                </div>

                {/* Dropdown list of matched products */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-150 bg-white shadow-xl flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-slate-500 font-semibold sticky top-0">
                      <span>Available Products ({searchResults.length})</span>
                      <button 
                        type="button" 
                        onClick={() => setSearchResults([])} 
                        className="text-slate-400 hover:text-slate-650 transition cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {searchResults.map((prod) => {
                        const price = prod.discountPrice != null ? prod.discountPrice : prod.price;
                        return (
                          <li key={prod._id || prod.id}>
                            <button
                              type="button"
                              onClick={() => handleAddItem(prod)}
                              className="w-full flex items-center justify-between px-4 py-3 cursor-pointer text-left text-sm text-slate-700 hover:bg-red-50/50 transition-colors"
                            >
                              <div>
                                <span className="font-semibold text-slate-800">{prod.name}</span>
                                <span className="block text-xs text-slate-450">Stock: {prod.stock} units</span>
                              </div>
                              <span className="font-semibold text-red-600">৳{price.toFixed(2)}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Selected items table */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-500">Selected Products</label>
                {items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-250 py-10 px-4 text-center bg-gray-50/20 flex flex-col items-center justify-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-3 shadow-xs">
                      <Package className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">No products added yet</h3>
                    <p className="mt-1.5 text-xs text-slate-450 max-w-xs mx-auto">
                      Search for specific items using the search box above or browse the complete list of all products.
                    </p>
                    <button
                      type="button"
                      onClick={handleBrowseAll}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Browse all products
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-650">Product Name</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-650">Price</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-650 w-24">Quantity</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-650">Total</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-650 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                          <tr key={item.product}>
                            <td className="px-4 py-3.5 font-medium text-slate-850">{item.name}</td>
                            <td className="px-4 py-3.5 text-right text-slate-650">৳{item.price.toFixed(2)}</td>
                            <td className="px-4 py-3.5">
                              <input
                                type="number"
                                min={1}
                                max={item.stock}
                                value={item.quantity}
                                onChange={(e) => handleQtyChange(item.product, parseInt(e.target.value) || 1)}
                                className="w-full text-center rounded-xl border border-gray-200 py-1 text-sm outline-none focus:border-red-400"
                              />
                            </td>
                            <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.product)}
                                className="text-slate-400 hover:text-red-650 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Summary & Submit) */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-gray-50 pb-3">Order Summary</h2>

              <div className="space-y-2 text-sm text-slate-650">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="font-semibold text-slate-800">
                    {shippingCost > 0 ? `৳${shippingCost.toFixed(2)}` : "Free"}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                <span className="text-sm font-semibold text-slate-700 font-sans">Total Amount</span>
                <span className="text-2xl font-bold text-red-600 font-sans">৳{total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-100 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
