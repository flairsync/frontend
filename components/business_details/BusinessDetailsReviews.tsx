"use client";
import React, { useState } from "react";
import { useReviews, useReviewStats, useMyReview, useCreateReview, useUpdateReview, useDeleteReview } from "@/features/discovery/useDiscovery";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, UserRound, Loader2, Pencil, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatInTimezone } from "@/lib/dateUtils";
import { ConfirmAction } from "@/components/shared/ConfirmAction";

// ---- Stars ---- //
function RenderStars({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"}
                />
            ))}
        </div>
    );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                >
                    <Star
                        size={28}
                        className={(hovered || value) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}
                    />
                </button>
            ))}
        </div>
    );
}

// ---- Review Form Dialog ---- //
interface ReviewFormDialogProps {
    businessId: string;
    existingReview: { id: string; rating: number; comment?: string } | null;
    open: boolean;
    onClose: () => void;
    onReviewSaved?: () => void;
}

function ReviewFormDialog({ businessId, existingReview, open, onClose, onReviewSaved }: ReviewFormDialogProps) {
    const [rating, setRating] = useState(existingReview?.rating ?? 0);
    const [comment, setComment] = useState(existingReview?.comment ?? "");
    const createReview = useCreateReview(businessId);
    const updateReview = useUpdateReview(businessId);

    const isEditing = !!existingReview;
    const isPending = createReview.isPending || updateReview.isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) {
            toast.error("Please select a star rating.");
            return;
        }
        try {
            if (isEditing) {
                await updateReview.mutateAsync({ reviewId: existingReview.id, payload: { rating, comment: comment || undefined } });
                toast.success("Review updated!");
            } else {
                await createReview.mutateAsync({ rating, comment: comment || undefined });
                toast.success("Review submitted!");
            }
            onReviewSaved?.();
            onClose();
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 403) {
                toast.error("You can only review businesses you've visited.");
            } else if (status === 409) {
                toast.error("You already have a review. Editing it instead.");
            } else {
                toast.error("Failed to submit review. Please try again.");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="rounded-3xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Your Review" : "Write a Review"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">Rating</p>
                        <StarPicker value={rating} onChange={setRating} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">Comment <span className="text-muted-foreground font-normal">(optional)</span></p>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="rounded-2xl resize-none min-h-[100px]"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !rating} className="flex-1 rounded-xl">
                            {isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
                            {isEditing ? "Update" : "Submit"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---- Stats Widget ---- //
function ReviewStats({ stats }: { stats: { average: number | null; total: number; distribution: Record<string, number> } }) {
    if (stats.average === null) {
        return (
            <div className="text-center py-6 text-muted-foreground text-sm">No reviews yet</div>
        );
    }

    const maxCount = Math.max(...Object.values(stats.distribution));

    return (
        <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-muted/30 rounded-3xl">
            {/* Average score */}
            <div className="text-center shrink-0">
                <p className="text-5xl font-black">{stats.average.toFixed(1)}</p>
                <RenderStars rating={Math.round(stats.average)} size={18} />
                <p className="text-xs text-muted-foreground mt-1">{stats.total} {stats.total === 1 ? "review" : "reviews"}</p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 w-full space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.distribution[String(star)] ?? 0;
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-4 text-right">{star}</span>
                            <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, delay: (5 - star) * 0.06 }}
                                    className="h-full bg-yellow-400 rounded-full"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground w-6">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ---- Main Component ---- //
interface ProfileStats {
    average: number | null;
    total: number;
    distribution: Record<string, number>;
}

interface BusinessDetailsReviewsProps {
    businessId: string;
    businessName?: string;
    initialStats?: ProfileStats;
}

const BusinessDetailsReviews: React.FC<BusinessDetailsReviewsProps> = ({ businessId, businessName, initialStats }) => {
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

    const [page, setPage] = useState(1);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    // Only fetch live stats after a review action — use profile data for initial render
    const [needsStatsRefresh, setNeedsStatsRefresh] = useState(false);

    const { data: reviewsResult, isLoading: isLoadingReviews } = useReviews(businessId, { page, limit: 6 });
    const { data: liveStats } = useReviewStats(needsStatsRefresh ? businessId : undefined);
    const { data: myReview, isLoading: isLoadingMyReview } = useMyReview(businessId, isLoggedIn);
    const deleteReview = useDeleteReview(businessId);

    const stats = liveStats ?? (initialStats ? {
        average: initialStats.average,
        total: initialStats.total,
        distribution: initialStats.distribution,
    } : null);

    const reviews = reviewsResult?.data ?? [];
    const totalPages = reviewsResult?.totalPages ?? 1;

    const handleDelete = async () => {
        if (!myReview) return;
        try {
            await deleteReview.mutateAsync(myReview.id);
            toast.success("Review deleted.");
            setNeedsStatsRefresh(true);
        } catch {
            toast.error("Failed to delete review.");
        }
    };

    return (
        <section className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">What Guests Say</h2>
                    <p className="text-muted-foreground max-w-xl leading-relaxed">
                        Hear from our community about their experiences{businessName ? ` at ${businessName}` : ""}. Verified reviews from recent visits.
                    </p>
                </div>

                {/* Review CTA */}
                {isLoggedIn && !isLoadingMyReview && (
                    <div className="shrink-0">
                        {myReview ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl gap-2 font-bold"
                                    onClick={() => setReviewDialogOpen(true)}
                                >
                                    <Pencil size={14} />
                                    Edit Your Review
                                </Button>
                                <ConfirmAction
                                    onConfirm={handleDelete}
                                    title="Delete Review?"
                                    description="This will permanently remove your review."
                                    confirmText="Delete"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                                        disabled={deleteReview.isPending}
                                    >
                                        {deleteReview.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </Button>
                                </ConfirmAction>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                className="rounded-xl gap-2 font-bold"
                                onClick={() => setReviewDialogOpen(true)}
                            >
                                <PlusCircle size={14} />
                                Write a Review
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            {stats ? (
                <ReviewStats stats={stats} />
            ) : null}

            {/* Your existing review preview */}
            {myReview && (
                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">Your Review</p>
                        <RenderStars rating={myReview.rating} />
                    </div>
                    {myReview.comment && <p className="text-sm text-muted-foreground italic">"{myReview.comment}"</p>}
                </div>
            )}

            {/* Review list */}
            {isLoadingReviews ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    {stats?.average === null ? "Be the first to leave a review!" : "No reviews to show."}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reviews.map((review: any, index: number) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.07, duration: 0.4 }}
                            className="h-full"
                        >
                            <Card className="h-full bg-card border-border/50 rounded-[2.5rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                <CardContent className="p-8 flex flex-col justify-between h-full space-y-5">
                                    {/* Header */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                                <UserRound className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-md">
                                                <div className="bg-primary/10 rounded-full p-1 text-primary">
                                                    <Star size={10} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="font-black text-foreground text-sm">
                                                {review.user?.firstName} {review.user?.lastName}
                                            </p>
                                            <RenderStars rating={review.rating} />
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-muted-foreground leading-relaxed italic text-sm flex-1">
                                            "{review.comment}"
                                        </p>
                                    )}

                                    {/* Date */}
                                    <div className="pt-4 border-t border-border/30">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                            {formatInTimezone(review.createdAt, 'MMM D, YYYY')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl h-9 w-9"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm font-semibold">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl h-9 w-9"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            {/* Review form dialog */}
            <ReviewFormDialog
                businessId={businessId}
                existingReview={myReview ?? null}
                open={reviewDialogOpen}
                onClose={() => setReviewDialogOpen(false)}
                onReviewSaved={() => setNeedsStatsRefresh(true)}
            />
        </section>
    );
};

export default BusinessDetailsReviews;
