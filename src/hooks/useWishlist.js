"use client";

import { useState, useEffect } from "react";

const WISHLIST_KEY = "aura_wishlist";

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedWishlist = localStorage.getItem(WISHLIST_KEY);
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Wishlist parse error", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = async (product) => {
    setWishlist(prev => {
      if (!prev.some(item => item.id === product.id)) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const removeFromWishlist = async (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
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
