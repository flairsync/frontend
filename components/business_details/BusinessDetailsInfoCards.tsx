import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin, Navigation } from "lucide-react";
import { useTranslation } from 'react-i18next';

const InfoCard = ({ icon: Icon, title, content, subContent, action }: any) => (
    <Card className="group relative overflow-hidden bg-card border-border/50 rounded-3xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
        <CardContent className="p-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                </div>
                <div className="space-y-1 flex-1">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">{content}</span>
                    </div>
                    {subContent && <p className="text-sm text-muted-foreground/80">{subContent}</p>}
                    {action && <div className="pt-2">{action}</div>}
                </div>
            </div>
        </CardContent>
    </Card>
);

const BusinessDetailsInfoCards = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
                icon={Star}
                title={t("business_page.info_cards.rating_title")}
                content="4.5 / 5"
                subContent="Based on 128 verified reviews"
            />

            <InfoCard
                icon={Clock}
                title={t("business_page.info_cards.status_title")}
                content={t("business_page.info_cards.status_open_now")}
                subContent={t("business_page.info_cards.status_closes_at", { time: "11:00 PM" })}
            />

            <InfoCard
                icon={MapPin}
                title={t("business_page.info_cards.location_title")}
                content="Andorra la Vella"
                subContent="Carrer Major 12"
                action={
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-all px-3">
                        <Navigation size={14} className="mr-2" />
                        {t("business_page.info_cards.view_on_map_button")}
                    </Button>
                }
            />
        </div>
    );
};

export default BusinessDetailsInfoCards;
