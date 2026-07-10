import React from "react";
import dayjs from "dayjs";
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

export interface OpeningHoursListProps {
    title?: string;
    hours?: OpeningHoursDay[];
}

const dayOrder: Record<string, number> = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7,
};

const OpeningHoursList: React.FC<OpeningHoursListProps> = ({ title = "Opening Hours", hours = [] }) => {
    const today = dayjs().format("dddd").toLowerCase();
    const sorted = [...(hours || [])].sort(
        (a, b) => (dayOrder[a.day?.toLowerCase()] ?? 99) - (dayOrder[b.day?.toLowerCase()] ?? 99)
    );

    return (
        <section className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">{title}</h2>
            {sorted.length > 0 ? (
                <Card className="max-w-2xl mx-auto rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                        {sorted.map((d, i) => {
                            const isToday = d.day?.toLowerCase() === today;
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors ${isToday ? "bg-primary/8 ring-1 ring-primary/20" : "hover:bg-muted/60"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${isToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                            <Clock size={16} />
                                        </div>
                                        <span className="font-bold capitalize">{d.day}</span>
                                        {isToday && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                    {d.isClosed ? (
                                        <span className="text-muted-foreground text-sm font-medium">Closed</span>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1">
                                            {(d.periods || []).map((p, pi) => (
                                                <span key={pi} className="text-sm font-bold text-primary">
                                                    {p.open?.substring(0, 5)} – {p.close?.substring(0, 5)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            ) : (
                <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-[2rem]">
                    No opening hours configured yet.
                </div>
            )}
        </section>
    );
};

export default OpeningHoursList;
