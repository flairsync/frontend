import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export interface ReviewItem {
    id: string;
    rating: number;
    comment?: string;
    user?: { name?: string };
}

export interface ReviewsStats {
    average?: number | null;
    total?: number;
}

export interface ReviewsGridProps {
    title?: string;
    limit?: number;
    reviews?: ReviewItem[];
    stats?: ReviewsStats | null;
}

const initials = (name?: string) =>
    (name || "?").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

const ReviewsGrid: React.FC<ReviewsGridProps> = ({ title = "What Guests Say", limit = 6, reviews = [], stats }) => {
    const list = (Array.isArray(reviews) ? reviews : []).slice(0, limit);

    return (
        <section className="space-y-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
                {stats?.average != null && (
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={i < Math.round(stats.average || 0) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/25"}
                                />
                            ))}
                        </div>
                        <span className="font-bold text-foreground">{stats.average}</span>
                        {stats.total ? <span className="text-muted-foreground">({stats.total} reviews)</span> : null}
                    </div>
                )}
            </div>

            {list.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((r) => (
                        <Card key={r.id} className="rounded-2xl border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/25"}
                                        />
                                    ))}
                                </div>
                                {r.comment && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{r.comment}</p>}
                                <div className="flex items-center gap-2.5 pt-1">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                            {initials(r.user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs font-bold">{r.user?.name || "Guest"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-[2rem]">
                    No reviews yet.
                </div>
            )}
        </section>
    );
};

export default ReviewsGrid;
