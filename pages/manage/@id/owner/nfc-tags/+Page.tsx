import React from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Separator } from "@/components/ui/separator";
import { NfcTagsManagement } from "@/components/management/nfc/NfcTagsManagement";

const BusinessOwnerNfcTagsPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("sidebar.items.nfc_tags")}</h1>

            <Separator />

            <NfcTagsManagement businessId={businessId} canCreate canUpdate />
        </div>
    );
};

export default BusinessOwnerNfcTagsPage;
