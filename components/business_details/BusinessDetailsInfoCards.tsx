import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useTranslation } from 'react-i18next';

const BusinessDetailsInfoCards = () => {
    const { t } = useTranslation();

    return (
        <div className="grid md:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("business_page.info_cards.rating_title")}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">4.5 / 5 (128 reviews)</span>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("business_page.info_cards.status_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-green-600 font-medium">{t("business_page.info_cards.status_open_now")}</span>
                    <p className="text-sm text-muted-foreground">
                        {t("business_page.info_cards.status_closes_at", { time: "11:00 PM" })}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("business_page.info_cards.location_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Carrer Major 12, Andorra la Vella, Andorra</p>
                    <Button className="mt-2" variant="outline">
                        {t("business_page.info_cards.view_on_map_button")}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default BusinessDetailsInfoCards;
