import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/features/reservations/useReservationDashboard";
import { Hourglass, Users, Phone, Armchair } from "lucide-react";

function formatWait(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

interface WaitlistPanelProps {
    businessId: string;
    onSeat: (reservation: any) => void;
}

export const WaitlistPanel: React.FC<WaitlistPanelProps> = ({ businessId, onSeat }) => {
    const { data: waitlist = [] } = useWaitlist(businessId);

    if (!waitlist.length) return null;

    return (
        <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-amber-600" />
                    Waitlist ({waitlist.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {waitlist.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between gap-3 bg-background border border-amber-200 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <span className="text-sm font-medium truncate">{entry.customerName}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    <Users className="w-3 h-3 inline mr-0.5" />{entry.guestCount}
                                </span>
                                {entry.customerPhone && (
                                    <a href={`tel:${entry.customerPhone}`} className="text-xs text-muted-foreground whitespace-nowrap hover:underline">
                                        <Phone className="w-3 h-3 inline mr-0.5" />{entry.customerPhone}
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                                    Waiting {formatWait(entry.waitingMinutes)}
                                </Badge>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => onSeat(entry)}>
                                    <Armchair className="w-3.5 h-3.5 mr-1" /> Seat
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
