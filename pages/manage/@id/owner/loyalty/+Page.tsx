import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Separator } from "@/components/ui/separator";
import { LoyaltyProgramManagement } from "@/components/management/loyalty/LoyaltyProgramManagement";

const BusinessOwnerLoyaltyPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("sidebar.items.loyalty")}</h1>

            <Separator />

            <LoyaltyProgramManagement businessId={businessId} canUpdate />
        </div>
    );
};

export default BusinessOwnerLoyaltyPage;
