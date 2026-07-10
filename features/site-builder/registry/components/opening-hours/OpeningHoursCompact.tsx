import React from "react";
import dayjs from "dayjs";

export interface OpeningHoursPeriod {
    open: string;
    close: string;
}

export interface OpeningHoursDay {
    day: string;
    isClosed?: boolean;
    periods: OpeningHoursPeriod[];
}

export interface OpeningHoursCompactProps {
    title?: string;
    hours?: OpeningHoursDay[];
}

const dayOrder: Record<string, number> = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7,
};

const OpeningHoursCompact: React.FC<OpeningHoursCompactProps> = ({ title = "Opening Hours", hours = [] }) => {
    const today = dayjs().format("dddd").toLowerCase();
    const sorted = [...(hours || [])].sort(
        (a, b) => (dayOrder[a.day?.toLowerCase()] ?? 99) - (dayOrder[b.day?.toLowerCase()] ?? 99)
    );

    return (
        <section className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold tracking-tight text-center">{title}</h2>
            {sorted.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sorted.map((d, i) => {
                        const isToday = d.day?.toLowerCase() === today;
                        return (
                            <div
                                key={i}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${isToday ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" : "bg-muted/60 font-medium"
                                    }`}
                            >
                                <span className="capitalize">{d.day}</span>
                                {d.isClosed ? (
                                    <span className={isToday ? "opacity-90" : "text-muted-foreground"}>Closed</span>
                                ) : (
                                    <span className={isToday ? "" : "text-muted-foreground"}>
                                        {(d.periods || []).map((p) => `${p.open?.substring(0, 5)}–${p.close?.substring(0, 5)}`).join(", ")}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
                    No opening hours configured yet.
                </div>
            )}
        </section>
    );
};

export default OpeningHoursCompact;
