import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { OpeningHours } from "@/models/business/MyBusinessFullDetails";

interface BusinessDetailsTimingProps {
    openingHours: OpeningHours[];
}

const dayToNum: Record<string, number> = {
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5,
    "saturday": 6,
    "sunday": 7
};

const BusinessDetailsTiming: React.FC<BusinessDetailsTimingProps> = ({ openingHours }) => {
    const { t } = useTranslation();

    const sortedHours = [...openingHours].sort((a, b) => {
        const da = dayToNum[a.day.toLowerCase()] ?? 99;
        const db = dayToNum[b.day.toLowerCase()] ?? 99;
        return da - db;
    });

    return (
        <section className="space-y-12">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight">
                    {t("business_page.timing.section_title", "Opening Hours")}
                </h2>
                <p className="text-muted-foreground">
                    {t("business_page.timing.subtitle", "Plan your visit around our schedule. We're open weekly to serve you best.")}
                </p>
            </div>

            {sortedHours.length > 0 ? (
                <Card className="max-w-3xl mx-auto border-border/50 shadow-2xl shadow-primary/5 rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-10 space-y-2">
                        {sortedHours.map((dayHour, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center p-5 rounded-2xl hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/10 group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                                        <Clock size={22} />
                                    </div>
                                    <span className="font-bold text-xl text-foreground capitalize tracking-tight">
                                        {t(`shared.days.${dayHour.day.toLowerCase()}`, dayHour.day)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {dayHour.isClosed ? (
                                        <span className="font-black text-muted-foreground/60 bg-muted/30 px-5 py-2 rounded-2xl text-xs uppercase tracking-[0.2em]">
                                            {t("business_page.timing.closed", "Closed")}
                                        </span>
                                    ) : (
                                        <div className="flex flex-col items-end gap-2">
                                            {dayHour.periods.map((period, pIdx) => (
                                                <span key={pIdx} className="font-black text-primary bg-primary/10 px-5 py-2 rounded-2xl text-sm shadow-sm">
                                                    {period.open.substring(0, 5)} - {period.close.substring(0, 5)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <div className="py-24 text-center bg-card/50 backdrop-blur-sm border border-dashed border-border/50 rounded-[3rem] max-w-3xl mx-auto">
                    <p className="text-muted-foreground font-medium italic">
                        {t("business_page.timing.no_hours", "No opening hours have been configured for this business yet.")}
                    </p>
                </div>
            )}
        </section>
    );
};

export default BusinessDetailsTiming;

