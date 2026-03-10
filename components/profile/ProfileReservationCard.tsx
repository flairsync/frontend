import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import React from "react"
import { useDiscoveryProfile } from "@/features/discovery/useDiscovery"
import { differenceInDays } from "date-fns"
import { Loader2 } from "lucide-react"
import { formatInTimezone } from "@/lib/dateUtils"

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
    const isCancellableStatus = status === "PENDING" || status === "CONFIRMED" || status === "WAITLIST";

    return (
        <Card
            className="
        group relative rounded-xl p-4 transition-all ease-in-out duration-300
        hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20
        flex justify-between items-center
        hover:cursor-pointer
      "
        >
            <a href={href} className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                        {restaurantName}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                        {status}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </a>

            {onCancel && canCancel && isCancellableStatus && (
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onCancel(businessId, id as string)}
                    disabled={isCanceling}
                >
                    {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancel
                </Button>
            )}
        </Card>
    )
}

export default ProfileReservationCard
