"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Star, UserRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ---- ⭐ Types ---- //
type Review = {
    id: number;
    name: string;
    avatar?: string;
    rating: number;
    comment: string;
};

// ---- 📦 Data ---- //
const REVIEWS: Review[] = [
    {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/100?img=1",
        rating: 4,
        comment: "Great coffee and really friendly staff! The atmosphere is perfect for working or catching up with friends.",
    },
    {
        id: 2,
        name: "Sarah Smith",
        avatar: "https://i.pravatar.cc/100?img=2",
        rating: 5,
        comment: "Loved the atmosphere, and the cappuccino was perfect. Will definitely come again!",
    },
    {
        id: 3,
        name: "Michael Lee",
        avatar: "https://i.pravatar.cc/100?img=3",
        rating: 5,
        comment: "The croissants were buttery and delicious, and service was quick and kind.",
    },
];

// ---- ⭐ Helper: Render stars ---- //
const RenderStars = ({ rating }: { rating: number }) => {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={14}
                    className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted/20"}`}
                />
            ))}
        </div>
    );
};

// ---- 💬 Component ---- //
const BusinessDetailsReviews: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        What Guests Say
                    </h2>
                    <p className="text-muted-foreground max-w-xl leading-relaxed">
                        Hear from our community about their experiences at Cafe Montserrat. Verified reviews from recent visits.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-primary font-black cursor-pointer group uppercase tracking-widest text-xs">
                    See All 128 Reviews
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* 💬 Review Cards Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {REVIEWS.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full"
                    >
                        <Card className="h-full bg-card border-border/50 rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group">
                            <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                                {/* Header */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {review.avatar ? (
                                            <img
                                                src={review.avatar}
                                                alt={review.name}
                                                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-primary/5"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                                <UserRound className="w-7 h-7 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                            <div className="bg-primary/10 rounded-full p-1 text-primary">
                                                <Star size={10} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-black text-foreground">{review.name}</p>
                                        <RenderStars rating={review.rating} />
                                    </div>
                                </div>

                                {/* Comment */}
                                <p className="text-muted-foreground leading-relaxed italic">
                                    "{review.comment}"
                                </p>

                                {/* Footer info */}
                                <div className="pt-4 border-t border-border/30">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">2 days ago</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default BusinessDetailsReviews;

