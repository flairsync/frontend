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
} from "lucide-react";

// ---- 🕐 Types ---- //
type DaySchedule = {
    dayKey: string; // translation key for the day
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
        icon: <CalendarDays className="w-5 h-5 text-blue-600" />,
        days: [
            {
                dayKey: "shared.days.monday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise className="w-4 h-4 text-amber-500" />,
            },
            {
                dayKey: "shared.days.tuesday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise className="w-4 h-4 text-amber-500" />,
            },
            {
                dayKey: "shared.days.wednesday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise className="w-4 h-4 text-amber-500" />,
            },
            {
                dayKey: "shared.days.thursday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Sunrise className="w-4 h-4 text-amber-500" />,
            },
            {
                dayKey: "shared.days.friday",
                hours: "8:00 AM - 11:00 PM",
                icon: <Coffee className="w-4 h-4 text-amber-600" />,
            },
        ],
    },
    {
        id: "weekend",
        title: "Weekend",
        icon: <CalendarCheck className="w-5 h-5 text-green-600" />,
        days: [
            {
                dayKey: "shared.days.saturday",
                hours: "9:00 AM - 12:00 AM",
                icon: <Clock className="w-4 h-4 text-emerald-600" />,
            },
            {
                dayKey: "shared.days.sunday",
                hours: "9:00 AM - 10:00 PM",
                icon: <Sunset className="w-4 h-4 text-rose-500" />,
            },
        ],
    },
];

const BusinessDetailsTiming: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
                {t("business_page.timing.section_title", "Opening Hours")}
            </h2>

            <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                    <Accordion type="multiple" className="divide-y divide-gray-200">
                        {TIMING_CATEGORIES.map((category) => (
                            <AccordionItem key={category.id} value={category.id}>
                                <AccordionTrigger className="hover:cursor-pointer  flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        {category.icon}
                                        <span className="font-medium text-gray-800">
                                            {t(`business_page.timing.categories.${category.id}`, category.title)}
                                        </span>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="bg-gray-50 px-6 py-3 space-y-2 animate-in slide-in-from-top-2">
                                    {category.days.map((day, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center text-gray-700"
                                        >
                                            <div className="flex items-center gap-2">
                                                {day.icon}
                                                <span>{t(day.dayKey)}</span>
                                            </div>
                                            <span className="font-semibold">{day.hours}</span>
                                        </div>
                                    ))}
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
