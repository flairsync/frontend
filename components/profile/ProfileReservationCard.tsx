import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import React from "react"

interface ProfileReservationCardProps {
    id: string | number
    restaurantName: string
    href: string
    datetime: string | Date
    onCancel?: (id: string | number) => void
}

const ProfileReservationCard: React.FC<ProfileReservationCardProps> = ({
    id,
    restaurantName,
    href,
    datetime,
    onCancel,
}) => {
    const formattedDate = new Date(datetime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <Card
            className="
        group relative rounded-xl p-4 transition-all ease-in-out duration-300
        hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20
        flex justify-between items-center
        hover:cursor-pointer
      "
        >
            <a href={href} className="flex flex-col flex-1">
                <h3 className="font-medium group-hover:text-primary transition-colors">
                    {restaurantName}
                </h3>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </a>

            {onCancel && (
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onCancel(id)}
                >
                    Cancel
                </Button>
            )}
        </Card>
    )
}

export default ProfileReservationCard
