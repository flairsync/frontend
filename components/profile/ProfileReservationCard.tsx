import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import React from "react"
import { useDiscoveryProfile } from "@/features/discovery/useDiscovery"
import { differenceInDays } from "date-fns"
import { Loader2, Radio } from "lucide-react"
import { formatInTimezone } from "@/lib/dateUtils"
import { getStatusBadge } from "@/features/reservations/reservationUtils"

interface ProfileReservationCardProps {
    id: string | number
    businessId: string
    restaurantName: string
    href: string
    datetime: string | Date
    status: string
    onCancel?: (businessId: string, id: string | number) => void
    isCanceling?: boolean
}

const ACTIVE_STATUSES = ['pending', 'confirmed', 'waitlist', 'seated'];

const ProfileReservationCard: React.FC<ProfileReservationCardProps> = ({
    id,
    businessId,
    restaurantName,
    href,
    datetime,
    status,
    onCancel,
    isCanceling
}) => {
    const { data: businessProfile } = useDiscoveryProfile(businessId);

    const formattedDate = formatInTimezone(
        datetime,
        "MMM D, YYYY hh:mm A",
        businessProfile?.timezone
    );

    const cancellationWindowDays = businessProfile?.reservationCancellationWindow ?? 1;
    const daysUntilReservation = differenceInDays(new Date(datetime), new Date());
    const canCancel = daysUntilReservation >= cancellationWindowDays;
    const normalizedStatus = status?.toLowerCase();
    const isCancellableStatus = ['pending', 'confirmed', 'waitlist'].includes(normalizedStatus);
    const isActive = ACTIVE_STATUSES.includes(normalizedStatus);

    const timelineHref = `/profile/reservations/${id}?businessId=${businessId}`;

    return (
        <Card className="group relative rounded-xl p-4 transition-all ease-in-out duration-300 hover:shadow-md">
            <div className="flex justify-between items-start gap-3">
                {/* Left: restaurant info */}
                <a href={href} className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                            {restaurantName}
                        </h3>
                        {getStatusBadge(normalizedStatus)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{formattedDate}</p>
                </a>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Track / Timeline button — only for active reservations */}
                    {isActive && (
                        <a href={timelineHref}>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5">
                                <Radio className="w-3.5 h-3.5 animate-pulse" />
                                Track
                            </Button>
                        </a>
                    )}

                    {onCancel && canCancel && isCancellableStatus && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onCancel(businessId, id as string)}
                            disabled={isCanceling}
                        >
                            {isCanceling && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default ProfileReservationCard
