import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export interface ReviewsProps {
    title?: string;
    limit?: number;
    reviews?: ReviewItem[];
    stats?: ReviewsStats | null;
}

const Reviews: React.FC<ReviewsProps> = ({ title = "What Guests Say", limit = 6, reviews = [], stats }) => {
    const list = (Array.isArray(reviews) ? reviews : []).slice(0, limit);

    return (
        <section className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                {stats?.average != null && (
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-foreground">{stats.average}</span>
                        {stats.total ? <span>({stats.total} reviews)</span> : null}
                    </div>
                )}
            </div>

            {list.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((r) => (
                        <Card key={r.id} className="rounded-2xl border-border/50">
                            <CardContent className="p-5 space-y-2">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}
                                        />
                                    ))}
                                </div>
                                {r.comment && <p className="text-sm text-muted-foreground line-clamp-4">{r.comment}</p>}
                                {r.user?.name && <p className="text-xs font-semibold">{r.user.name}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-[2rem]">
                    No reviews yet.
                </div>
            )}
        </section>
    );
};

export default Reviews;
