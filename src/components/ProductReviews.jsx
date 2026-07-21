"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Trash2, Send, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * The backend authenticates via an HTTP-only cookie named "token".
 * HTTP-only cookies cannot be read by JavaScript, so we never try to
 * extract the token manually. Instead, we pass `credentials: 'include'`
 * on every request so the browser automatically attaches the cookie.
 */
const JSON_HEADERS = { "Content-Type": "application/json" };

/** Normalizes a raw review from the API into the shape used by the UI. */
function normalizeReview(raw) {
  return {
    id: raw._id,
    productId: raw.product,
    userId: raw.user?._id || raw.user?.id || raw.user,
    userName: raw.user?.name || "Anonymous",
    avatar: raw.user?.avatar || null,
    rating: raw.rating,
    comment: raw.comment,
    createdAt: raw.createdAt,
  };
}

/** Calculates the average rating from a list of reviews. */
function calcAverageRating(reviews) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

// ─── Sub-component: StarRow ───────────────────────────────────────────────────
function StarRow({ rating, size = "sm", hovered = 0, onHover, onClick }) {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-6 w-6";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const isFilled = s <= (hovered || rating);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onClick?.(s)}
            onMouseEnter={() => onHover?.(s)}
            onMouseLeave={() => onHover?.(0)}
            className={cn(
              "transition-transform",
              onClick ? "hover:scale-110 active:scale-95" : "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClass,
                "transition-colors",
                isFilled ? "fill-amber-400 text-amber-400" : "text-slate-200"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-component: ReviewSummaryHeader ──────────────────────────────────────
function ReviewSummaryHeader({ reviews }) {
  const avg = calcAverageRating(reviews);
  return (
    <div className="space-y-2">
      <h3 className="text-2xl font-serif font-bold text-slate-900">
        Customer Reviews
      </h3>
      <div className="flex items-center gap-4">
        <StarRow rating={Math.round(avg)} />
        <span className="text-sm font-bold text-slate-600">
          {avg.toFixed(1)} out of 5 ({reviews.length}{" "}
          {reviews.length === 1 ? "review" : "reviews"})
        </span>
      </div>
    </div>
  );
}

// ─── Sub-component: ReviewCard ────────────────────────────────────────────────
function ReviewCard({ review, currentUser, isAdmin, onDelete }) {
  const canDelete =
    isAdmin || currentUser?.uid === review.userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        {/* Avatar + Name + Stars + Date */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-pink text-brand-rose">
            {review.avatar ? (
              <img
                src={review.avatar}
                alt={review.userName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{review.userName}</h4>
            <div className="flex items-center gap-2">
              <StarRow rating={review.rating} size="sm" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Delete button (only for owner or admin) */}
        {canDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="p-2 text-slate-300 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
            aria-label="Delete review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {review.comment}
      </p>
    </motion.div>
  );
}

// ─── Sub-component: LoginPrompt ───────────────────────────────────────────────
function LoginPrompt({ onLogin }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-8 text-center">
      <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-2 text-sm text-slate-600">
        Please login to leave a review.
      </p>
      <button
        onClick={onLogin}
        className="mt-4 text-sm font-bold text-brand-rose hover:underline"
      >
        Login to Review
      </button>
    </div>
  );
}

// ─── Sub-component: ReviewForm ────────────────────────────────────────────────
function ReviewForm({ onSubmit, isSubmitting, submitError }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({ rating, comment: comment.trim() }, () => setComment(""));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-slate-50 p-6">
      {/* Rating Picker */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold uppercase tracking-widest text-slate-900">
          Your Rating:
        </span>
        <StarRow
          rating={rating}
          hovered={hoveredRating}
          size="lg"
          onHover={setHoveredRating}
          onClick={setRating}
        />
      </div>

      {/* Comment Textarea */}
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          required
          className="min-h-[120px] w-full rounded-2xl border-2 border-transparent bg-white p-4 pr-16 text-sm outline-none transition-all focus:border-brand-rose"
        />
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-rose text-white shadow-lg shadow-brand-rose/20 transition-all hover:bg-rose-500 disabled:opacity-50"
          aria-label="Submit review"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Inline error message */}
      {submitError && (
        <p className="text-xs font-semibold text-rose-500">{submitError}</p>
      )}
    </form>
  );
}

// ─── Sub-component: ReviewsEmptyState ────────────────────────────────────────
function ReviewsEmptyState() {
  return (
    <div className="flex h-32 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
      <p className="text-sm">No reviews yet. Be the first to review!</p>
    </div>
  );
}

// ─── Sub-component: ReviewsLoadingSkeleton ────────────────────────────────────
function ReviewsLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-3xl border border-slate-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-32 rounded-full bg-slate-200" />
              <div className="h-3 w-24 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-200" />
            <div className="h-3 w-4/5 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductReviews({ productId }) {
  const { user, profile, loginWithGoogle } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isAdmin = profile?.role === "admin";

  // ── Fetch reviews from API ───────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/product/${productId}`);
      const data = await res.json();
      if (data.success && data.reviews) {
        setReviews(data.reviews.map(normalizeReview));
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsFetching(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Submit a new review ──────────────────────────────────────────────────
  const handleSubmit = async ({ rating, comment }, onSuccess) => {
    if (!user || !profile) {
      loginWithGoogle();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_URL}/api/reviews/${productId}`, {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess?.();
        await fetchReviews();
      } else {
        setSubmitError(data.message || "Failed to add review. Please try again.");
      }
    } catch (err) {
      console.error("Error adding review:", err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete a review ──────────────────────────────────────────────────────
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        await fetchReviews();
      } else {
        alert(data.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12 border-t border-slate-100 pt-12">
      {/* Top row: Summary + Form */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <ReviewSummaryHeader reviews={reviews} />

        <div className="flex-grow max-w-xl">
          {user ? (
            <ReviewForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          ) : (
            <LoginPrompt onLogin={loginWithGoogle} />
          )}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {isFetching ? (
          <ReviewsLoadingSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUser={user}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <ReviewsEmptyState />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}