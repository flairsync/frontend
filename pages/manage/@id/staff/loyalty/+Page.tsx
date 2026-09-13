import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { usePermissions } from "@/features/auth/usePermissions";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { LoyaltyProgramManagement } from "@/components/management/loyalty/LoyaltyProgramManagement";

const StaffLoyaltyPage: React.FC = () => {
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

    const canRead = hasPermission("LOYALTY", "read");
    const canUpdate = hasPermission("LOYALTY", "update");

    if (!canRead) {
        navigate(`/manage/${businessId}/staff/dashboard`);
        return null;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("staff_sidebar.items.loyalty")}</h1>

            <Separator />

            <LoyaltyProgramManagement businessId={businessId} canUpdate={canUpdate} />
        </div>
    );
};

export default StaffLoyaltyPage;
