import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import ProfileOverviewOrdersChart from "@/components/profile/ProfileOverviewOrdersChart"


const ProfileOverviewPage = () => {
    // Example stats
    const joinedDate = "Jan 15, 2023"
    const reservationsMade = 27
    const mealsOrdered = 134
    const favoriteCuisineProgress = 70 // percent for favorite cuisine graph example

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                    <img
                        src="https://via.placeholder.com/80"
                        alt="Avatar"
                        className="w-20 h-20 rounded-full"
                    />
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">John Doe</h2>
                        <p className="text-sm text-muted-foreground">johndoe@email.com</p>
                        <p className="text-sm">📍 Andorra la Vella, Andorra</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Coffee enthusiast, loves exploring new restaurants.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Joined */}
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Joined</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{joinedDate}</p>
                    </CardContent>
                </Card>

                {/* Reservations Made */}
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Reservations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{reservationsMade}</p>
                    </CardContent>
                </Card>

                {/* Meals Ordered */}
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Meals Ordered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{mealsOrdered}</p>
                    </CardContent>
                </Card>
            </div>

            <ProfileOverviewOrdersChart />

        </div>
    )
}

export default ProfileOverviewPage
