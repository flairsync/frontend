import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { Subscription } from "@/models/Subscription";
import { SubscriptionPack } from "@/models/SubscriptionPack";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { cn } from "@/lib/utils";

interface ChangePlanModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription: Subscription | null;
}

export function ChangePlanModal({ open, onOpenChange, subscription }: ChangePlanModalProps) {
    const { subscriptionPacks, fetchingPacks, changePlan, changingPlan } = useSubscriptions();
    const [confirmPack, setConfirmPack] = useState<SubscriptionPack | null>(null);

    const handleConfirmChange = async () => {
        if (!subscription || !confirmPack) return;
        try {
            await changePlan({ subId: subscription.id, packId: confirmPack.id });
            setConfirmPack(null);
            onOpenChange(false);
        } catch {
            // errors handled in mutation onError
        }
    };

    const getButtonLabel = (pack: SubscriptionPack) => {
        const currentPrice = subscription?.pack?.price ?? null;
        if (currentPrice === null) return "Select";
        if (pack.price > currentPrice) return "Upgrade";
        if (pack.price < currentPrice) return "Downgrade";
        return "Select";
    };

    const availablePacks = subscriptionPacks?.filter((p) => !p.isDefault) ?? [];

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Change Plan</DialogTitle>
                        <DialogDescription>
                            Select a new plan. Billing will be adjusted automatically by Lemon Squeezy.
                        </DialogDescription>
                    </DialogHeader>

                    {fetchingPacks ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : availablePacks.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-6 text-center">No plans available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">
                            {availablePacks.map((pack) => {
                                const isCurrent = subscription?.pack?.id === pack.id;
                                const label = getButtonLabel(pack);
                                return (
                                    <div
                                        key={pack.id}
                                        className={cn(
                                            "relative flex flex-col p-6 rounded-2xl border transition-all",
                                            isCurrent
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                                        )}
                                    >
                                        {isCurrent && (
                                            <Badge className="absolute top-3 right-3 text-xs">
                                                Current plan
                                            </Badge>
                                        )}
                                        <h3 className="font-bold text-lg mb-1 pr-24">{pack.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
                                            {pack.getShortDescription()}
                                        </p>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-2xl font-black">{pack.getFormattedPrice()}</span>
                                            <span className="text-muted-foreground text-sm">
                                                /{pack.pricingType === "monthly" ? "mo" : pack.pricingType === "yearly" ? "yr" : "qtr"}
                                            </span>
                                        </div>
                                        <ul className="text-sm space-y-1.5 mb-6 flex-1 text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                {pack.maxBusinesses} business{pack.maxBusinesses !== 1 ? "es" : ""}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                {pack.maxEmployees} employees
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                {pack.maxMenus} menus
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                {pack.maxProducts} products
                                            </li>
                                        </ul>
                                        <Button
                                            variant={isCurrent ? "outline" : label === "Upgrade" ? "default" : "secondary"}
                                            disabled={isCurrent || changingPlan}
                                            onClick={() => !isCurrent && setConfirmPack(pack)}
                                        >
                                            {isCurrent ? "Current plan" : label}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!confirmPack} onOpenChange={(open) => !open && setConfirmPack(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Switch to {confirmPack?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Billing will be adjusted automatically by Lemon Squeezy.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={changingPlan}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmChange} disabled={changingPlan}>
                            {changingPlan ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm switch
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
