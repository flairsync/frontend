import ProfileReviewCard from "@/components/profile/ProfileReviewCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React, { useState } from "react"

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState([
        { id: 1, restaurantName: "Restaurant 1", rating: 4.5, review: "Amazing food, friendly staff!" },
        { id: 2, restaurantName: "Restaurant 2", rating: 5, review: "Best dining experience I've had in years." },
    ])

    const handleDelete = (id: number | string) => {
        setReviews((prev) => prev.filter((r) => r.id !== id))
    }

    const handleEdit = (id: number | string) => {
        console.log("Edit review:", id)
        // Could open modal or navigate to edit page
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {reviews.map((review) => (
                    <ProfileReviewCard
                        key={review.id}
                        id={review.id}
                        restaurantName={review.restaurantName}
                        href={`/business/${review.id}`}
                        rating={review.rating}
                        review={review.review}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </CardContent>
        </Card>
    )
}

export default MyReviewsPage
