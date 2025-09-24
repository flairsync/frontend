import ProfileReservationCard from "@/components/profile/ProfileReservationCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React, { useState } from "react"

const ReservationsPage = () => {
    const [reservations, setReservations] = useState([
        { id: 1, restaurantName: "Borda La Vella", datetime: "2025-09-28T19:30:00" },
        { id: 2, restaurantName: "Cafe Central", datetime: "2025-09-30T12:00:00" },
    ])

    const handleCancel = (id: number | string) => {
        setReservations((prev) => prev.filter((r) => r.id !== id))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reservations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {reservations.map((res) => (
                    <ProfileReservationCard
                        key={res.id}
                        id={res.id}
                        restaurantName={res.restaurantName}
                        href={`/business/${res.id}`}
                        datetime={res.datetime}
                        onCancel={handleCancel}
                    />
                ))}
            </CardContent>
        </Card>
    )
}

export default ReservationsPage
