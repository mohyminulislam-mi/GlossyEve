"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(undefined);

// Helper function to normalize backend user to match frontend property names
const normalizeUser = (backendUser) => {
  if (!backendUser) return null;

  // Format backend address object to string
  let addressString = '';
  if (backendUser.address) {
    if (typeof backendUser.address === 'string') {
      addressString = backendUser.address;
    } else {
      const parts = [
        backendUser.address.street,
        backendUser.address.city,
        backendUser.address.postalCode,
        backendUser.address.country
      ].filter(Boolean);
      addressString = parts.join(', ');
    }
  }

  return {
    uid: backendUser.id || backendUser._id,
    id: backendUser.id || backendUser._id,
    displayName: backendUser.name || backendUser.displayName || '',
    name: backendUser.name || backendUser.displayName || '',
    email: backendUser.email || '',
    role: backendUser.role || 'customer',
    phone: backendUser.phone || '',
    address: addressString,
    rawAddress: backendUser.address || null,
    wishlist: backendUser.wishlist || [],
    avatar: backendUser.avatar || '',
    investmentAmount: backendUser.investmentAmount || 0
  };
};

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          const normalized = normalizeUser(data.user);
          setUser(normalized);
          setProfile(normalized);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setProfile(normalized);
      return { success: true, role: normalized.role };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.displayName,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || ''
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setProfile(normalized);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signupGuest = async (guestData) => {
    const newGuest = {
      ...guestData,
      uid: 'guest-' + Date.now(),
      id: 'guest-' + Date.now(),
      role: 'guest',
      isGuest: true,
      wishlist: [],
      address: ''
    };
    setUser(newGuest);
    setProfile(newGuest);
    return { success: true };
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'user@gmail.com',
          name: 'Google User',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          googleId: 'google-' + Date.now()
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Google Login failed');
      }

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setProfile(normalized);
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(null);
      setProfile(null);
      router.push('/login');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user || !profile) {
      return { success: false, error: 'Login required' };
    }

    const currentWishlist = profile.wishlist || [];
    const newWishlist = currentWishlist.includes(productId) ?
      currentWishlist.filter((id) => id !== productId) :
      [...currentWishlist, productId];

    const updatedProfile = { ...profile, wishlist: newWishlist };
    setProfile(updatedProfile);
    setUser(updatedProfile);
  };

  const updateProfile = async (newData) => {
    try {
      const body = {
        name: newData.displayName || newData.name,
        phone: newData.phone || '',
      };

      if (newData.address !== undefined) {
        if (typeof newData.address === 'object' && newData.address !== null) {
          body.address = {
            street: newData.address.street || '',
            city: newData.address.city || '',
            postalCode: newData.address.postalCode || '',
            country: newData.address.country || ''
          };
        } else {
          body.address = {
            street: String(newData.address),
            city: '',
            postalCode: '',
            country: ''
          };
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Profile update failed');
      }

      const updatedUser = normalizeUser(data.user);
      setUser(updatedUser);
      setProfile(updatedUser);
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, signupGuest, loginWithGoogle, logout, toggleWishlist, updateProfile, updateUser: updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}