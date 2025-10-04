"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, UserRound } from "lucide-react";
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
        comment: "Great coffee and really friendly staff!",
    },
    {
        id: 2,
        name: "Sarah Smith",
        avatar: "https://i.pravatar.cc/100?img=2",
        rating: 5,
        comment:
            "Loved the atmosphere, and the cappuccino was perfect. Will definitely come again!",
    },
    {
        id: 3,
        name: "Michael Lee",
        avatar: "https://i.pravatar.cc/100?img=3",
        rating: 5,
        comment:
            "The croissants were buttery and delicious, and service was quick and kind.",
    },
    {
        id: 4,
        name: "Emma Brown",
        avatar: "https://i.pravatar.cc/100?img=4",
        rating: 4,
        comment:
            "Nice place to relax with friends. The iced coffee was refreshing!",
    },
];

// ---- ⭐ Helper: Render stars ---- //
const renderStars = (rating: number) => {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                        }`}
                />
            ))}
        </div>
    );
};

// ---- 💬 Component ---- //
const BusinessDetailsReviews: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-600" />
                {t("business_page.reviews.section_title", "Customer Reviews")}
            </h2>

            {/* 💬 Review Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {REVIEWS.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="h-full hover:cursor-pointer"
                    >
                        <Card className="h-full flex flex-col hover:shadow-md transition-shadow border border-gray-100">
                            <CardContent className="p-6 flex flex-col justify-between h-full">
                                {/* User Info */}
                                <div className="flex items-center gap-3 mb-3">
                                    {review.avatar ? (
                                        <img
                                            src={review.avatar}
                                            alt={review.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <UserRound className="w-6 h-6 text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-800">{review.name}</p>
                                        {renderStars(review.rating)}
                                    </div>
                                </div>

                                {/* Review Comment */}
                                <p className="text-gray-700 leading-relaxed flex-1">
                                    {review.comment}
                                </p>

                                {/* Footer spacing for consistent height */}
                                <div className="mt-4"></div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default BusinessDetailsReviews;
