import React from "react";
import { useTranslation } from "react-i18next";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
    CalendarDays,
    Sunrise,
    Sunset,
    Clock,
    Coffee,
    CalendarCheck,
    ArrowRight
} from "lucide-react";

// ---- 🕐 Types ---- //
type DaySchedule = {
    dayKey: string;
    hours: string;
    icon?: React.ReactNode;
};

type TimingCategory = {
    id: string;
    title: string;
    icon: React.ReactNode;
    days: DaySchedule[];
};

// ---- 🕒 Data ---- //
const TIMING_CATEGORIES: TimingCategory[] = [
    {
        id: "weekdays",
        title: "Weekdays (Mon - Fri)",
        icon: <CalendarDays size={20} />,
        days: [
            {
                dayKey: "shared.days.monday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise size={16} />,
            },
            {
                dayKey: "shared.days.tuesday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise size={16} />,
            },
            {
                dayKey: "shared.days.wednesday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise size={16} />,
            },
            {
                dayKey: "shared.days.thursday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise size={16} />,
            },
            {
                dayKey: "shared.days.friday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Coffee size={16} />,
            },
        ],
    },
    {
        id: "weekend",
        title: "Weekend",
        icon: <CalendarCheck size={20} />,
        days: [
            {
                dayKey: "shared.days.saturday",
                hours: "9:00 AM - 12:00 AM",
                icon: <Clock size={16} />,
            },
            {
                dayKey: "shared.days.sunday",
                hours: "9:00 AM - 10:00 PM",
                icon: <Sunset size={16} />,
            },
        ],
    },
];

const BusinessDetailsTiming: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">
                    {t("business_page.timing.section_title", "Opening Hours")}
                </h2>
                <p className="text-muted-foreground">Plan your visit around our schedule.</p>
            </div>

            <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden">
                <CardContent className="p-0">
                    <Accordion type="multiple" defaultValue={["weekdays"]} className="divide-y divide-border/50">
                        {TIMING_CATEGORIES.map((category) => (
                            <AccordionItem key={category.id} value={category.id} className="border-none">
                                <AccordionTrigger className="flex items-center gap-4 px-8 py-6 hover:cursor-pointer hover:bg-muted/50 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 bg-muted rounded-2xl text-muted-foreground transition-all duration-300">
                                            {category.icon}
                                        </div>
                                        <div className="text-left">
                                            <span className="text-lg font-bold block">
                                                {t(`business_page.timing.categories.${category.id}`, category.title)}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                {category.days.length} Days Filtered
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="p-0">
                                    <div className="px-8 py-4 grid gap-3 border-t border-border/10">
                                        {category.days.map((day, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-4 rounded-2xl hover:bg-card hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-border/50 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-primary">{day.icon}</div>
                                                    <span className="font-bold text-foreground">{t(day.dayKey)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                                        {day.hours}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

        </section>
    );
};

export default BusinessDetailsTiming;

