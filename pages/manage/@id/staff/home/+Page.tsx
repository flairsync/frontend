import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";

import { Separator } from "@/components/ui/separator";
import AppLauncher from "@/components/management/simple/AppLauncher";

/**
 * Easy View's home screen for staff. Same launcher as the owner side, filtered
 * by the permissions their role actually grants.
 */
const StaffHomePage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    if (!businessId) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {t("simple_mode.launcher.greeting")}
                </h1>
                <p className="text-muted-foreground">{t("simple_mode.launcher.subtitle")}</p>
            </div>

            <Separator />

            <AppLauncher businessId={businessId} role="staff" />
        </div>
    );
};

export default StaffHomePage;
