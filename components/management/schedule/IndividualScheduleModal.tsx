import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShifts } from "@/features/shifts/useShifts";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";
import { usePageContext } from "vike-react/usePageContext";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import dayjs from "@/utils/date-utils";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { Shift } from "@/models/business/shift/Shift";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserCheck, ShieldCheck, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useShiftBids } from "@/features/shifts/useShifts";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface IndividualScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultEmploymentId?: string | null;
    defaultDate?: string; // format YYYY-MM-DD
    shift?: Shift | null;
}

export const IndividualScheduleModal: React.FC<IndividualScheduleModalProps> = ({ 
    open, 
    onOpenChange, 
    defaultEmploymentId, 
    defaultDate,
    shift
}) => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id as string;

    const { employees: allEmployees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
    const employees = allEmployees?.filter(emp => emp.type !== 'OWNER') || [];
    
    const { businessRoles, loadingBusinessRoles } = useBusinessRoles(businessId);

    // We only need the mutations here, so we don't pass dates to avoid unnecessary (and infinite) fetches
    const { 
        createIndividualShift, 
        isCreatingIndividualShift,
        updateShift,
        isUpdatingShift
    } = useShifts(businessId);
    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';

    const [employmentId, setEmploymentId] = useState<string>("");
    const [isOpenShift, setIsOpenShift] = useState(false);
    const [dateInput, setDateInput] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("17:00");
    const [notes, setNotes] = useState<string>("");
    const [unpaidBreakMinutes, setUnpaidBreakMinutes] = useState<number>(0);
    const [requiredRoleId, setRequiredRoleId] = useState<string>("none");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data: bids, refetch: refetchBids } = useShiftBids(shift?.id);
    const { approveShiftBid, isApprovingBid } = useShifts(businessId);

    useEffect(() => {
        if (open) {
            if (shift) {
                const start = dayjs.utc(shift.startTime).tz(businessTz);
                const end = dayjs.utc(shift.endTime).tz(businessTz);
                setEmploymentId(shift.employmentId || "");
                setIsOpenShift(!shift.employmentId);
                setDateInput(start.format('YYYY-MM-DD'));
                setStartTime(start.format("HH:mm"));
                setEndTime(end.format("HH:mm"));
                setNotes(shift.notes || "");
                setUnpaidBreakMinutes(shift.unpaidBreakMinutes || 0);
                setRequiredRoleId(shift.requiredRoleId || "none");
            } else {
                setEmploymentId(defaultEmploymentId || "");
                setIsOpenShift(!defaultEmploymentId);
                setDateInput(defaultDate || dayjs().tz(businessTz).format("YYYY-MM-DD"));
                setStartTime("09:00");
                setEndTime("17:00");
                setNotes("");
                setUnpaidBreakMinutes(0);
                setRequiredRoleId("none");
            }
            setErrorMessage(null);
        }
    }, [open, defaultEmploymentId, defaultDate, shift]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!isOpenShift && !employmentId) || !dateInput || !startTime || !endTime) return;

        // Construct local time strings in the business timezone
        const startLocalStr = `${dateInput}T${startTime}:00`;
        let startObj = dayjs.tz(startLocalStr, businessTz);
        
        let endLocalStr = `${dateInput}T${endTime}:00`;
        let endObj = dayjs.tz(endLocalStr, businessTz);

        // Handle overnight shifts
        if (endObj.isBefore(startObj)) {
            endObj = endObj.add(1, 'day');
        }

        const payload: any = {
            startTime: startObj.toISOString(),
            endTime: endObj.toISOString(),
            notes,
            unpaidBreakMinutes: unpaidBreakMinutes > 0 ? unpaidBreakMinutes : undefined,
            requiredRoleId: requiredRoleId === "none" ? undefined : requiredRoleId
        };

        if (shift) {
            updateShift({
                shiftId: shift.id,
                data: {
                    ...payload,
                    employmentId: isOpenShift ? null : employmentId
                }
            }, {
                onSuccess: () => onOpenChange(false),
                onError: (error: any) => {
                    const msg = error.response?.data?.message || "Failed to update shift";
                    setErrorMessage(msg);
                }
            });
        } else {
            createIndividualShift({
                ...payload,
                employmentId: isOpenShift ? undefined : employmentId,
            }, {
                onSuccess: () => onOpenChange(false),
                onError: (error: any) => {
                    const msg = error.response?.data?.message || "Failed to create shift";
                    setErrorMessage(msg);
                }
            });
        }
    };

    const handleApproveBid = (bidId: string) => {
        approveShiftBid(bidId, {
            onSuccess: () => {
                toast.success("Bid approved and shift assigned!");
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{shift ? "Edit Employee Shift" : "Schedule Employee Shift"}</DialogTitle>
                        {shift && shift.isPublished && (
                            <Badge 
                                variant={
                                    shift.staffResponse === 'ACCEPTED' ? 'outline' : 
                                    shift.staffResponse === 'REJECTED' ? 'destructive' : 
                                    'secondary'
                                }
                                className={shift.staffResponse === 'ACCEPTED' ? 'border-emerald-500 text-emerald-700 bg-emerald-50 flex items-center gap-1 font-bold' : 'flex items-center gap-1 font-bold'}
                            >
                                {shift.staffResponse === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3" />}
                                {shift.staffResponse === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                {(!shift.staffResponse || shift.staffResponse === 'PENDING') && <Clock className="w-3 h-3" />}
                                {shift.staffResponse || 'PENDING RESPONSE'}
                            </Badge>
                        )}
                    </div>
                    <DialogDescription>
                        {shift ? "Update details for this shift." : "Assign a shift to an individual employee."}
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[80vh]">
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        <div className="space-y-4 pt-4 pr-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Post as Open Shift</Label>
                                    <p className="text-[10px] text-muted-foreground">Allows any eligible staff to bid or claim.</p>
                                </div>
                                <Switch 
                                    checked={isOpenShift} 
                                    onCheckedChange={(checked) => {
                                        setIsOpenShift(checked);
                                        if (checked) setEmploymentId("");
                                    }} 
                                />
                            </div>

                            {!isOpenShift && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Label>Select Employee</Label>
                                    <Select value={employmentId} onValueChange={setEmploymentId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={fetchingEmployees ? "Loading employees..." : "Choose an employee"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees?.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || 'Unnamed Staff'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input 
                                    type="date" 
                                    value={dateInput} 
                                    onChange={e => setDateInput(e.target.value)} 
                                    required 
                                />
                                {dateInput && dayjs.tz(dateInput, businessTz).isBefore(dayjs().tz(businessTz).startOf('day')) && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-1 font-medium">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Warning: You are scheduling a shift in the past.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Start Time</Label>
                                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">End Time</Label>
                                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Required Role (Optional)</Label>
                                <Select value={requiredRoleId} onValueChange={setRequiredRoleId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingBusinessRoles ? "Loading roles..." : "Choose a required role"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No specific role required</SelectItem>
                                        {businessRoles?.map(role => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">If set, the system will verify the employee has this role.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes (Optional)</Label>
                                <Input 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    placeholder="e.g. Front desk duty"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Unpaid Break (Minutes)</Label>
                                <Input 
                                    type="number"
                                    min="0"
                                    step="5"
                                    value={unpaidBreakMinutes} 
                                    onChange={e => setUnpaidBreakMinutes(Number(e.target.value))} 
                                    placeholder="e.g. 30"
                                />
                                <p className="text-[10px] text-muted-foreground">This time will be deducted from paid hours.</p>
                            </div>

                            {shift && !shift.employmentId && bids && bids.length > 0 && (
                                <div className="mt-6 pt-6 border-t font-semibold space-y-4 px-1">
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                        <UserCheck className="w-4 h-4" />
                                        <span>Recent Applicants ({bids.length})</span>
                                    </div>
                                    <div className="space-y-3">
                                        {bids.map((bid: any) => (
                                            <div key={bid.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/10">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {bid.employment?.professionalProfile?.displayName || 
                                                         `${bid.employment?.professionalProfile?.firstName || ''} ${bid.employment?.professionalProfile?.lastName || ''}`.trim() || 
                                                         'Staff Member'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Applied {dayjs(bid.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                                    onClick={() => handleApproveBid(bid.id)}
                                                    disabled={isApprovingBid}
                                                >
                                                    {isApprovingBid ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                                                    Approve
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t bg-background">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isCreatingIndividualShift || isUpdatingShift || (!isOpenShift && !employmentId) || !dateInput}>
                            {isCreatingIndividualShift || isUpdatingShift ? "Saving..." : shift ? "Update Shift" : isOpenShift ? "Post Open Shift" : "Schedule Employee"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
