import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const ProfileOverviewPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <img
                        src="https://via.placeholder.com/80"
                        alt="Avatar"
                        className="w-20 h-20 rounded-full"
                    />
                    <div>
                        <h2 className="text-xl font-bold">John Doe</h2>
                        <p className="text-sm text-muted-foreground">
                            johndoe@email.com
                        </p>
                        <p className="text-sm">📍 Andorra la Vella, Andorra</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-muted-foreground">
                        Short bio goes here. Coffee enthusiast, loves exploring new
                        restaurants.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProfileOverviewPage