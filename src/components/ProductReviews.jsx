"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  MessageSquare,
  Trash2,
  Send,
  User,
  Loader2,
  ThumbsUp,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const JSON_HEADERS = { "Content-Type": "application/json" };

/** Normalizes a raw review from the API into the shape used by the UI. */
function normalizeReview(raw) {
  return {
    id: raw._id,
    productId: raw.product,
    userId: raw.user?._id || raw.user?.id || raw.user,
    userName: raw.user?.name || "Verified Customer",
    avatar: raw.user?.avatar || null,
    rating: raw.rating || 5,
    comment: raw.comment || "",
    createdAt: raw.createdAt,
  };
}

/** Calculates the average rating from a list of reviews. */
function calcAverageRating(reviews) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return sum / reviews.length;
}

/** Calculates counts for each star level. */
function getRatingDistribution(reviews) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    dist[star] = (dist[star] || 0) + 1;
  });
  return dist;
}

// ─── Sub-component: StarRow ───────────────────────────────────────────────────
function StarRow({ rating, size = "sm", hovered = 0, onHover, onClick, readOnly = false }) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const isFilled = s <= (hovered || rating);
        return (
          <button
            key={s}
            type="button"
            disabled={readOnly}
            onClick={() => onClick?.(s)}
            onMouseEnter={() => onHover?.(s)}
            onMouseLeave={() => onHover?.(0)}
            className={cn(
              "transition-transform focus:outline-none",
              !readOnly && onClick ? "hover:scale-125 active:scale-95 cursor-pointer" : "cursor-default"
            )}
            aria-label={`Rate ${s} stars`}
          >
            <Star
              className={cn(
                sizeClass,
                "transition-colors duration-200",
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)]"
                  : "fill-slate-100 text-slate-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-component: Rating Breakdown Card ─────────────────────────────────────
function RatingBreakdown({ reviews, activeFilter, onFilterChange }) {
  const avg = calcAverageRating(reviews);
  const total = reviews.length;
  const dist = getRatingDistribution(reviews);
  const fiveAndFourStarCount = (dist[5] || 0) + (dist[4] || 0);
  const recommendedPercent = total > 0 ? Math.round((fiveAndFourStarCount / total) * 100) : 100;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-rose-50/20 to-pink-50/30 p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-6 text-center md:col-span-5 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <span className="text-5xl md:text-6xl font-serif font-extrabold text-slate-900 tracking-tight">
            {avg.toFixed(1)}
          </span>
          <div className="mt-2">
            <StarRow rating={Math.round(avg)} size="lg" readOnly />
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Based on {total} {total === 1 ? "review" : "reviews"}
          </p>
          {total > 0 && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {recommendedPercent}% of buyers recommend this product
            </span>
          )}
        </div>

        {/* Rating Progress Bars */}
        <div className="space-y-2 md:col-span-7 md:pl-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = dist[star] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const isSelected = activeFilter === String(star);

            return (
              <button
                key={star}
                type="button"
                onClick={() => onFilterChange(isSelected ? "all" : String(star))}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 transition-all text-left text-xs font-bold",
                  isSelected ? "bg-brand-pink/70 text-brand-rose" : "hover:bg-slate-100/60 text-slate-700"
                )}
              >
                <span className="w-12 font-semibold text-slate-600 group-hover:text-slate-900">
                  {star} Stars
                </span>
                <div className="h-2.5 flex-grow overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500 group-hover:bg-amber-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
          <Filter className="h-3.5 w-3.5" /> Filter:
        </span>
        <button
          onClick={() => onFilterChange("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            activeFilter === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          All Reviews ({total})
        </button>
        {[5, 4, 3, 2, 1].map((s) => {
          const c = dist[s] || 0;
          if (c === 0 && activeFilter !== String(s)) return null;
          return (
            <button
              key={s}
              onClick={() => onFilterChange(String(s))}
              className={cn(
                "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                activeFilter === String(s)
                  ? "bg-brand-rose text-white shadow-sm shadow-brand-rose/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <span>{s}★</span>
              <span className="opacity-70">({c})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-component: ReviewCard ────────────────────────────────────────────────
function ReviewCard({ review, currentUser, isAdmin, onDelete }) {
  const canDelete = isAdmin || currentUser?.uid === review.userId;
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLikeToggle = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-rose/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        {/* User Info & Rating */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-rose/20 bg-brand-pink text-brand-rose shadow-sm">
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
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base">{review.userName}</h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Verified Buyer
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2.5">
              <StarRow rating={review.rating} size="sm" readOnly />
              <span className="text-[11px] font-medium text-slate-400">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }) : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Delete button (owner / admin) */}
        {canDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="rounded-full p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600"
            title="Delete review"
            aria-label="Delete review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Comment */}
      <p className="mt-4 text-sm leading-relaxed text-slate-700 font-normal">
        {review.comment}
      </p>

      {/* Helpful button footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
        <span>Was this review helpful?</span>
        <button
          type="button"
          onClick={handleLikeToggle}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200",
            hasLiked
              ? "bg-brand-pink text-brand-rose font-bold shadow-sm"
              : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          )}
        >
          <ThumbsUp className={cn("h-3.5 w-3.5", hasLiked && "fill-current")} />
          <span>{hasLiked ? "Helpful (1)" : "Helpful"}</span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Sub-component: LoginPrompt ───────────────────────────────────────────────
function LoginPrompt({ onLogin }) {
  return (
    <div className="rounded-3xl border border-dashed border-rose-200/80 bg-rose-50/40 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-brand-rose">
        <MessageSquare className="h-6 w-6" />
      </div>
      <h4 className="mt-3 font-serif font-bold text-slate-900">Have you purchased this product?</h4>
      <p className="mt-1 text-xs text-slate-600 font-medium">
        Please sign in to leave a verified rating and review.
      </p>
      <button
        onClick={onLogin}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-rose px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-brand-rose/25 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95"
      >
        <Sparkles className="h-4 w-4" /> Sign In to Leave Review
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-rose" /> Write a Review
        </h4>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Rating:</span>
          <StarRow
            rating={rating}
            hovered={hoveredRating}
            size="md"
            onHover={setHoveredRating}
            onClick={setRating}
          />
        </div>
      </div>

      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about your experience with quality, fit, color, and delivery..."
          rows={3}
          required
          maxLength={1000}
          className="min-h-[110px] w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-medium outline-none transition-all focus:border-brand-rose focus:bg-white focus:ring-4 focus:ring-brand-rose/10"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">
            {comment.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center gap-2 rounded-full bg-brand-rose px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-rose/25 transition-all hover:bg-rose-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Review
              </>
            )}
          </button>
        </div>
      </div>

      {submitError && (
        <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
          {submitError}
        </p>
      )}
    </form>
  );
}

// ─── Sub-component: ReviewsEmptyState ────────────────────────────────────────
function ReviewsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200/80 bg-slate-50/40 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-100/60 text-brand-rose mb-3">
        <MessageSquare className="h-7 w-7" />
      </div>
      <h4 className="font-serif font-bold text-slate-800 text-lg">No reviews yet</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        Be the first customer to share your experience and leave a review for this product!
      </p>
    </div>
  );
}

// ─── Sub-component: ReviewsLoadingSkeleton ────────────────────────────────────
function ReviewsLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-3xl border border-slate-200/60 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-200" />
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
  const [activeFilter, setActiveFilter] = useState("all");

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

  // ── Filtered Reviews ──────────────────────────────────────────────────────
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "all") return true;
    return String(Math.round(r.rating || 5)) === activeFilter;
  });

  return (
    <div id="customer-reviews" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
            Customer Reviews
            <span className="rounded-full bg-brand-pink px-3 py-0.5 text-xs font-bold text-brand-rose border border-brand-rose/20 font-sans">
              {reviews.length}
            </span>
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Real feedback from verified GlossyEve customers
          </p>
        </div>
      </div>

      {/* Rating Breakdown & Stats */}
      <RatingBreakdown
        reviews={reviews}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Review Form or Login Prompt */}
      <div>
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

      {/* Reviews List */}
      <div className="space-y-4">
        {isFetching ? (
          <ReviewsLoadingSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
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