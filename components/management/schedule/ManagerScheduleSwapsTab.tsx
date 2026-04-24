import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React from 'react'
import { Check, X, ArrowRightLeft } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { useShiftSwaps } from '@/features/shifts/useShiftSwaps'
import { useBusinessEmployees } from '@/features/business/employment/useBusinessEmployees'
import { useShifts } from '@/features/shifts/useShifts'
import { Badge } from '@/components/ui/badge'
import { formatInBusinessTimezone } from '@/utils/date-utils'

const ManagerScheduleSwapsTab = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { swaps, fetchingSwaps, updateStatus, isUpdatingStatus } = useShiftSwaps(businessId);
    const { employees } = useBusinessEmployees(businessId);
    const { shifts } = useShifts(businessId);

    const getEmployeeName = (id: string) => {
        const emp = employees?.find(e => e.id === id);
        return emp?.professionalProfile?.displayName || emp?.professionalProfile?.firstName || 'Unknown';
    };

    const getShiftInfo = (shiftId: string) => {
        const shift = shifts?.find(s => s.id === shiftId);
        if (!shift) return 'Unknown Shift';
        // Get timezone if we can
        return `${formatInBusinessTimezone(shift.startTime, 'UTC', 'MMM D, HH:mm')} - ${formatInBusinessTimezone(shift.endTime, 'UTC', 'HH:mm')}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shift Swaps</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Final approval for shift swaps between employees.</p>
            </CardHeader>
            <CardContent>
                {fetchingSwaps ? (
                    <div className="p-8 text-center text-muted-foreground">Loading swaps...</div>
                ) : swaps?.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>No active shift swaps requiring approval.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shift</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead></TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {swaps?.map((swap) => (
                                <TableRow key={swap.id}>
                                    <TableCell className="font-medium">{getShiftInfo(swap.shiftId)}</TableCell>
                                    <TableCell>{getEmployeeName(swap.fromEmploymentId)}</TableCell>
                                    <TableCell>
                                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                                    </TableCell>
                                    <TableCell>{getEmployeeName(swap.toEmploymentId)}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            swap.status === 'PENDING' ? 'secondary' :
                                            swap.status === 'ACCEPTED' ? 'outline' :
                                            swap.status === 'APPROVED' ? 'default' :
                                            'destructive'
                                        }>
                                            {swap.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {swap.status === 'ACCEPTED' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    disabled={isUpdatingStatus}
                                                    onClick={() => updateStatus({ swapId: swap.id, status: 'APPROVED' })}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                            )}
                                            {['PENDING', 'ACCEPTED'].includes(swap.status) && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/5"
                                                    disabled={isUpdatingStatus}
                                                    onClick={() => updateStatus({ swapId: swap.id, status: 'REJECTED' })}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

export default ManagerScheduleSwapsTab
