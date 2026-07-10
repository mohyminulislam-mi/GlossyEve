"use client";

import { useState, useEffect, useCallback } from "react";

const WISHLIST_KEY = "wishlist";

import { api } from '@/lib/api-client';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.getWishlist();
        if (response.success) {
          // Map backend data to frontend structure if needed
          // Assuming backend returns IDs or full objects
          setWishlist(response.data);
        }
      } catch (error) {
        console.error("Wishlist sync error:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchWishlist();
  }, []);

  const addToWishlist = async (product) => {
    try {
      const response = await api.addToWishlist(product.id);
      if (response.success) {
        setWishlist(prev => [...prev, product]);
      }
    } catch (error) {
      console.error("Add to wishlist error:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.removeFromWishlist(productId);
      if (response.success) {
        setWishlist(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error("Remove from wishlist error:", error);
    }
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId || item === productId);
  };

  return {
    wishlist,
    wishlistCount: wishlist.length,
    isLoaded,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist
  };
};
