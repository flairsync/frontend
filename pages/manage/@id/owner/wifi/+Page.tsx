import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Separator } from "@/components/ui/separator";
import { WifiNetworksManagement } from "@/components/management/wifi/WifiNetworksManagement";

const BusinessOwnerWifiPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("sidebar.items.wifi_networks")}</h1>

            <Separator />

            <WifiNetworksManagement businessId={businessId} canCreate canUpdate canDelete />
        </div>
    );
};

export default BusinessOwnerWifiPage;
