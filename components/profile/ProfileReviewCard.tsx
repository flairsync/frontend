import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, StarHalf, StarOff, Pencil, Trash2 } from "lucide-react"
import { navigate } from "vike/client/router"
import React, { useState } from "react"

interface ProfileReviewCardProps {
    id: string | number
    businessId: string
    restaurantName: string
    subtitle?: string
    rating: number
    review: string
    date?: string
    onEdit?: (id: string | number) => void
    onDelete?: (id: string | number) => void
}

const TRUNCATE_AT = 150

const ProfileReviewCard: React.FC<ProfileReviewCardProps> = ({
    id,
    businessId,
    restaurantName,
    subtitle,
    rating,
    review,
    date,
    onEdit,
    onDelete,
}) => {
    const [expanded, setExpanded] = useState(false)
    const isLong = review.length > TRUNCATE_AT
    const displayText = expanded || !isLong ? review : review.slice(0, TRUNCATE_AT) + "…"

    const renderStars = () =>
        Array.from({ length: 5 }, (_, i) => {
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

    const formattedDate = date
        ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
        : null

    return (
        <Card
            onClick={() => navigate(`/businesses/${businessId}`)}
            className="group relative rounded-xl p-4 transition-all ease-in-out duration-300
                hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20 hover:cursor-pointer"
        >
            <CardContent className="p-0 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <a
                            href={`/businesses/${businessId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium group-hover:text-primary transition-colors"
                        >
                            {restaurantName}
                        </a>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {formattedDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {formattedDate}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">{renderStars()}</div>

                <p className="text-sm text-muted-foreground">
                    {displayText}
                    {isLong && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                            className="ml-1 text-primary text-sm hover:underline"
                        >
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </p>

                {(onEdit || onDelete) && (
                    <div className="flex gap-2 mt-1">
                        {onEdit && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); onEdit(id) }}
                                className="text-muted-foreground hover:text-primary"
                            >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); onDelete(id) }}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ProfileReviewCard
