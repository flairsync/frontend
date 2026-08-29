import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputError } from "@/components/inputs/InputError";

interface UnlinkBusinessDialogProps {
    open: boolean;
    businessName: string;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (newOwnerEmail: string) => void;
}

// Removing a business from an organization/region hands its ownership back to a specific
// person (see flairsync-api's Org/Region Ownership Rework, Phase 2) — the business can't be
// left ownerless, so this dialog collects who that person is before the API call, which now
// requires it.
export const UnlinkBusinessDialog: React.FC<UnlinkBusinessDialogProps> = ({
    open,
    businessName,
    isSubmitting,
    onOpenChange,
    onConfirm,
}) => {
    const { t } = useTranslation("management");
    const [newOwnerEmail, setNewOwnerEmail] = useState("");
    const [touched, setTouched] = useState(false);

    const emailValid = /^\S+@\S+\.\S+$/.test(newOwnerEmail.trim());
    const error = !touched
        ? undefined
        : newOwnerEmail.trim().length === 0
            ? t("danger_page.email_required")
            : !emailValid
                ? t("danger_page.email_invalid")
                : undefined;

    const reset = () => {
        setNewOwnerEmail("");
        setTouched(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset();
                onOpenChange(next);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("organization_detail_page.unlink_business.title", { name: businessName })}</DialogTitle>
                    <DialogDescription>
                        {t("organization_detail_page.unlink_business.description", { name: businessName })}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-1">
                    <Label htmlFor="unlinkNewOwnerEmail">{t("danger_page.new_owner_email")}</Label>
                    <Input
                        id="unlinkNewOwnerEmail"
                        type="email"
                        placeholder={t("danger_page.enter_recipient_email")}
                        value={newOwnerEmail}
                        onChange={(e) => setNewOwnerEmail(e.target.value)}
                        onBlur={() => setTouched(true)}
                    />
                    {error && <InputError message={error} />}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("danger_page.cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={!emailValid || isSubmitting}
                        onClick={() => onConfirm(newOwnerEmail.trim())}
                    >
                        {isSubmitting
                            ? t("organization_detail_page.unlink_business.submitting")
                            : t("organization_detail_page.unlink_business.confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
