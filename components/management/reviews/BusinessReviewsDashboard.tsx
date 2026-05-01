"use client";
import React, { useState } from "react";
import { useStaffReviews, useStaffReviewStats, useDeleteStaffReview } from "@/features/business/reviews/useBusinessReviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, UserRound, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { formatInTimezone } from "@/lib/dateUtils";

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

interface StatsWidgetProps {
    stats: { average: number | null; total: number; distribution: Record<string, number> };
}

function StatsWidget({ stats }: StatsWidgetProps) {
    if (stats.average === null) {
        return (
            <Card className="rounded-3xl">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">No reviews yet</CardContent>
            </Card>
        );
    }
    const maxCount = Math.max(...Object.values(stats.distribution));
    return (
        <Card className="rounded-3xl">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-8">
                <div className="text-center shrink-0">
                    <p className="text-5xl font-black">{stats.average.toFixed(1)}</p>
                    <RenderStars rating={Math.round(stats.average)} size={18} />
                    <p className="text-xs text-muted-foreground mt-1">{stats.total} {stats.total === 1 ? "review" : "reviews"}</p>
                </div>
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
            </CardContent>
        </Card>
    );
}

interface BusinessReviewsDashboardProps {
    businessId: string;
}

const BusinessReviewsDashboard: React.FC<BusinessReviewsDashboardProps> = ({ businessId }) => {
    const [page, setPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState<string>("all");

    const params = {
        page,
        limit: 15,
        rating: ratingFilter !== "all" ? parseInt(ratingFilter) : undefined,
    };

    const { data: reviewsResult, isLoading } = useStaffReviews(businessId, params);
    const { data: stats, isLoading: isLoadingStats } = useStaffReviewStats(businessId);
    const deleteReview = useDeleteStaffReview(businessId);

    const reviews = reviewsResult?.data ?? [];
    const totalPages = reviewsResult?.totalPages ?? 1;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
                    <p className="text-sm text-muted-foreground">Monitor and moderate customer reviews</p>
                </div>
            </div>

            {/* Stats */}
            {isLoadingStats ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>
            ) : stats ? (
                <StatsWidget stats={stats} />
            ) : null}

            {/* Filters */}
            <div className="flex items-center gap-3">
                <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[160px] rounded-xl">
                        <SelectValue placeholder="All ratings" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All ratings</SelectItem>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={String(r)}>
                                {r} star{r !== 1 ? "s" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Review list */}
            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No reviews found.</div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review: any) => (
                        <Card key={review.id} className="rounded-2xl border-border/50">
                            <CardContent className="p-5 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <UserRound size={18} className="text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="font-bold text-sm">
                                                {review.user?.firstName} {review.user?.lastName}
                                            </p>
                                            <RenderStars rating={review.rating} />
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatInTimezone(review.createdAt, 'MMM D, YYYY')}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ConfirmAction
                                    onConfirm={() => deleteReview.mutate(review.id)}
                                    title="Remove Review?"
                                    description="This will permanently remove this review. Use only for abusive or fake content."
                                    confirmText="Remove"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 rounded-xl"
                                        disabled={deleteReview.isPending}
                                    >
                                        {deleteReview.isPending ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                    </Button>
                                </ConfirmAction>
                            </CardContent>
                        </Card>
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
                    <span className="text-sm font-semibold">{page} / {totalPages}</span>
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
        </div>
    );
};

export default BusinessReviewsDashboard;
