"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, Heart, LogOut, User as UserIcon, Clock, Star, MessageSquare, Edit3, Trash2, Chrome } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import mockOrders from '@/data/orders.json';
import { MOCK_PRODUCTS } from '@/constants';

export default function Account() {
  const { user, profile, logout, loginWithGoogle, updateProfile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [userReviews, setUserReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    phone: '',
    district: '',
    area: '',
    address: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        district: profile.district || '',
        area: profile.area || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      const response = await api.getReviews({ userId: user?.id || user?.uid });
      if (response.success) {
        setUserReviews(response.data);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    }
  };

  const handleUpdateReview = async (reviewId, newRating, newComment) => {
    try {
      const response = await api.updateReview(reviewId, { rating: newRating, comment: newComment });
      if (response.success) {
        fetchUserReviews();
        setEditingReview(null);
      }
    } catch (error) {
      console.error("Update review error:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const response = await api.deleteReview(reviewId);
      if (response.success) {
        fetchUserReviews();
      }
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.getUserOrders(user?.id || user?.uid);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile(profileForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-8 px-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-pink text-brand-rose">
          <UserIcon className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-serif font-bold text-slate-900">Your AURA Awaits</h2>
          <p className="mx-auto max-w-sm text-slate-500">Sign in to track your orders, manage your wishlist, and experience the best of AURA.</p>
        </div>
        
        <div className="flex w-full max-w-xs flex-col gap-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95"
          >
            Sign In with Email
          </button>
          
          <button
            onClick={loginWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-600 transition-all hover:border-brand-rose hover:text-brand-rose active:scale-[0.98]"
          >
            <Chrome className="h-5 w-5" />
            Google Account
          </button>
        </div>

        <p className="text-sm font-medium text-slate-500">
          New to AURA?{' '}
          <button onClick={() => router.push('/signup')} className="font-bold text-brand-rose hover:underline">Create an account</button>
        </p>
      </div>);

  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 space-y-4">
          <div className="rounded-3xl bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-pink text-brand-rose text-3xl font-serif font-bold">
              {user.displayName?.[0] || 'U'}
            </div>
            <h2 className="font-serif text-xl font-bold text-slate-900">{user.displayName}</h2>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>

          <nav className="rounded-3xl bg-white p-4 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                activeTab === 'orders' ? "bg-brand-pink text-brand-rose" : "text-slate-500 hover:bg-slate-50"
              )}>
              
              <Package className="h-5 w-5" /> My Orders
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                activeTab === 'profile' ? "bg-brand-pink text-brand-rose" : "text-slate-500 hover:bg-slate-50"
              )}>
              
              <UserIcon className="h-5 w-5" /> Profile Info
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                activeTab === 'reviews' ? "bg-brand-pink text-brand-rose" : "text-slate-500 hover:bg-slate-50"
              )}>
              
              <MessageSquare className="h-5 w-5" /> My Reviews
            </button>
            <button
              onClick={() => router.push('/wishlist')}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
              
              <Heart className="h-5 w-5" /> Wishlist
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 transition-all hover:bg-rose-50">
              
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-grow space-y-8">
          {activeTab === 'orders' &&
          <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-slate-900">Order History</h2>
              
              {loading ?
            <div className="space-y-4">
                  {[1, 2].map((i) =>
              <div key={i} className="h-32 w-full animate-pulse rounded-3xl bg-white shadow-sm" />
              )}
                </div> :
            orders.length > 0 ?
            <div className="space-y-4">
                  {orders.map((order) =>
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-md">
                
                      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-50 p-6 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Order #{order.id.slice(-8)}</p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                        <div className={cn(
                    "rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest",
                    order.status === 'pending' ? "bg-amber-100 text-amber-600" :
                    order.status === 'shipped' ? "bg-blue-100 text-blue-600" :
                    "bg-green-100 text-green-600"
                  )}>
                          {order.status}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-4 overflow-hidden">
                            {order.items.slice(0, 3).map((item, i) =>
                      <img
                        key={i}
                        src={item.images[0]}
                        alt=""
                        className="inline-block h-12 w-10 rounded-lg border-2 border-white object-cover" />

                      )}
                            {order.items.length > 3 &&
                      <div className="flex h-12 w-10 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-xs font-bold text-slate-500">
                                +{order.items.length - 3}
                              </div>
                      }
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Total Amount</p>
                            <p className="text-lg font-bold text-brand-rose">৳{order.total.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
              )}
                </div> :

            <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl bg-white text-center shadow-sm">
                  <Package className="h-12 w-12 text-slate-100" />
                  <p className="text-slate-500">You haven't placed any orders yet.</p>
                  <button onClick={() => router.push('/shop')} className="text-sm font-bold text-brand-rose hover:underline">
                    Start Shopping
                  </button>
                </div>
            }
            </div>
          }
          {activeTab === 'profile' &&
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold text-slate-900">Profile Information</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm font-bold uppercase tracking-widest text-brand-rose hover:underline"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm">
                {!isEditing ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</p>
                        <p className="font-bold text-slate-900">{profile?.displayName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</p>
                        <p className="font-bold text-slate-900">{profile?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</p>
                        <p className="font-bold text-slate-900">{profile?.phone || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</p>
                        <p className="font-bold text-slate-900">
                          {profile?.district && profile?.area ? `${profile.area}, ${profile.district}` : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-50 pt-8 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Default Address</p>
                      <p className="font-bold text-slate-900 leading-relaxed">
                        {profile?.address || 'No address saved yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">District</label>
                        <input
                          type="text"
                          required
                          value={profileForm.district}
                          onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Area</label>
                        <input
                          type="text"
                          required
                          value={profileForm.area}
                          onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Address</label>
                      <textarea
                        required
                        rows={3}
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-brand-rose transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl bg-brand-rose py-4 font-bold text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          }

          {activeTab === 'reviews' &&
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-slate-900">My Reviews</h2>
              
              {userReviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {userReviews.map((review) => {
                    const product = MOCK_PRODUCTS.find(p => p.id === review.productId);
                    const isEditingThis = editingReview?.id === review.id;

                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl bg-white p-6 shadow-sm border border-slate-50"
                      >
                        <div className="flex flex-col gap-6 sm:flex-row">
                          <div className="h-24 w-20 flex-shrink-0 rounded-2xl bg-slate-50 overflow-hidden">
                            {product && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                          </div>
                          
                          <div className="flex-grow space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-slate-900">{product?.name || 'Unknown Product'}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={cn(
                                        "h-4 w-4",
                                        s <= (isEditingThis ? editingReview.rating : review.rating) 
                                          ? "fill-amber-400 text-amber-400" 
                                          : "text-slate-200"
                                      )}
                                      onClick={() => isEditingThis && setEditingReview({...editingReview, rating: s})}
                                      style={{ cursor: isEditingThis ? 'pointer' : 'default' }}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!isEditingThis ? (
                                  <>
                                    <button 
                                      onClick={() => setEditingReview(review)}
                                      className="p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-500 rounded-xl transition-all"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteReview(review.id)}
                                      className="p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-500 rounded-xl transition-all"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => setEditingReview(null)}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>

                            {isEditingThis ? (
                              <div className="space-y-4">
                                <textarea
                                  value={editingReview.comment}
                                  onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-brand-rose"
                                  rows={3}
                                />
                                <button
                                  onClick={() => handleUpdateReview(review.id, editingReview.rating, editingReview.comment)}
                                  className="rounded-xl bg-brand-rose px-6 py-2 text-sm font-bold text-white shadow-lg shadow-brand-rose/20"
                                >
                                  Save Changes
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-600 leading-relaxed italic">
                                "{review.comment}"
                              </p>
                            )}
                            
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-2">
                              Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl bg-white text-center shadow-sm border border-slate-100">
                  <MessageSquare className="h-12 w-12 text-slate-100" />
                  <p className="text-slate-500">You haven't written any reviews yet.</p>
                  <button onClick={() => router.push('/shop')} className="text-sm font-bold text-brand-rose hover:underline">
                    Find Products to Review
                  </button>
                </div>
              )}
            </div>
          }


        </div>
      </div>
    </div>);

}