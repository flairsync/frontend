import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const MyReviewsPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="border-b pb-2">
                        <h3 className="font-medium">Restaurant {i}</h3>
                        <p className="text-sm">⭐️⭐️⭐️⭐️☆</p>
                        <p className="text-muted-foreground">
                            Amazing food, friendly staff!
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default MyReviewsPage