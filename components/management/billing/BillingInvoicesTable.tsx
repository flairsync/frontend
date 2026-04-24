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
import { Receipt, Download, MoreHorizontal, CheckCircle, XCircle, LifeBuoy, FileText } from "lucide-react";
import { Subscription, SubscriptionStatus } from "@/models/Subscription";
import { useSubscriptions } from "@/features/subscriptions/useSubscriptions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionInvoicesSheet } from "./SubscriptionInvoicesSheet";

export function BillingInvoicesTable({ subscriptions }: { subscriptions: Subscription[] }) {
    const { syncSubscription } = useSubscriptions();
    const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    const handleShowInvoices = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setInvoiceSheetOpen(true);
    };

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
                                    <TableHead>ID</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Started At</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.map((subscription) => (
                                    <TableRow key={subscription.id}>
                                        <TableCell className="font-medium">{subscription.id}</TableCell>
                                        <TableCell>{subscription.pack?.name} ({subscription.pack?.pricingType})</TableCell>
                                        <TableCell>{subscription.getStartDate()}</TableCell>
                                        <TableCell>{subscription.pack.price} ({subscription.pack.currency})</TableCell>
                                        <TableCell
                                            className={
                                                subscription.status === SubscriptionStatus.ACTIVE
                                                    ? "text-green-600 font-medium"
                                                    : "text-red-500 font-medium"
                                            }
                                        >
                                            {subscription.status}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleShowInvoices(subscription)}>
                                                        <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                                                        <span>Show Invoices</span>
                                                    </DropdownMenuItem>
                                                    {(subscription.status === 'pending' || subscription.status === SubscriptionStatus.PAST_DUE) && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => syncSubscription(subscription.id)}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                <span>Resync</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {}}>
                                                                <LifeBuoy className="mr-2 h-4 w-4 text-blue-600" />
                                                                <span>Contact Support</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => {}} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                <span>Cancel</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-zinc-500 text-sm">No subscriptions found.</p>
                    )}
                </CardContent>
            </Card>

            {/* Invoices Sheet */}
            <SubscriptionInvoicesSheet
                open={invoiceSheetOpen}
                onOpenChange={setInvoiceSheetOpen}
                subscription={selectedSubscription}
            />
        </>
    );
}
