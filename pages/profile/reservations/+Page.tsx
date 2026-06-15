import ProfileReservationCard from "@/components/profile/ProfileReservationCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAllMyReservations, useCancelReservation } from "@/features/discovery/useDiscovery"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import React, { useState } from "react"

const ReservationsPage = () => {
    const [filter, setFilter] = useState<"upcoming" | "past">("upcoming")
    const [page, setPage] = useState(1)

    const { data, isLoading } = useAllMyReservations({ filter, page, limit: 10 })
    const reservations = data?.data ?? []
    const totalPages = data?.totalPages ?? 1

    const { mutate: cancelReservation, isPending: isCanceling } = useCancelReservation()

    const handleCancel = (businessId: string, reservationId: string | number) => {
        cancelReservation({ businessId, reservationId: String(reservationId) })
    }

    const handleFilterChange = (value: string) => {
        setFilter(value as "upcoming" | "past")
        setPage(1)
    }

    const emptyMessage =
        filter === "upcoming"
            ? "You have no upcoming reservations."
            : "You have no past reservations."

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <CardTitle>My Reservations</CardTitle>
                <Tabs value={filter} onValueChange={handleFilterChange}>
                    <TabsList>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                ) : reservations.length === 0 ? (
                    <p className="text-muted-foreground text-center p-4">{emptyMessage}</p>
                ) : (
                    <>
                        {reservations.map((res: any) => {
                            const locationParts = [res.business?.city, res.business?.address].filter(Boolean)
                            const subtitle = [
                                res.guestCount ? `${res.guestCount} guest${res.guestCount !== 1 ? "s" : ""}` : null,
                                locationParts.join(", "),
                            ].filter(Boolean).join(" · ")

                            return (
                                <ProfileReservationCard
                                    key={res.id}
                                    id={res.id}
                                    businessId={res.businessId ?? res.business?.id}
                                    restaurantName={res.business?.name ?? "Restaurant"}
                                    href={`/businesses/${res.businessId ?? res.business?.id}`}
                                    datetime={res.reservationTime}
                                    status={res.status}
                                    subtitle={subtitle || undefined}
                                    onCancel={handleCancel}
                                    isCanceling={isCanceling}
                                />
                            )
                        })}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default ReservationsPage
