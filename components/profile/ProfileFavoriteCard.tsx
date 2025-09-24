import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import React from "react"

interface ProfileFavoriteCardProps {
    id: string | number
    image: string
    name: string
    description: string
    href: string
    onRemove?: (id: string | number) => void
}

const ProfileFavoriteCard: React.FC<ProfileFavoriteCardProps> = ({
    id,
    image,
    name,
    description,
    href,
    onRemove,
}) => {
    return (
        <Card
            className="
        group relative flex items-center gap-4 rounded-xl p-4
        transition-all ease-in-out
         duration-300
        hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30
      "
        >
            {/* Clickable area for restaurant */}
            <a href={href} className="flex items-center gap-4 flex-1">
                <img
                    src={image}
                    alt={name}
                    className="w-16 h-16 rounded-lg object-cover"
                />
                <CardContent className="p-0">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
            </a>

            {/* Remove button */}
            {onRemove && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </Card>
    )
}

export default ProfileFavoriteCard
