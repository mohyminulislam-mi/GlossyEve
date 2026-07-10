"use client";

import React from "react";
import { useWishlist } from "../hooks/useWishlist";

export default function WishlistButton({ product, className = "" }) {
  const { toggleWishlist, isInWishlist, isLoaded } = useWishlist();

  // Handle SSR mismatch by avoiding rendering until client-side data is loaded
  if (!isLoaded) {
    return (
      <button
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm ${className}`}
        disabled
        aria-label="Loading wishlist status"
      >
        🤍
      </button>
    );
  }

  const active = isInWishlist(product.id);

  const handleToggle = (e) => {
    // Prevent event from bubbling up (e.g. if inside a Link or clickable Card)
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 ${
        active ? "bg-red-50 text-red-500" : "bg-white text-slate-400"
      } ${className}`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span className="text-xl leading-none">
        {active ? "❤️" : "🤍"}
      </span>
    </button>
  );
}
