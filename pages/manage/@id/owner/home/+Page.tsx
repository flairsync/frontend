import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";

import { Separator } from "@/components/ui/separator";
import AppLauncher from "@/components/management/simple/AppLauncher";
import RightNowStrip from "@/components/management/simple/RightNowStrip";
import { WelcomeChecklist } from "@/components/management/dashboard/WelcomeChecklist";
import { useMyBusiness } from "@/features/business/useMyBusiness";

/**
 * Easy View's home screen for owners. Reachable in both shells — Full View
 * users can still land here from a link, they just won't be sent here.
 */
const OwnerHomePage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { myBusinessFullDetails } = useMyBusiness(businessId);

    if (!businessId) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {myBusinessFullDetails?.name
                        ? t("simple_mode.launcher.greeting_named", {
                            name: myBusinessFullDetails.name,
                        })
                        : t("simple_mode.launcher.greeting")}
                </h1>
                <p className="text-muted-foreground">{t("simple_mode.launcher.subtitle")}</p>
            </div>

            <Separator />

            <RightNowStrip businessId={businessId} />

            <WelcomeChecklist businessId={businessId} />

            <AppLauncher businessId={businessId} role="owner" />
        </div>
    );
};

export default OwnerHomePage;
