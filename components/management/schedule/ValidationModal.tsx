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
import { useAttendance, useAttendanceById } from '@/features/shifts/useAttendance';
import { useProfile } from '@/features/profile/useProfile';
import { useBusinessBasicDetails } from '@/features/business/useBusinessBasicDetails';
import { usePageContext } from 'vike-react/usePageContext';
import { ShieldCheck, Lock } from 'lucide-react';
import dayjs from '@/utils/date-utils';
import { useTranslation } from 'react-i18next';

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
    const businessId = routeParams.id;
    const { businessBasicDetails } = useBusinessBasicDetails(businessId as string);
    const businessTz = businessBasicDetails?.timezone || 'UTC';

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [notes, setNotes] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const isAlreadyValidated = fullRecord?.lifecycleStatus === 'VALIDATED';
    const validatedByName = fullRecord?.validatedBy
        ? `${fullRecord.validatedBy.professionalProfile.firstName} ${fullRecord.validatedBy.professionalProfile.lastName}`
        : null;

    const formatForInput = (utcStr: string) => {
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

    const formatForApi = (localStr: string) => {
        return dayjs.tz(localStr, businessTz).toISOString();
    };

    const checkoutAfterCheckin = () => {
        if (!checkIn || !checkOut) return true;
        return new Date(checkOut) > new Date(checkIn);
    };

    const handleConfirmedSubmit = async () => {
        if (!userProfile?.id) return;

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
            setConfirmOpen(false);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch {
            // Error handled in useAttendance via toast
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAlreadyValidated) return;
        if (!checkoutAfterCheckin()) return;
        setConfirmOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            {t('schedule_modals.validation.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('schedule_modals.validation.description')}
                        </DialogDescription>
                    </DialogHeader>

                    {isAlreadyValidated ? (
                        <div className="py-4 space-y-3">
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-4 py-3 text-sm font-medium">
                                <Lock className="h-4 w-4 shrink-0" />
                                {t('schedule_modals.validation.already_validated')}
                            </div>
                            {validatedByName && (
                                <p className="text-sm text-slate-500">
                                    {fullRecord?.validatedAt
                                        ? t('schedule_modals.validation.validated_by_on', {
                                            name: validatedByName,
                                            date: dayjs(fullRecord.validatedAt).tz(businessTz).format("MMM D, YYYY HH:mm"),
                                        })
                                        : t('schedule_modals.validation.validated_by', { name: validatedByName })}
                                </p>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => onOpenChange(false)}>{t('schedule_modals.validation.close')}</Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                                    disabled={isValidatingAttendance || !checkoutAfterCheckin()}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {t('schedule_modals.validation.validate_record')}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
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
