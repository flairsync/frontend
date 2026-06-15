
import ProfileFavoriteCard from '@/components/profile/ProfileFavoriteCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { useFavorites } from '@/features/favorites/useFavorites'
import { Skeleton } from '@/components/ui/skeleton'
import { BusinessCardDetails } from '@/models/BusinessCardDetails'

const FavoritesPage = () => {
    const { useGetFavorites, removeFavorite } = useFavorites();
    const { data, isLoading } = useGetFavorites({ limit: 50 });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Favorite businesses</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    const favorites = data?.items || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Favorite businesses</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
                {favorites.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No favorite businesses yet.
                    </div>
                ) : (
                    favorites.map((business) => {
                        const details = BusinessCardDetails.fromDiscoveryBusiness(business);
                        return (
                            <ProfileFavoriteCard
                                key={business.id}
                                id={business.id}
                                href={`/business/${business.id}`}
                                image={details.image}
                                name={business.name}
                                description={business.description || ""}
                                onRemove={async (id) => {
                                    await removeFavorite(id.toString());
                                }}
                            />
                        );
                    })
                )}
            </CardContent>
        </Card>
    )
}

export default FavoritesPage