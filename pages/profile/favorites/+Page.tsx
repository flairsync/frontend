
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const FavoritesPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Favorite Restaurants</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border p-4 flex items-center gap-4"
                    >
                        <img
                            src={`https://picsum.photos/seed/fav${i}/100/100`}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                            <h3 className="font-medium">Restaurant {i}</h3>
                            <p className="text-sm text-muted-foreground">
                                Great food, cozy vibes
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default FavoritesPage