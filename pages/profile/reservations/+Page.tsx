import ProfileReservationCard from "@/components/profile/ProfileReservationCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"
import { useMyReservations, useCancelReservation } from "@/features/discovery/useDiscovery"
import { Loader2 } from "lucide-react"

const ReservationsPage = () => {
    const { data: reservations = [], isLoading } = useMyReservations();
    const { mutate: cancelReservation, isPending: isCanceling } = useCancelReservation();

    const handleCancel = (businessId: string, reservationId: string | number) => {
        cancelReservation({ businessId, reservationId: String(reservationId) });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reservations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : reservations.length === 0 ? (
                    <p className="text-muted-foreground text-center p-4">You have no upcoming reservations.</p>
                ) : (
                    reservations.map((res: any) => (
                        <ProfileReservationCard
                            key={res.id}
                            id={res.id}
                            businessId={res.businessId}
                            restaurantName={res.business?.name || "Restaurant"}
                            href={`/business/${res.businessId}`}
                            datetime={res.reservationTime}
                            status={res.status}
                            onCancel={handleCancel}
                            isCanceling={isCanceling}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export default ReservationsPage
