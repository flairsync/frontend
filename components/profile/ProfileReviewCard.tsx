import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, StarHalf, StarOff, Pencil, Trash2 } from "lucide-react"
import React from "react"

interface ProfileReviewCardProps {
    id: string | number
    restaurantName: string
    href: string
    rating: number // from 0 to 5, can be float
    review: string
    onEdit?: (id: string | number) => void
    onDelete?: (id: string | number) => void
}

const ProfileReviewCard: React.FC<ProfileReviewCardProps> = ({
    id,
    restaurantName,
    href,
    rating,
    review,
    onEdit,
    onDelete,
}) => {
    // Render stars (supports halves)
    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => {
            const filled = i + 1 <= Math.floor(rating)
            const half = i + 0.5 === rating
            return filled ? (
                <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : half ? (
                <StarHalf key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
                <StarOff key={i} className="h-4 w-4 text-gray-300" />
            )
        })
    }

    return (
        <Card
            className="
        group relative rounded-xl p-4 transition-all ease-in-out duration-300
        hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20
        hover:cursor-pointer
      "
        >
            <CardContent className="p-0 flex flex-col gap-2">
                {/* Restaurant Link */}
                <a href={href}>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                        {restaurantName}
                    </h3>
                </a>

                {/* Rating */}
                <div className="flex items-center gap-1">{renderStars()}</div>

                {/* Review text */}
                <p className="text-sm text-muted-foreground">{review}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                    {onEdit && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(id)}
                            className="text-muted-foreground hover:text-primary"
                        >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(id)}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default ProfileReviewCard
