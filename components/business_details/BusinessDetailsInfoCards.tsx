import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin, Navigation } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";

interface BusinessDetailsInfoCardsProps {
    profile: DiscoveryBusinessProfile;
}

const InfoCard = ({ icon: Icon, title, content, subContent, action, contentClassName }: any) => (
    <Card className="group relative overflow-hidden bg-card border-border/50 rounded-3xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
        <CardContent className="p-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                </div>
                <div className="space-y-1 flex-1">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold text-foreground ${contentClassName}`}>{content}</span>
                    </div>
                    {subContent && <p className="text-sm text-muted-foreground/80">{subContent}</p>}
                    {action && <div className="pt-2">{action}</div>}
                </div>
            </div>
        </CardContent>
    </Card>
);

const formatTimeString = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
};

const BusinessDetailsInfoCards = ({ profile }: BusinessDetailsInfoCardsProps) => {
    const { t } = useTranslation();

    const getStatus = () => {
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayIndex = now.getDay();
        const currentDay = days[dayIndex];
        const yesterdayDay = days[(dayIndex + 6) % 7];

        const currentTime = now.getHours().toString().padStart(2, '0') + ":" +
            now.getMinutes().toString().padStart(2, '0') + ":" +
            now.getSeconds().toString().padStart(2, '0');

        const isBetween = (time: string, open: string, close: string) => {
            if (close > open) return time >= open && time < close;
            return time >= open || time < close; // Midnight crossing
        };

        // 1. Check current day
        const today = profile.openingHours.find(h => h.day.toLowerCase() === currentDay);
        if (today && !today.isClosed) {
            for (const period of today.periods) {
                if (isBetween(currentTime, period.open, period.close)) {
                    return { isOpen: true, time: period.close, type: 'closes' };
                }
            }
        }

        // 2. Check midnight crossing from yesterday
        const yesterday = profile.openingHours.find(h => h.day.toLowerCase() === yesterdayDay);
        if (yesterday && !yesterday.isClosed) {
            for (const period of yesterday.periods) {
                if (period.close < period.open && currentTime < period.close) {
                    return { isOpen: true, time: period.close, type: 'closes' };
                }
            }
        }

        // 3. Find next opening time today
        if (today && !today.isClosed) {
            const nextPeriod = today.periods
                .filter(p => p.open > currentTime)
                .sort((a, b) => a.open.localeCompare(b.open))[0];

            if (nextPeriod) {
                return { isOpen: false, time: nextPeriod.open, type: 'opens' };
            }
        }

        // 4. Find next opening time in future days
        for (let i = 1; i <= 7; i++) {
            const nextDayIndex = (dayIndex + i) % 7;
            const nextDayName = days[nextDayIndex];
            const nextDay = profile.openingHours.find(h => h.day.toLowerCase() === nextDayName);

            if (nextDay && !nextDay.isClosed && nextDay.periods.length > 0) {
                const firstPeriod = nextDay.periods.sort((a, b) => a.open.localeCompare(b.open))[0];
                return { isOpen: false, time: firstPeriod.open, type: 'opens' };
            }
        }

        return { isOpen: false, time: null, type: 'none' };
    };

    const status = getStatus();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
                icon={Star}
                title={t("business_page.info_cards.rating_title")}
                content="4.5 / 5"
                subContent="Based on premium reviews"
            />

            <InfoCard
                icon={Clock}
                title={t("business_page.info_cards.status_title")}
                content={status.isOpen ? t("business_page.info_cards.status_open_now") : t("business_page.info_cards.status_closed")}
                contentClassName={status.isOpen ? "text-emerald-500" : "text-rose-500"}
                subContent={status.type === 'closes'
                    ? t("business_page.info_cards.status_closes_at", { time: formatTimeString(status.time!) })
                    : status.type === 'opens'
                        ? t("business_page.info_cards.status_opens_at", { time: formatTimeString(status.time!) })
                        : t("business_page.info_cards.status_check_hours")}
            />

            <InfoCard
                icon={MapPin}
                title={t("business_page.info_cards.location_title")}
                content={profile.city || profile.country?.name || 'Location'}
                subContent={profile.address}
                action={
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-all px-3"
                        onClick={() => {
                            if (profile.location?.coordinates) {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${profile.location.coordinates[1]},${profile.location.coordinates[0]}`, '_blank');
                            }
                        }}
                    >
                        <Navigation size={14} className="mr-2" />
                        {t("business_page.info_cards.view_on_map_button")}
                    </Button>
                }
            />
        </div>
    );
};

export default BusinessDetailsInfoCards;
