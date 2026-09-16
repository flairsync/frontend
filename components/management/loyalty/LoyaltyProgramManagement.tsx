import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Lock, Gift } from "lucide-react";
import { useLoyaltyProgram } from "@/features/loyalty/useLoyaltyProgram";
import { LoyaltyQrCard } from "./LoyaltyQrCard";
import { LoyaltyMembersManagement } from "./LoyaltyMembersManagement";

type LoyaltyProgramManagementProps = {
    businessId: string;
    canUpdate: boolean;
};

export function LoyaltyProgramManagement({ businessId, canUpdate }: LoyaltyProgramManagementProps) {
    const { t } = useTranslation("management");
    const { program, fetchingProgram, isLocked, saveProgram, savingProgram } = useLoyaltyProgram(businessId);

    const [isActive, setIsActive] = useState(false);
    const [rate, setRate] = useState("1.00");
    const [expiryMonths, setExpiryMonths] = useState("");

    useEffect(() => {
        if (program) {
            setIsActive(program.isActive);
            setRate(program.pointsPerCurrencyUnit ?? "1.00");
            setExpiryMonths(program.expiryMonths ? String(program.expiryMonths) : "");
        }
    }, [program]);

    if (fetchingProgram) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isLocked) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center text-center gap-3 py-12">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold">{t("loyalty_management.locked_title")}</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            {t("loyalty_management.locked_description")}
                        </p>
                    </div>
                    <Button asChild variant="outline" className="mt-2">
                        <a href={`/manage/${businessId}/owner/settings`}>{t("loyalty_management.upgrade_button")}</a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const parsedRate = parseFloat(rate);
    const isRateValid = !isNaN(parsedRate) && parsedRate > 0;
    const parsedExpiryMonths = expiryMonths.trim() === "" ? null : parseInt(expiryMonths, 10);
    const isExpiryValid = parsedExpiryMonths === null || (Number.isInteger(parsedExpiryMonths) && parsedExpiryMonths >= 0);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <CardTitle>{t("loyalty_management.title")}</CardTitle>
                    </div>
                    <CardDescription>{t("loyalty_management.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="loyalty-active">{t("loyalty_management.active_label")}</Label>
                            <p className="text-sm text-muted-foreground">{t("loyalty_management.active_description")}</p>
                        </div>
                        <Switch
                            id="loyalty-active"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            disabled={!canUpdate}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="loyalty-rate">{t("loyalty_management.rate_label")}</Label>
                        <p className="text-sm text-muted-foreground mb-2">{t("loyalty_management.rate_description")}</p>
                        <Input
                            id="loyalty-rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            disabled={!canUpdate}
                            className="max-w-[160px]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="loyalty-expiry">{t("loyalty_management.expiry_label")}</Label>
                        <p className="text-sm text-muted-foreground mb-2">{t("loyalty_management.expiry_description")}</p>
                        <Input
                            id="loyalty-expiry"
                            type="number"
                            min="0"
                            step="1"
                            placeholder={t("loyalty_management.expiry_placeholder")}
                            value={expiryMonths}
                            onChange={(e) => setExpiryMonths(e.target.value)}
                            disabled={!canUpdate}
                            className="max-w-[160px]"
                        />
                    </div>

                    {canUpdate && (
                        <Button
                            onClick={() => saveProgram({
                                pointsPerCurrencyUnit: parsedRate.toFixed(2),
                                isActive,
                                expiryMonths: parsedExpiryMonths,
                            })}
                            disabled={savingProgram || !isRateValid || !isExpiryValid}
                            className="gap-2"
                        >
                            {savingProgram && <Loader2 className="h-4 w-4 animate-spin" />}
                            {t("loyalty_management.save_button")}
                        </Button>
                    )}
                </CardContent>
            </Card>

            <LoyaltyQrCard businessId={businessId} />

            <LoyaltyMembersManagement businessId={businessId} canUpdate={canUpdate} />
        </div>
    );
}
