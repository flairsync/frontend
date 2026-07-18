import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Receipt,
    MoreHorizontal,
    LifeBuoy,
    FileText,
    RefreshCw,
    ExternalLink,
    LayoutGrid,
    RotateCcw,
    XCircle,
} from "lucide-react";
import { Subscription, SubscriptionStatus } from "@/models/Subscription";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import { SubscriptionInvoicesSheet } from "./SubscriptionInvoicesSheet";
import { ChangePlanModal } from "./ChangePlanModal";
import { cn } from "@/lib/utils";

const CANCELLABLE_STATUSES: SubscriptionStatus[] = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.ON_TRIAL,
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.PAST_DUE,
];

const PLAN_CHANGEABLE_STATUSES: SubscriptionStatus[] = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.ON_TRIAL,
    SubscriptionStatus.TRIALING,
];

function StatusBadge({ subscription }: { subscription: Subscription }) {
    switch (subscription.status) {
        case SubscriptionStatus.ACTIVE:
            return (
                <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
                    Active · Renews {subscription.getRenewalDate("MMMM D, YYYY") ?? "N/A"}
                </Badge>
            );
        case SubscriptionStatus.ON_TRIAL:
        case SubscriptionStatus.TRIALING:
            return (
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">
                    Trial · Ends {subscription.getRenewalDate("MMMM D, YYYY") ?? "N/A"}
                </Badge>
            );
        case SubscriptionStatus.CANCELED: {
            const endsAt = subscription.getEndDate("MMMM D, YYYY");
            return (
                <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
                    Canceled{endsAt ? ` · Access until ${endsAt}` : ""}
                </Badge>
            );
        }
        case SubscriptionStatus.PAST_DUE:
            return (
                <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                    Payment Failed
                </Badge>
            );
        case SubscriptionStatus.PENDING:
            return (
                <Badge className="bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-100">
                    Activating…
                </Badge>
            );
        case SubscriptionStatus.EXPIRED:
            return (
                <Badge className="bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-100">
                    Expired
                </Badge>
            );
        default:
            return <Badge variant="outline">{subscription.status}</Badge>;
    }
}

export function BillingInvoicesTable({ subscriptions }: { subscriptions: Subscription[] }) {
    const {
        syncSubscriptionAsync,
        cancelSubscription,
        resumeSubscription,
        fetchPortalUrl,
    } = useSubscriptions();

    const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [changePlanSub, setChangePlanSub] = useState<Subscription | null>(null);
    const [cancelConfirmSub, setCancelConfirmSub] = useState<Subscription | null>(null);
    const [activeSyncId, setActiveSyncId] = useState<string | null>(null);
    const [activeCancelId, setActiveCancelId] = useState<string | null>(null);
    const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

    const handleShowInvoices = (sub: Subscription) => {
        setSelectedSubscription(sub);
        setInvoiceSheetOpen(true);
    };

    const handleSync = async (sub: Subscription) => {
        setActiveSyncId(sub.id);
        try {
            await syncSubscriptionAsync(sub.id);
        } finally {
            setActiveSyncId(null);
        }
    };

    const handleCancelConfirm = async () => {
        if (!cancelConfirmSub) return;
        setActiveCancelId(cancelConfirmSub.id);
        setCancelConfirmSub(null);
        try {
            await cancelSubscription(cancelConfirmSub.id);
        } finally {
            setActiveCancelId(null);
        }
    };

    const handleResume = async (sub: Subscription) => {
        setActiveResumeId(sub.id);
        try {
            await resumeSubscription(sub.id);
        } finally {
            setActiveResumeId(null);
        }
    };

    const handleOpenPortal = async () => {
        try {
            const url = await fetchPortalUrl();
            if (url) window.open(url, "_blank");
        } catch {
            // error handled in mutation
        }
    };

    const isCanceledWithFutureAccess = (sub: Subscription) =>
        sub.status === SubscriptionStatus.CANCELED && sub.endsAt != null && sub.endsAt > new Date();

    return (
        <>
            <Card className="border border-zinc-200 shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-zinc-700" />
                        Subscriptions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {subscriptions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Started</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.map((sub) => {
                                    const isCancelled = isCanceledWithFutureAccess(sub);
                                    const canCancel = CANCELLABLE_STATUSES.includes(sub.status);
                                    const canResume = isCancelled;
                                    const canChangePlan = PLAN_CHANGEABLE_STATUSES.includes(sub.status);
                                    const isPending = sub.status === SubscriptionStatus.PENDING;
                                    const isExpired = sub.status === SubscriptionStatus.EXPIRED;
                                    const isPastDue = sub.status === SubscriptionStatus.PAST_DUE;
                                    const syncingThis = activeSyncId === sub.id;
                                    const cancelingThis = activeCancelId === sub.id;
                                    const resumingThis = activeResumeId === sub.id;

                                    return (
                                        <React.Fragment key={sub.id}>
                                            <TableRow className={cn(isCancelled && "bg-amber-50/50")}>
                                                <TableCell className="font-medium">
                                                    {sub.pack?.name}
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        ({sub.pack?.pricingType})
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {sub.getStartDate()}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {sub.pack?.price} {sub.pack?.currency}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge subscription={sub} />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                                            title="Refresh status"
                                                            disabled={syncingThis}
                                                            onClick={() => handleSync(sub)}
                                                        >
                                                            <RefreshCw className={cn("h-3.5 w-3.5", syncingThis && "animate-spin")} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {/* Primary CTA button per status */}
                                                        {isPending && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={syncingThis}
                                                                onClick={() => handleSync(sub)}
                                                            >
                                                                {syncingThis ? (
                                                                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                                                                ) : (
                                                                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                                                )}
                                                                Refresh status
                                                            </Button>
                                                        )}
                                                        {isExpired && (
                                                            <a href="/manage/plans">
                                                                <Button size="sm" variant="default">
                                                                    Re-subscribe
                                                                </Button>
                                                            </a>
                                                        )}
                                                        {canResume && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                disabled={resumingThis}
                                                                onClick={() => handleResume(sub)}
                                                            >
                                                                {resumingThis ? (
                                                                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                                                                ) : (
                                                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                                                )}
                                                                Resume
                                                            </Button>
                                                        )}

                                                        {/* Dropdown for secondary actions */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                                <DropdownMenuItem onClick={() => handleShowInvoices(sub)}>
                                                                    <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                                                                    Show Invoices
                                                                </DropdownMenuItem>

                                                                {canChangePlan && (
                                                                    <DropdownMenuItem onClick={() => setChangePlanSub(sub)}>
                                                                        <LayoutGrid className="mr-2 h-4 w-4 text-violet-600" />
                                                                        Change Plan
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {isPastDue && (
                                                                    <DropdownMenuItem onClick={handleOpenPortal}>
                                                                        <ExternalLink className="mr-2 h-4 w-4 text-orange-600" />
                                                                        Billing Portal
                                                                    </DropdownMenuItem>
                                                                )}

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem onClick={() => handleSync(sub)} disabled={syncingThis}>
                                                                    <RefreshCw className={cn("mr-2 h-4 w-4 text-green-600", syncingThis && "animate-spin")} />
                                                                    {syncingThis ? "Syncing…" : "Refresh status"}
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem>
                                                                    <LifeBuoy className="mr-2 h-4 w-4 text-blue-600" />
                                                                    Contact Support
                                                                </DropdownMenuItem>

                                                                {canCancel && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            disabled={cancelingThis}
                                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                            onClick={() => setCancelConfirmSub(sub)}
                                                                        >
                                                                            <XCircle className="mr-2 h-4 w-4" />
                                                                            {cancelingThis ? "Cancelling…" : "Cancel subscription"}
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Warning banner for canceled subscriptions with future access */}
                                            {isCancelled && (
                                                <TableRow className="bg-amber-50 hover:bg-amber-50">
                                                    <TableCell colSpan={5} className="py-2 px-4">
                                                        <p className="text-amber-700 text-sm">
                                                            Your subscription is cancelled and will end on{" "}
                                                            <strong>{sub.getEndDate("MMMM D, YYYY")}</strong>.
                                                            You can resume at any time before that date.
                                                        </p>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-zinc-500 text-sm">No subscriptions found.</p>
                    )}
                </CardContent>
            </Card>

            {/* Cancel confirmation dialog */}
            <AlertDialog
                open={!!cancelConfirmSub}
                onOpenChange={(open) => !open && setCancelConfirmSub(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You'll keep access until{" "}
                            <strong>
                                {cancelConfirmSub?.getRenewalDate("MMMM D, YYYY") ?? "the end of your billing period"}
                            </strong>
                            . You can resume at any time before that date.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            onClick={handleCancelConfirm}
                        >
                            Yes, cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Change Plan modal */}
            <ChangePlanModal
                open={!!changePlanSub}
                onOpenChange={(open) => !open && setChangePlanSub(null)}
                subscription={changePlanSub}
            />

            {/* Invoices sheet */}
            <SubscriptionInvoicesSheet
                open={invoiceSheetOpen}
                onOpenChange={setInvoiceSheetOpen}
                subscription={selectedSubscription}
            />
        </>
    );
}
