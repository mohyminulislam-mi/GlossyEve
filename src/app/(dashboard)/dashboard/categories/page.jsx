"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { ImagePlus, Loader2, PencilLine, Trash2, UploadCloud, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/lib/api";

function normalizeCategories(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

const CATEGORY_FALLBACK_IMAGES = {
  "car-engine-oils": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600",
  "motorcycle-engine-oils": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600",
  "bus-truck-engine-oils": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600",
  "cng-engine-oils": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=600",
  "vehicle-care": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=600",
  "industrial-lubricants": "https://images.unsplash.com/photo-1565984429576-c83f5e6b0b7a?q=80&w=600"
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600";

function getCategoryImage(category) {
  const img = category?.image || category?.image_url;
  if (!img || img.includes("placeholder") || img.startsWith("/")) {
    return CATEGORY_FALLBACK_IMAGES[category?.slug] || DEFAULT_FALLBACK;
  }
  return img;
}


function CategoryForm({ editingCategory, onSuccess, onCancel, isInModal = false }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: editingCategory?.name || "",
      slug: editingCategory?.slug || "",
      description: editingCategory?.description || "",
      image: undefined,
    },
  });

  const nameValue = watch("name", "");
  const descriptionValue = watch("description", "");

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name || "",
        slug: editingCategory.slug || "",
        description: editingCategory.description || "",
        image: undefined,
      });
      setImagePreview(editingCategory.image || null);
      return;
    }

    setImagePreview(null);
  }, [editingCategory, reset]);

  useEffect(() => {
    if (!nameValue) {
      setValue("slug", "", { shouldDirty: true });
      return;
    }

    const slug = nameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setValue("slug", slug, { shouldDirty: true });
  }, [nameValue, setValue]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(editingCategory?.image || null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description);

      if (data.image?.[0]) {
        formData.append("image", data.image[0]);
      }

      if (editingCategory) {
        await updateCategory(editingCategory._id || editingCategory.id, formData);
        Swal.fire({
          icon: "success",
          title: "Category updated",
          text: "The category has been updated successfully.",
          confirmButtonColor: "#e30613",
          background: "#ffffff",
          color: "#171717",
        });
      } else {
        await createCategory(formData);
        Swal.fire({
          icon: "success",
          title: "Category created",
          text: "The category has been created successfully.",
          confirmButtonColor: "#e30613",
          background: "#ffffff",
          color: "#171717",
        });
      }

      reset({ name: "", slug: "", description: "", image: undefined });
      setImagePreview(null);
      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: editingCategory ? "Update failed" : "Creation failed",
        text: error.message || "Please try again.",
        confirmButtonColor: "#e30613",
        background: "#ffffff",
        color: "#171717",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${
        isInModal
          ? ""
          : "rounded-3xl border border-red-100 bg-white p-5 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {editingCategory ? "Edit Category" : "Create New Category"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {editingCategory ? "Update the category details below." : "Add a new product category to the storefront."}
          </p>
        </div>
        {editingCategory && !isInModal ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-red-200 cursor-pointer px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            {...register("name", { required: "Category name is required" })}
            className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            placeholder="e.g. Engine Oils"
          />
          {errors.name ? <p className="mt-1 text-sm text-red-600">{errors.name.message}</p> : null}
        </div>

        <div className="hidden">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug</label>
          <input
            type="text"
            {...register("slug", { required: "Slug is required" })}
            className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            placeholder="engine-oils"
          />
          <p className="mt-1 text-xs text-slate-500">URL preview: /products/category/{watch("slug") || "your-slug"}</p>
          {errors.slug ? <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          rows={4}
          maxLength={200}
          {...register("description", {
            required: "Description is required",
            maxLength: { value: 200, message: "Description must be 200 characters or fewer" },
          })}
          className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          placeholder="Short description for the category page"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span>{errors.description ? <span className="text-red-600">{errors.description.message}</span> : null}</span>
          <span>{descriptionValue?.length || 0}/200</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-[#FFF5F5] px-4 py-5 text-center text-sm text-slate-600 transition hover:border-red-400 hover:bg-red-50">
          <UploadCloud className="mb-2 h-5 w-5 text-red-500" />
          <span className="font-medium text-slate-700">Choose category image</span>
          <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</span>
          <input
            type="file"
            accept="image/*"
            {...register("image", {
              required: !editingCategory ? "Image is required" : false,
            })}
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-slate-400">
              <ImagePlus className="mb-2 h-6 w-6" />
              <span className="text-sm">No image selected</span>
            </div>
          )}
          {errors.image ? <p className="mt-2 text-sm text-red-600">{errors.image.message}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {editingCategory ? "Save Changes" : "Create Category"}
        </button>
        {editingCategory ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-200 cursor-pointer px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
          >
            Discard
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(normalizeCategories(data));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to load categories",
        text: error.message || "Please refresh and try again.",
        confirmButtonColor: "#e30613",
        background: "#ffffff",
        color: "#171717",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (category) => {
    const result = await Swal.fire({
      title: "Delete category?",
      text: `This will remove ${category.name}.`,
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
      await deleteCategory(category._id || category.id);
      Swal.fire({
        icon: "success",
        title: "Category deleted",
        text: "The category has been removed.",
        confirmButtonColor: "#e30613",
        background: "#ffffff",
        color: "#171717",
      });
      loadCategories();
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

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex min-h-55 items-center justify-center rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            Loading categories...
          </div>
        </div>
      );
    }

    if (!categories.length) {
      return (
        <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          No categories available yet.
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const categoryId = category._id || category.id;
          const productCount = category.productCount ?? category.productsCount ?? category.product_count ?? category.products?.length ?? null;
          return (
            <div key={categoryId} className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
              <img
                src={getCategoryImage(category)}
                alt={category.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{category.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">/{category.slug}</p>
                  </div>
                  {productCount !== null ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      {productCount} products
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-slate-600 line-clamp-3">{category.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(category)}
                    className="inline-flex items-center cursor-pointer gap-2 cursor-pointer rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="inline-flex items-center cursor-pointer gap-2 cursor-pointer rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [categories, loading]);

  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Catalog Management</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Categories</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create, edit, and remove product categories from the storefront.
          </p>
        </div>

        <CategoryForm
          editingCategory={null}
          onSuccess={() => {
            loadCategories();
          }}
        />

        {/* Edit Category Modal */}
        <AnimatePresence>
          {editingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-gray-100 bg-white p-6 shadow-2xl"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="absolute top-6 right-6 p-1.5 cursor-pointer rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                <CategoryForm
                  editingCategory={editingCategory}
                  isInModal={true}
                  onSuccess={() => {
                    setEditingCategory(null);
                    loadCategories();
                  }}
                  onCancel={() => setEditingCategory(null)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Existing Categories</h2>
            <span className="text-sm text-slate-500">{categories.length} total</span>
          </div>
          {content}
        </div>
      </div>
    </RoleGuard>
  );
}
