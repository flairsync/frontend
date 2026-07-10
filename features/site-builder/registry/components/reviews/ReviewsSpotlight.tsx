import React from "react";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export interface ReviewsSpotlightProps {
    title?: string;
    limit?: number;
    reviews?: ReviewItem[];
    stats?: ReviewsStats | null;
}

const initials = (name?: string) =>
    (name || "?").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

const ReviewsSpotlight: React.FC<ReviewsSpotlightProps> = ({ title = "What Guests Say", limit = 8, reviews = [], stats }) => {
    const list = (Array.isArray(reviews) ? reviews : []).slice(0, limit);

    return (
        <section className="space-y-10">
            <div className="text-center space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
                {stats?.average != null && (
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-6xl font-extrabold tracking-tight">{stats.average}</span>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    className={i < Math.round(stats.average || 0) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/25"}
                                />
                            ))}
                        </div>
                        {stats.total ? (
                            <span className="text-sm text-muted-foreground">Based on {stats.total} reviews</span>
                        ) : null}
                    </div>
                )}
            </div>

            {list.length > 0 ? (
                <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-2 px-2 [scrollbar-width:thin]">
                    {list.map((r) => (
                        <div
                            key={r.id}
                            className="snap-start shrink-0 w-[280px] sm:w-[320px] rounded-[1.75rem] border border-border/50 bg-card shadow-sm p-6 space-y-4"
                        >
                            <Quote size={28} className="text-primary/30" />
                            {r.comment && (
                                <p className="text-sm leading-relaxed italic text-foreground/90 line-clamp-5">"{r.comment}"</p>
                            )}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                            {initials(r.user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-bold">{r.user?.name || "Guest"}</p>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/25"}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
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

export default ReviewsSpotlight;
