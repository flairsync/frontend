import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface OpeningHoursPeriod {
    open: string;
    close: string;
}

export interface OpeningHoursDay {
    day: string;
    isClosed?: boolean;
    periods: OpeningHoursPeriod[];
}

export interface OpeningHoursProps {
    title?: string;
    hours?: OpeningHoursDay[];
}

const dayOrder: Record<string, number> = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7,
};

const OpeningHoursComponent: React.FC<OpeningHoursProps> = ({ title = "Opening Hours", hours = [] }) => {
    const sorted = [...(hours || [])].sort(
        (a, b) => (dayOrder[a.day?.toLowerCase()] ?? 99) - (dayOrder[b.day?.toLowerCase()] ?? 99)
    );

    return (
        <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-center">{title}</h2>
            {sorted.length > 0 ? (
                <Card className="max-w-2xl mx-auto rounded-[2rem] border-border/50">
                    <CardContent className="p-6 space-y-1">
                        {sorted.map((d, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-muted-foreground" />
                                    <span className="font-medium capitalize">{d.day}</span>
                                </div>
                                {d.isClosed ? (
                                    <span className="text-muted-foreground text-sm">Closed</span>
                                ) : (
                                    <div className="flex flex-col items-end gap-1">
                                        {(d.periods || []).map((p, pi) => (
                                            <span key={pi} className="text-sm font-semibold text-primary">
                                                {p.open?.substring(0, 5)} – {p.close?.substring(0, 5)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-[2rem]">
                    No opening hours configured yet.
                </div>
            )}
        </section>
    );
};

export default OpeningHoursComponent;
