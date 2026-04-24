import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePageContext } from 'vike-react/usePageContext';
import { useShifts, useAllBusinessBids } from '@/features/shifts/useShifts';
import { formatInBusinessTimezone } from '@/utils/date-utils';
import { useMyBusiness } from '@/features/business/useMyBusiness';
import { Loader2, Inbox, AlertCircle, RefreshCw, Check, X, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ManagerScheduleBidsTab() {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id as string;
    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';

    const { data: bids, isFetching, error, refetch } = useAllBusinessBids(businessId);
    const { updateBidStatus, isUpdatingBidStatus } = useShifts(businessId);

    const pendingBids = (bids || []).filter((b: any) => b.status === "PENDING");

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Request Inbox
                        </CardTitle>
                        <CardDescription>Review and manage staff applications for open shifts.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-8">
                        <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {error ? (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error fetching bids</AlertTitle>
                        <AlertDescription className="flex flex-col gap-3">
                            <p>We encountered an issue while loading the bid requests. Please try again or contact support if the issue persists.</p>
                            <Button variant="outline" size="sm" className="w-fit" onClick={() => refetch()}>
                                Try Again
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : isFetching && !bids ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
                    </div>
                ) : pendingBids.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-xl flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Inbox className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-muted-foreground">Your inbox is clear</p>
                            <p className="text-sm text-muted-foreground/60">No pending shift bids at the moment.</p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="font-semibold">Staff Member</TableHead>
                                    <TableHead className="font-semibold">Shift Details</TableHead>
                                    <TableHead className="font-semibold">Applied</TableHead>
                                    <TableHead className="text-right font-semibold">Decisions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingBids.map((bid: any) => (
                                    <TableRow key={bid.id} className="hover:bg-muted/5 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">
                                                    {bid.employment?.professionalProfile?.displayName || 
                                                     `${bid.employment?.professionalProfile?.firstName || ''} ${bid.employment?.professionalProfile?.lastName || ''}`.trim() || 
                                                     'Unnamed Staff'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                                    ID: {bid.employmentId.split('-')[0]}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {formatInBusinessTimezone(bid.shift?.startTime, businessTz, 'ddd, MMM D')}
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-bold bg-primary/10 text-primary border-none">
                                                        OPEN
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatInBusinessTimezone(bid.shift?.startTime, businessTz, 'HH:mm')} - {formatInBusinessTimezone(bid.shift?.endTime, businessTz, 'HH:mm')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs italic">
                                            {formatInBusinessTimezone(bid.createdAt, businessTz, 'MMM D, HH:mm')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => updateBidStatus({ bidId: bid.id, status: 'REJECTED' })}
                                                    disabled={isUpdatingBidStatus}
                                                    title="Reject Application"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 gap-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                                    onClick={() => updateBidStatus({ bidId: bid.id, status: 'APPROVED' })}
                                                    disabled={isUpdatingBidStatus}
                                                >
                                                    {isUpdatingBidStatus ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5" />
                                                    )}
                                                    Approve
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
