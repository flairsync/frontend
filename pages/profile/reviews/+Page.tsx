import ProfileReviewCard from "@/components/profile/ProfileReviewCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMyReviews } from "@/features/discovery/useDiscovery"
import { deleteReviewApiCall } from "@/features/discovery/discovery.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import React from "react"

const MyReviewsPage = () => {
    const queryClient = useQueryClient()
    const { data: reviews = [], isLoading } = useMyReviews()

    const { mutate: deleteReview, isPending: deletingReview } = useMutation({
        mutationFn: async ({ businessId, reviewId }: { businessId: string; reviewId: string }) => {
            const res = await deleteReviewApiCall(businessId, reviewId)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my_reviews"] })
            toast.success("Review deleted.")
        },
        onError: () => {
            toast.error("Failed to delete review. Please try again.")
        },
    })

    const handleDelete = (review: any) => {
        deleteReview({ businessId: review.business.id, reviewId: review.id })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center p-4">
                        You haven't written any reviews yet.
                    </p>
                ) : (
                    reviews.map((review: any) => {
                        const subtitleParts = [review.business?.city, review.business?.address].filter(Boolean)
                        return (
                            <ProfileReviewCard
                                key={review.id}
                                id={review.id}
                                businessId={review.business?.id}
                                restaurantName={review.business?.name}
                                subtitle={subtitleParts.join(" · ")}
                                rating={review.rating}
                                review={review.comment ?? ""}
                                date={review.createdAt}
                                onDelete={() => handleDelete(review)}
                                deleteDisabled={deletingReview}
                            />
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}

export default MyReviewsPage
