"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';








import { api } from '@/lib/api-client';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.getCart();
        if (response.success) {
          setCart(response.data);
        }
      } catch (error) {
        console.error("Cart sync error:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (product, selectedSize, selectedColor) => {
    try {
      const response = await api.addToCart({
        productId: product.id,
        name: product.name || product.title,
        price: product.price,
        selectedSize,
        selectedColor,
        images: product.images || [product.image],
        quantity: 1
      });
      if (response.success) {
        setCart(prev => {
          const existing = prev.find(item => 
            item.productId === product.id && 
            item.selectedSize === selectedSize && 
            item.selectedColor === selectedColor
          );
          if (existing) {
            return prev.map(item => 
              item.id === existing.id ? response.data : item
            );
          }
          return [...prev, response.data];
        });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.removeFromCart(itemId);
      if (response.success) {
        setCart(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await api.updateCartItem(itemId, newQuantity);
      if (response.success) {
        setCart(prev => prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart([]);
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  };

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems, isLoaded }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}