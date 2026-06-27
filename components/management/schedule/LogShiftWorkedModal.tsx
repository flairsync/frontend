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
import { useTranslation } from 'react-i18next';

function minutesToLabel(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

interface LogShiftWorkedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Pick<Shift, 'id' | 'startTime' | 'endTime'> | null;
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
  const { t } = useTranslation('management');
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
      const msg = extractErrorMessage(error, t('schedule_modals.log_shift_worked.fallback_error'));
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
            {t('schedule_modals.log_shift_worked.title')}
          </DialogTitle>
          <DialogDescription>
            {t('schedule_modals.log_shift_worked.description')}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-800 text-sm">{t('schedule_modals.log_shift_worked.success_title')}</p>
                <p className="text-xs text-emerald-600">{t('schedule_modals.log_shift_worked.success_description')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">{t('schedule_modals.log_shift_worked.worked_label')}</p>
                <p className="font-semibold text-foreground">{minutesToLabel(result.workedMinutes)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">{t('schedule_modals.log_shift_worked.overtime_label')}</p>
                <p className="font-semibold text-foreground">{minutesToLabel(result.overtimeMinutes)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">{t('schedule_modals.log_shift_worked.estimated_pay_label')}</p>
                <p className="font-semibold text-foreground">{currencySymbol}{Number(result.totalPay ?? 0).toFixed(2)}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>{t('schedule_modals.log_shift_worked.done')}</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
              <UserX className="h-4 w-4 shrink-0" />
              {t('schedule_modals.log_shift_worked.no_show_notice')}
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="low-checkIn">{t('schedule_modals.log_shift_worked.check_in_label')}</Label>
              <Input
                id="low-checkIn"
                type="datetime-local"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-checkOut">{t('schedule_modals.log_shift_worked.check_out_label')}</Label>
              <Input
                id="low-checkOut"
                type="datetime-local"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
              {checkOut && checkIn && !checkoutAfterCheckin() && (
                <p className="text-xs text-red-500">{t('schedule_modals.log_shift_worked.checkout_after_checkin_error')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-notes">{t('schedule_modals.log_shift_worked.notes_label')}</Label>
              <Textarea
                id="low-notes"
                placeholder={t('schedule_modals.log_shift_worked.notes_placeholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('schedule_modals.log_shift_worked.cancel')}
              </Button>
              <Button type="submit" disabled={isLoggingShiftWorked || !checkIn || !checkOut || !checkoutAfterCheckin()}>
                {isLoggingShiftWorked ? t('schedule_modals.log_shift_worked.saving') : t('schedule_modals.log_shift_worked.log_as_worked')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
