import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React from 'react'
import { Check, X } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { useTimeOff } from '@/features/shifts/useTimeOff'
import { useBusinessEmployees } from '@/features/business/employment/useBusinessEmployees'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { useProfile } from '@/features/profile/useProfile'
import { formatInBusinessTimezone } from '@/utils/date-utils'
import { useMyBusiness } from '@/features/business/useMyBusiness'

const ManagerScheduleTimeOffTab = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { requests, fetchingRequests, updateStatus } = useTimeOff(businessId as string);
    const { employees } = useBusinessEmployees(businessId as string);
    const { myBusinessFullDetails } = useMyBusiness(businessId as string);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';

    const getEmployeeName = (id: string) => {
        const emp = employees?.find(e => e.id === id);
        return emp?.professionalProfile?.displayName || emp?.professionalProfile?.firstName || 'Unknown Staff';
    };

    const { userProfile } = useProfile();

    const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
        updateStatus({ requestId: id, status, reviewerId: userProfile?.id || 'manager-id' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Time Off Requests</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Review and manage staff time off requests.</p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff Member</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fetchingRequests && (!requests || requests.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                            </TableRow>
                        ) : !requests || requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No time off requests found.</TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{getEmployeeName(request.employmentId)}</TableCell>
                                    <TableCell>
                                        {formatInBusinessTimezone(request.startDate, businessTz, 'MMM D')} - {formatInBusinessTimezone(request.endDate, businessTz, 'MMM D, yyyy')}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            request.status === 'APPROVED' ? 'default' :
                                                request.status === 'REJECTED' ? 'destructive' : 'secondary'
                                        }>
                                            {request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {request.status === 'PENDING' && (
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" className="text-green-600 hover:bg-green-50" onClick={() => handleAction(request.id, 'APPROVED')}>
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/5" onClick={() => handleAction(request.id, 'REJECTED')}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ManagerScheduleTimeOffTab
