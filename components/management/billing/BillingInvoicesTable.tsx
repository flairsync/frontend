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
import { Receipt, Download } from "lucide-react";
import { Subscription, SubscriptionStatus } from "@/models/Subscription";

export function BillingInvoicesTable({ subscriptions }: { subscriptions: Subscription[] }) {
    return (
        <Card className="border border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-zinc-700" />
                    Invoices
                </CardTitle>
            </CardHeader>
            <CardContent>
                {subscriptions.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
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
                                    <TableCell>{subscription.startedAt ? subscription.startedAt.toString() : " --- "}</TableCell>
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
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Download</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-zinc-500 text-sm">No invoices found.</p>
                )}
            </CardContent>
        </Card>
    );
}
