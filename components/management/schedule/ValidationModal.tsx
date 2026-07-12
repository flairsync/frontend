import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAttendance, useAttendanceById } from '@/features/shifts/useAttendance';
import { useProfile } from '@/features/profile/useProfile';
import { useBusinessBasicDetails } from '@/features/business/useBusinessBasicDetails';
import { usePageContext } from 'vike-react/usePageContext';
import { ShieldCheck, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import dayjs from '@/utils/date-utils';
import { useTranslation } from 'react-i18next';
import { BreakEntry } from '@/models/business/shift/Attendance';

interface BreakDraft {
    start: string; // datetime-local, business tz
    end: string; // datetime-local, business tz
    type: 'PAID' | 'UNPAID';
}

interface ValidationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendanceId: string;
    initialCheckIn: string;
    initialCheckOut: string;
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
    const { t } = useTranslation('management');
    const { validateAttendance, isValidatingAttendance } = useAttendance();
    const { data: fullRecord } = useAttendanceById(open ? attendanceId : undefined);
    const { userProfile } = useProfile();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id as string;
    const { businessBasicDetails } = useBusinessBasicDetails(businessId);
    const businessTz = businessBasicDetails?.timezone || 'UTC';

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [notes, setNotes] = useState('');
    const [breaks, setBreaks] = useState<BreakDraft[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const isCorrection = fullRecord?.lifecycleStatus === 'VALIDATED';
    const validatedByName = fullRecord?.validatedBy
        ? `${fullRecord.validatedBy.professionalProfile.firstName} ${fullRecord.validatedBy.professionalProfile.lastName}`
        : null;

    const formatForInput = (utcStr: string | null | undefined) => {
        if (!utcStr) return '';
        try {
            return dayjs.utc(utcStr).tz(businessTz).format("YYYY-MM-DDTHH:mm");
        } catch {
            return '';
        }
    };

    useEffect(() => {
        if (open) {
            setCheckIn(formatForInput(initialCheckIn));
            setCheckOut(formatForInput(initialCheckOut));
            setNotes('');
        }
    }, [open, initialCheckIn, initialCheckOut]);

    // Breaks come from the full record fetch, which lands after the modal opens — seed the
    // editable list once it's available (and reset it if a different record is opened).
    useEffect(() => {
        if (open && fullRecord?.id === attendanceId) {
            setBreaks(
                ((fullRecord.breaks ?? []) as BreakEntry[]).map((b) => ({
                    start: formatForInput(b.start),
                    end: formatForInput(b.end),
                    type: b.type,
                })),
            );
        }
    }, [open, fullRecord, attendanceId, businessTz]);

    const formatForApi = (localStr: string) => {
        return dayjs.tz(localStr, businessTz).toISOString();
    };

    const checkoutAfterCheckin = () => {
        if (!checkIn || !checkOut) return true;
        return new Date(checkOut) > new Date(checkIn);
    };

    const breaksAreValid = () =>
        breaks.every((b) => b.start && b.end && new Date(b.end) > new Date(b.start));

    const addBreak = () => setBreaks((prev) => [...prev, { start: '', end: '', type: 'UNPAID' }]);
    const removeBreak = (index: number) => setBreaks((prev) => prev.filter((_, i) => i !== index));
    const updateBreak = (index: number, patch: Partial<BreakDraft>) =>
        setBreaks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));

    const handleConfirmedSubmit = async () => {
        if (!userProfile?.id) return;

        const payload = {
            businessId,
            adminId: userProfile.id,
            updateData: {
                checkInTime: formatForApi(checkIn),
                checkOutTime: formatForApi(checkOut),
                notes,
                breaks: breaks.map((b) => ({
                    start: formatForApi(b.start),
                    end: formatForApi(b.end),
                    type: b.type,
                })),
            },
        };

        try {
            await validateAttendance({ attendanceId, data: payload });
            setConfirmOpen(false);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch {
            // Error handled in useAttendance via toast
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutAfterCheckin() || !breaksAreValid()) return;
        setConfirmOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[460px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            {isCorrection ? t('schedule_modals.validation.correction_title') : t('schedule_modals.validation.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {isCorrection ? t('schedule_modals.validation.correction_description') : t('schedule_modals.validation.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {isCorrection && (
                            <div className="flex items-start gap-2 bg-amber-50 text-amber-800 rounded-lg px-4 py-3 text-sm">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">{t('schedule_modals.validation.correction_warning')}</p>
                                    {validatedByName && (
                                        <p className="text-xs text-amber-700 mt-1">
                                            {fullRecord?.validatedAt
                                                ? t('schedule_modals.validation.validated_by_on', {
                                                    name: validatedByName,
                                                    date: dayjs(fullRecord.validatedAt).tz(businessTz).format("MMM D, YYYY HH:mm"),
                                                })
                                                : t('schedule_modals.validation.validated_by', { name: validatedByName })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="val-checkIn">{t('schedule_modals.validation.check_in_label')}</Label>
                            <Input
                                id="val-checkIn"
                                type="datetime-local"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="val-checkOut">{t('schedule_modals.validation.check_out_label')}</Label>
                            <Input
                                id="val-checkOut"
                                type="datetime-local"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                disabled={!initialCheckOut}
                                required={!!initialCheckOut}
                            />
                            {checkOut && checkIn && !checkoutAfterCheckin() && (
                                <p className="text-xs text-red-500">{t('schedule_modals.validation.checkout_after_checkin_error')}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>{t('schedule_modals.validation.breaks_label')}</Label>
                                <Button type="button" variant="ghost" size="sm" className="gap-1 h-7" onClick={addBreak}>
                                    <Plus className="h-3.5 w-3.5" />
                                    {t('schedule_modals.validation.add_break')}
                                </Button>
                            </div>
                            {breaks.length === 0 ? (
                                <p className="text-xs text-slate-400">{t('schedule_modals.validation.no_breaks')}</p>
                            ) : (
                                <div className="space-y-2">
                                    {breaks.map((b, i) => (
                                        <div key={i} className="flex flex-wrap items-center gap-1.5">
                                            <Input
                                                type="datetime-local"
                                                value={b.start}
                                                onChange={(e) => updateBreak(i, { start: e.target.value })}
                                                className="min-w-0 flex-1 basis-[8.5rem] text-xs"
                                                required
                                            />
                                            <Input
                                                type="datetime-local"
                                                value={b.end}
                                                onChange={(e) => updateBreak(i, { end: e.target.value })}
                                                className="min-w-0 flex-1 basis-[8.5rem] text-xs"
                                                required
                                            />
                                            <Select value={b.type} onValueChange={(v) => updateBreak(i, { type: v as 'PAID' | 'UNPAID' })}>
                                                <SelectTrigger className="w-24 shrink-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UNPAID">{t('schedule_modals.validation.break_unpaid')}</SelectItem>
                                                    <SelectItem value="PAID">{t('schedule_modals.validation.break_paid')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive shrink-0" onClick={() => removeBreak(i)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {breaks.some((b) => b.start && b.end && !(new Date(b.end) > new Date(b.start))) && (
                                        <p className="text-xs text-red-500">{t('schedule_modals.validation.break_order_error')}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="val-notes">{t('schedule_modals.validation.notes_label')}</Label>
                            <Textarea
                                id="val-notes"
                                placeholder={t('schedule_modals.validation.notes_placeholder')}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {t('schedule_modals.validation.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isValidatingAttendance || !checkoutAfterCheckin() || !breaksAreValid()}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isCorrection ? t('schedule_modals.validation.save_correction') : t('schedule_modals.validation.validate_record')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('schedule_modals.validation.confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('schedule_modals.validation.confirm_description_prefix')} <strong>{t('schedule_modals.validation.confirm_description_strong')}</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('schedule_modals.validation.go_back')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmedSubmit}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isValidatingAttendance ? t('schedule_modals.validation.validating') : t('schedule_modals.validation.confirm_and_lock')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
