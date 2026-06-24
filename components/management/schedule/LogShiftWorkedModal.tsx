import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ClipboardCheck, UserX, CheckCircle2 } from "lucide-react";
import { useAttendance } from '@/features/shifts/useAttendance';
import { useBusinessBasicDetails } from '@/features/business/useBusinessBasicDetails';
import { getCurrencySymbol } from '@/utils/currency';
import { extractErrorMessage } from '@/utils/error-utils';
import { Shift } from '@/models/business/shift/Shift';
import { AttendanceLog } from '@/models/business/shift/Attendance';
import dayjs from '@/utils/date-utils';

function minutesToLabel(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

interface LogShiftWorkedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  businessId: string;
  onAlreadyHasAttendance?: (shiftId: string) => void;
}

export const LogShiftWorkedModal: React.FC<LogShiftWorkedModalProps> = ({
  open,
  onOpenChange,
  shift,
  businessId,
  onAlreadyHasAttendance,
}) => {
  const { logShiftWorked, isLoggingShiftWorked } = useAttendance(businessId);
  const { businessBasicDetails } = useBusinessBasicDetails(businessId);
  const businessTz = businessBasicDetails?.timezone || 'UTC';
  const currencySymbol = getCurrencySymbol(businessBasicDetails?.currency);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AttendanceLog | null>(null);

  const formatForInput = (utcStr: string) => {
    if (!utcStr) return '';
    try {
      return dayjs.utc(utcStr).tz(businessTz).format("YYYY-MM-DDTHH:mm");
    } catch {
      return '';
    }
  };

  const formatForApi = (localStr: string) => dayjs.tz(localStr, businessTz).toISOString();

  useEffect(() => {
    if (open && shift) {
      setCheckIn(formatForInput(shift.startTime));
      setCheckOut(formatForInput(shift.endTime));
      setNotes('');
      setErrorMessage(null);
      setResult(null);
    }
  }, [open, shift]);

  const checkoutAfterCheckin = () => {
    if (!checkIn || !checkOut) return true;
    return new Date(checkOut) > new Date(checkIn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift || !checkIn || !checkOut || !checkoutAfterCheckin()) return;

    setErrorMessage(null);
    try {
      const attendance = await logShiftWorked({
        shiftId: shift.id,
        data: {
          businessId,
          checkInTime: formatForApi(checkIn),
          checkOutTime: formatForApi(checkOut),
          notes: notes || undefined,
        },
      });
      setResult(attendance);
    } catch (error: any) {
      const msg = extractErrorMessage(error, "Failed to log shift as worked");
      if (msg.toLowerCase().includes('already has an attendance record')) {
        onOpenChange(false);
        onAlreadyHasAttendance?.(shift.id);
        return;
      }
      setErrorMessage(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-indigo-600" />
            Log Shift as Worked
          </DialogTitle>
          <DialogDescription>
            Resolve this no-show by entering the employee's real check-in and check-out times.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-800 text-sm">Shift marked as worked</p>
                <p className="text-xs text-emerald-600">The attendance record has been created and validated.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Worked</p>
                <p className="font-semibold text-foreground">{minutesToLabel(result.workedMinutes)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Overtime</p>
                <p className="font-semibold text-foreground">{minutesToLabel(result.overtimeMinutes)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Estimated Pay</p>
                <p className="font-semibold text-foreground">{currencySymbol}{Number(result.totalPay ?? 0).toFixed(2)}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
              <UserX className="h-4 w-4 shrink-0" />
              This shift was flagged as a no-show. Logging it as worked clears the unauthorized absence.
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="low-checkIn">Check-In Time</Label>
              <Input
                id="low-checkIn"
                type="datetime-local"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-checkOut">Check-Out Time</Label>
              <Input
                id="low-checkOut"
                type="datetime-local"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
              {checkOut && checkIn && !checkoutAfterCheckin() && (
                <p className="text-xs text-red-500">Check-out must be after check-in.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-notes">Notes</Label>
              <Textarea
                id="low-notes"
                placeholder="e.g. confirmed by phone call, forgot to clock in"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoggingShiftWorked || !checkIn || !checkOut || !checkoutAfterCheckin()}>
                {isLoggingShiftWorked ? "Saving..." : "Log as Worked"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
