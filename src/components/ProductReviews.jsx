"use client";

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import mockReviews from '../data/reviews.json';





import { api } from '@/lib/api-client';

export default function ProductReviews({ productId }) {
  const { user, profile, loginWithGoogle } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await api.getReviews({ productId });
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !profile) {
      loginWithGoogle();
      return;
    }

    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.createReview({
        productId,
        userId: user.id || user.uid,
        userName: profile.name || profile.displayName || 'Anonymous',
        rating,
        comment: comment.trim()
      });

      if (response.success) {
        setComment('');
        setRating(5);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const response = await api.deleteReview(reviewId);
      if (response.success) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const averageRating = reviews.length > 0 ?
  reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length :
  0;

  return (
    <div className="space-y-12 border-t border-slate-100 pt-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-slate-900">Customer Reviews</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) =>
              <Star
                key={s}
                className={cn(
                  "h-5 w-5",
                  s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                )} />

              )}
            </div>
            <span className="text-sm font-bold text-slate-600">
              {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
            </span>
          </div>
        </div>

        {/* Review Form */}
        <div className="flex-grow max-w-xl">
          {user ?
          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-slate-50 p-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-widest text-slate-900">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) =>
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoveredRating(s)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110 active:scale-95">
                  
                      <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      s <= (hoveredRating || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    )} />
                  
                    </button>
                )}
                </div>
              </div>

              <div className="relative">
                <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                className="min-h-[120px] w-full rounded-2xl border-2 border-transparent bg-white p-4 text-sm outline-none transition-all focus:border-brand-rose"
                required />
              
                <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-rose text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 disabled:opacity-50">
                
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </form> :

          <div className="rounded-3xl bg-slate-50 p-8 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-600">Please login to leave a review.</p>
              <button
              onClick={loginWithGoogle}
              className="mt-4 text-sm font-bold text-brand-rose hover:underline">
              
                Login with Google
              </button>
            </div>
          }
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {reviews.length > 0 ?
          reviews.map((review) =>
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink text-brand-rose">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{review.userName}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) =>
                      <Star
                        key={s}
                        className={cn(
                          "h-3 w-3",
                          s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        )} />

                      )}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(user?.uid === review.userId || profile?.role === 'admin') &&
              <button
                onClick={() => handleDelete(review.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                
                      <Trash2 className="h-4 w-4" />
                    </button>
              }
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{review.comment}</p>
              </motion.div>
          ) :

          <div className="flex h-32 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
              <p className="text-sm">No reviews yet. Be the first to review!</p>
            </div>
          }
        </AnimatePresence>
      </div>
    </div>);

}

function Loader2({ className }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24">
      
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>);

}