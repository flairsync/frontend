
import ProfileFavoriteCard from '@/components/profile/ProfileFavoriteCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const FavoritesPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Favorite businesses</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1  gap-4">
                {[1, 2, 3].map((i) => (
                    <ProfileFavoriteCard
                        href={`/business/${i}`}
                        id={i}
                        key={i}
                        image={`https://picsum.photos/seed/fav${i}/100/100`}
                        name={`Restaurant ${i}`}
                        description="Great food, cozy vibes"
                        onRemove={() => {

                        }}
                    />
                ))}
            </CardContent>
        </Card>
    )
}

export default FavoritesPage