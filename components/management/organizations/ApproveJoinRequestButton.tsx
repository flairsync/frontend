import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";
import { useProfile } from "@/features/profile/useProfile";
import { JoinRequest } from "@/features/join-requests/join-requests";

interface ApproveJoinRequestButtonProps {
    request: JoinRequest;
    onApprove: () => void;
    disabled?: boolean;
}

// Approving a LINK request is the moment a business actually becomes linked
// to a region/org — and, since the Org/Region Ownership Rework (Phase 2),
// the moment real ownership transfers to it immediately, not just a rollup
// link (JoinRequestsService.applyLink calls transferOwnershipToOrgOrRegion
// in the same transaction as the link). When the approver is the business's
// own current owner, that's the one moment in this whole flow where that
// needs disclosing before it happens — everywhere else, the org/region side
// already gave consent by initiating or approving the request itself.
export const ApproveJoinRequestButton: React.FC<ApproveJoinRequestButtonProps> = ({
    request,
    onApprove,
    disabled,
}) => {
    const { t } = useTranslation("management");
    const { userProfile } = useProfile();

    const isOwnershipHandover =
        request.action === "LINK" && request.childType === "BUSINESS" && request.childOwnerId === userProfile?.id;

    if (!isOwnershipHandover) {
        return (
            <Button size="sm" className="h-8" disabled={disabled} onClick={onApprove}>
                <Check className="h-3.5 w-3.5 mr-1" /> {t("requests_page.approve")}
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" className="h-8" disabled={disabled}>
                    <Check className="h-3.5 w-3.5 mr-1" /> {t("requests_page.approve")}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("requests_page.join_confirm.title", { name: request.parentName })}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                {t("requests_page.join_confirm.body1", { childName: request.childName, parentName: request.parentName })}
                            </p>
                            <p className="text-foreground font-medium">
                                {t("requests_page.join_confirm.body2", { childName: request.childName, parentName: request.parentName })}
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("requests_page.cancel")}</AlertDialogCancel>
                    <AlertDialogAction disabled={disabled} onClick={onApprove}>
                        {disabled ? t("requests_page.join_confirm.joining") : t("requests_page.join_confirm.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
