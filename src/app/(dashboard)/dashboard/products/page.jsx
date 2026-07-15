"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Edit2, Filter, Loader2, Plus, Trash2 } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { getProducts, getCategories, deleteProduct } from "@/lib/api";

function normalizeCategories(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function normalizeProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadData = async () => {
    try {
      setLoadingProducts(true);
      setLoadingCategories(true);

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(normalizeProducts(productsData));
      setCategories(normalizeCategories(categoriesData));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to load data",
        text: error.message || "Please refresh and try again.",
        confirmButtonColor: "#e30613",
        background: "#ffffff",
        color: "#171717",
      });
    } finally {
      setLoadingProducts(false);
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((product) => {
      const productCategoryId = product.category?._id || product.category?.id || product.category;
      return productCategoryId === selectedCategory;
    });
  }, [products, selectedCategory]);

  const getCategoryName = (product) => {
    const categoryId = product.category?._id || product.category?.id || product.category;
    const category = categories.find((c) => (c._id || c.id) === categoryId);
    return category?.name || "Uncategorized";
  };

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: "Delete product?",
      text: `This will remove "${product.name}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e30613",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
      background: "#ffffff",
      color: "#171717",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProduct(product._id || product.id);
      Swal.fire({
        icon: "success",
        title: "Product deleted",
        text: "The product has been removed.",
        confirmButtonColor: "#e30613",
        background: "#ffffff",
        color: "#171717",
      });
      loadData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error.message || "Please try again.",
        confirmButtonColor: "#e30613",
        background: "#ffffff",
        color: "#171717",
      });
    }
  };

  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Catalog Management</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Products</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage all products in your store — add new ones, edit existing, or remove items.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              disabled={loadingCategories}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id || category.id} value={category._id || category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {loadingProducts ? (
          <div className="flex min-h-55 items-center justify-center rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
              Loading products...
            </div>
          </div>
        ) : !filteredProducts.length ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            No products found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Divisions</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const productId = product._id || product.id;
                    const isActive = product.active !== false;
                    const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

                    return (
                      <tr key={productId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                              <img
                                src={imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{getCategoryName(product)}</td>
                        <td className="px-4 py-3 text-slate-800">
                          ৳{Number(product.price).toFixed(2)}
                          {product.compareAtPrice && (
                            <span className="ml-2 text-xs text-slate-400 line-through">
                              ৳{Number(product.compareAtPrice).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{product.stock}</td>
                        <td className="px-4 py-3">
                          {!product.availableDivisions || product.availableDivisions.length === 0 ? (
                            <span className="rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium">
                              All Divisions
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {product.availableDivisions.map((division) => (
                                <span
                                  key={division}
                                  className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium"
                                >
                                  {division}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/products/edit/${productId}`}
                              className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
                            >
                              <Edit2 className="inline h-3 w-3 mr-1" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="rounded-full cursor-pointer border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-gray-50"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 className="inline h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:hidden">
              {filteredProducts.map((product) => {
                const productId = product._id || product.id;
                const isActive = product.active !== false;
                const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

                return (
                  <div key={productId} className="overflow-hidden rounded-3xl border border-red-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                        <img
                          src={imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-800">{product.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{getCategoryName(product)}</p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                          <div>
                            <span className="font-medium text-slate-800">৳{Number(product.price).toFixed(2)}</span>
                            {product.compareAtPrice && (
                              <span className="ml-2 text-xs text-slate-400 line-through">
                                ৳{Number(product.compareAtPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div>Stock: {product.stock}</div>
                        </div>

                        <div className="mt-2.5">
                          {!product.availableDivisions || product.availableDivisions.length === 0 ? (
                            <span className="inline-block rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
                              All Divisions
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {product.availableDivisions.map((division) => (
                                <span
                                  key={division}
                                  className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium"
                                >
                                  {division}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/dashboard/products/edit/${productId}`}
                            className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
                          >
                            <Edit2 className="inline h-4 w-4 mr-1" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="inline h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
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