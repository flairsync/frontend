"use client";
import React, { useState } from "react";
import { useBusinessFeedback } from "@/features/business/feedback/useBusinessFeedback";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatInTimezone } from "@/lib/dateUtils";

const IMPROVEMENT_TAG_LABELS: Record<string, string> = {
    FOOD_TEMPERATURE: "Food temperature",
    ORDER_ACCURACY: "Order accuracy",
    WAIT_TIME: "Wait time",
    STAFF_FRIENDLINESS: "Staff friendliness",
    CLEANLINESS: "Cleanliness",
    NOISE_LEVEL: "Noise level",
    PRICE: "Price",
    PORTION_SIZE: "Portion size",
};

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

function SubRating({ label, value }: { label: string; value: number | null | undefined }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{label}</span>
            <RenderStars rating={value} size={11} />
        </div>
    );
}

function NpsBadge({ score }: { score: number | null | undefined }) {
    if (score === null || score === undefined) return null;
    const variant = score >= 9 ? "default" : score >= 7 ? "secondary" : "destructive";
    return (
        <Badge variant={variant as any} className="font-normal">
            NPS {score}/10
        </Badge>
    );
}

interface BusinessFeedbackDashboardProps {
    businessId: string;
}

const BusinessFeedbackDashboard: React.FC<BusinessFeedbackDashboardProps> = ({ businessId }) => {
    const [page, setPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState<string>("all");

    const params = {
        page,
        limit: 15,
        minRating: ratingFilter !== "all" ? parseInt(ratingFilter) : undefined,
    };

    const { data: feedbackResult, isLoading } = useBusinessFeedback(businessId, params);
    const feedback = feedbackResult?.data ?? [];
    const totalPages = feedbackResult?.totalPages ?? 1;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
                    <p className="text-sm text-muted-foreground">Post-meal feedback submitted by your guests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                        <SelectValue placeholder="All ratings" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All ratings</SelectItem>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={String(r)}>
                                {r}+ stars
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Feedback list */}
            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
            ) : feedback.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No feedback found.</div>
            ) : (
                <div className="space-y-3">
                    {feedback.map((entry: any) => (
                        <Card key={entry.id} className="rounded-xl border-border/50">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <RenderStars rating={entry.overallRating} size={16} />
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatInTimezone(entry.submittedAt, 'MMM D, YYYY')}
                                        </span>
                                    </div>
                                    <NpsBadge score={entry.npsScore} />
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    <SubRating label="Food" value={entry.foodRating} />
                                    <SubRating label="Service" value={entry.serviceRating} />
                                    <SubRating label="Ambiance" value={entry.ambianceRating} />
                                    <SubRating label="Value" value={entry.valueRating} />
                                </div>

                                {entry.comment && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {entry.comment}
                                    </p>
                                )}

                                {entry.improvementTags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {entry.improvementTags.map((tag: string) => (
                                            <Badge key={tag} variant="outline" className="font-normal text-xs">
                                                {IMPROVEMENT_TAG_LABELS[tag] ?? tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
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

export default BusinessFeedbackDashboard;
