import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAttendance } from '@/features/shifts/useAttendance';
import { useProfile } from '@/features/profile/useProfile';
import { useMyBusiness } from '@/features/business/useMyBusiness';
import { usePageContext } from 'vike-react/usePageContext';
import dayjs from '@/utils/date-utils';

interface ValidationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendanceId: string;
    initialCheckIn: string; // ISO or YYYY-MM-DD HH:mm:ss
    initialCheckOut: string; // ISO or YYYY-MM-DD HH:mm:ss
    onSuccess?: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
    open,
    onOpenChange,
    attendanceId,
    initialCheckIn,
    initialCheckOut,
    onSuccess,
}) => {
    const { validateAttendance, isValidatingAttendance } = useAttendance();
    const { userProfile } = useProfile();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { myBusinessFullDetails } = useMyBusiness(businessId as string);
    const businessTz = myBusinessFullDetails?.timezone || 'UTC';

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (open) {
            // Convert UTC string to local business timezone for HTML5 datetime-local input
            const formatForInput = (utcStr: string) => {
                if (!utcStr) return '';
                try {
                    return dayjs.utc(utcStr).tz(businessTz).format("YYYY-MM-DDTHH:mm");
                } catch (e) {
                    return '';
                }
            };

            setCheckIn(formatForInput(initialCheckIn));
            setCheckOut(formatForInput(initialCheckOut));
            setNotes('');
        }
    }, [open, initialCheckIn, initialCheckOut]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.id) return;

        // Convert local time back to UTC ISO string before submitting
        const formatForApi = (localStr: string) => {
            return dayjs.tz(localStr, businessTz).toISOString();
        };

        const payload = {
            adminId: userProfile.id,
            updateData: {
                checkInTime: formatForApi(checkIn),
                checkOutTime: formatForApi(checkOut),
                notes,
            },
        };

        try {
            await validateAttendance({ attendanceId, data: payload });
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            // Error is handled in useAttendance via toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Validate Shift</DialogTitle>
                    <DialogDescription>
                        Review and adjust the clocked times before validating this shift.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="checkIn">Check-In Time</Label>
                        <Input
                            id="checkIn"
                            type="datetime-local"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="checkOut">Check-Out Time</Label>
                        <Input
                            id="checkOut"
                            type="datetime-local"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any validation notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isValidatingAttendance}>
                            {isValidatingAttendance ? "Validating..." : "Confirm Validation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
