"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import mockUsers from '@/data/users.json';

const AuthContext = createContext(undefined);

const MOCK_USER = {
  uid: 'admin-123',
  email: 'mohyminulislam2001@gmail.com',
  displayName: 'Mohyminul Islam',
  role: 'admin',
  wishlist: [],
  addresses: [
    {
      id: 'addr-1',
      fullName: 'Mohyminul Islam',
      phone: '01700000000',
      district: 'Dhaka',
      area: 'Dhanmondi',
      address: 'House 123, Road 45'
    }
  ]
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aura_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setProfile(parsedUser);
      } catch (e) {
        localStorage.removeItem('aura_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check mock data
    const allUsers = JSON.parse(localStorage.getItem('aura_users') || '[]');
    const combinedUsers = [...mockUsers, ...allUsers];
    
    const foundUser = combinedUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser || email === MOCK_USER.email) {
      const userData = foundUser || MOCK_USER;
      setUser(userData);
      setProfile(userData);
      localStorage.setItem('aura_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const signup = async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      ...userData,
      uid: 'user-' + Date.now(),
      role: 'user',
      wishlist: [],
      addresses: []
    };
    
    const allUsers = JSON.parse(localStorage.getItem('aura_users') || '[]');
    allUsers.push(newUser);
    localStorage.setItem('aura_users', JSON.stringify(allUsers));
    
    setUser(newUser);
    setProfile(newUser);
    localStorage.setItem('aura_user', JSON.stringify(newUser));
    return { success: true };
  };

  const signupGuest = async (guestData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newGuest = {
      ...guestData,
      uid: 'guest-' + Date.now(),
      role: 'guest',
      isGuest: true,
      wishlist: [],
      addresses: []
    };
    
    setUser(newGuest);
    setProfile(newGuest);
    localStorage.setItem('aura_user', JSON.stringify(newGuest));
    return { success: true };
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const googleUser = {
      uid: 'google-' + Date.now(),
      displayName: 'Google User',
      email: 'user@gmail.com',
      role: 'user',
      wishlist: [],
      addresses: []
    };
    setUser(googleUser);
    setProfile(googleUser);
    localStorage.setItem('aura_user', JSON.stringify(googleUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('aura_user');
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
    localStorage.setItem('aura_user', JSON.stringify(updatedProfile));
  };

  const updateProfile = (newData) => {
    const updatedProfile = { ...profile, ...newData };
    setProfile(updatedProfile);
    setUser(updatedProfile);
    localStorage.setItem('aura_user', JSON.stringify(updatedProfile));
    
    const allUsers = JSON.parse(localStorage.getItem('aura_users') || '[]');
    const updatedUsers = allUsers.map(u => u.uid === profile.uid ? updatedProfile : u);
    localStorage.setItem('aura_users', JSON.stringify(updatedUsers));
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, signupGuest, loginWithGoogle, logout, toggleWishlist, updateProfile, isAdmin }}>
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