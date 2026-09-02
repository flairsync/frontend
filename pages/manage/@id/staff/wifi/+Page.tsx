import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { usePermissions } from "@/features/auth/usePermissions";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { WifiNetworksManagement } from "@/components/management/wifi/WifiNetworksManagement";

const StaffWifiPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(businessId);

    if (loadingPermissions) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const canRead = hasPermission("WIFI", "read");
    const canCreate = hasPermission("WIFI", "create");
    const canUpdate = hasPermission("WIFI", "update");
    const canDelete = hasPermission("WIFI", "delete");

    if (!canRead) {
        navigate(`/manage/${businessId}/staff/dashboard`);
        return null;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("staff_sidebar.items.wifi_networks")}</h1>

            <Separator />

            <WifiNetworksManagement businessId={businessId} canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} />
        </div>
    );
};

export default StaffWifiPage;
