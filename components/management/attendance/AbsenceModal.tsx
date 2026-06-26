import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAbsences } from "@/features/shifts/useAbsences";
import { AbsenceRecord, AbsenceType, ABSENCE_TYPE_LABELS } from "@/models/business/shift/AbsenceRecord";

interface AbsenceModalPrefill {
  employmentId: string;
  date: string;
  attendanceId?: string;
  shiftId?: string;
  employeeName?: string;
}

interface AbsenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  prefill?: AbsenceModalPrefill;
  existing?: AbsenceRecord;
}

const ABSENCE_TYPES: AbsenceType[] = [
  "SICK_LEAVE",
  "UNAUTHORIZED",
  "PERSONAL_EMERGENCY",
  "APPROVED_LEAVE",
];

const AbsenceModal = ({ open, onOpenChange, businessId, prefill, existing }: AbsenceModalProps) => {
  const { t } = useTranslation("management");
  const isEdit = !!existing;

  const [type, setType] = useState<AbsenceType>("SICK_LEAVE");
  const [isPaid, setIsPaid] = useState(true);
  const [date, setDate] = useState("");
  const [employmentId, setEmploymentId] = useState("");
  const [notes, setNotes] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [timeOffRequestId, setTimeOffRequestId] = useState("");

  const { createAbsence, isCreating, updateAbsence, isUpdating } = useAbsences(businessId);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setType(existing.type);
      setIsPaid(existing.isPaid);
      setDate(existing.date);
      setNotes(existing.notes ?? "");
      setDocumentUrl(existing.documentUrl ?? "");
      setTimeOffRequestId(existing.timeOffRequestId ?? "");
    } else {
      setType("SICK_LEAVE");
      setIsPaid(true);
      setDate(prefill?.date ?? "");
      setEmploymentId(prefill?.employmentId ?? "");
      setNotes("");
      setDocumentUrl("");
      setTimeOffRequestId("");
    }
  }, [open, existing, prefill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !type) return;

    if (isEdit && existing) {
      updateAbsence(
        { absenceId: existing.id, data: { type, isPaid, notes: notes || undefined, documentUrl: documentUrl || undefined } },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createAbsence(
        {
          businessId,
          employmentId: prefill?.employmentId ?? employmentId,
          date,
          type,
          isPaid,
          attendanceId: prefill?.attendanceId,
          shiftId: prefill?.shiftId,
          timeOffRequestId: timeOffRequestId || undefined,
          notes: notes || undefined,
          documentUrl: documentUrl || undefined,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const isPending = isCreating || isUpdating;
  const employeeName = existing?.employment
    ? `${existing.employment.professionalProfile.firstName} ${existing.employment.professionalProfile.lastName}`
    : prefill?.employeeName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("attendance_modals.absence.edit_title") : t("attendance_modals.absence.create_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {employeeName ? (
            <div className="space-y-1">
              <Label>{t("attendance_modals.absence.employee_label")}</Label>
              <p className="text-sm font-medium text-slate-700 bg-slate-50 rounded-md px-3 py-2">{employeeName}</p>
            </div>
          ) : !isEdit && !prefill?.employmentId ? (
            <div className="space-y-2">
              <Label htmlFor="employment-id">{t("attendance_modals.absence.employment_id_label")}</Label>
              <Input
                id="employment-id"
                placeholder={t("attendance_modals.absence.employment_id_placeholder")}
                value={employmentId}
                onChange={(e) => setEmploymentId(e.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="absence-date">{t("attendance_modals.absence.date_label")}</Label>
            <Input
              id="absence-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isEdit}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="absence-type">{t("attendance_modals.absence.type_label")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as AbsenceType)} required>
              <SelectTrigger id="absence-type">
                <SelectValue placeholder={t("attendance_modals.absence.type_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {ABSENCE_TYPES.map((absenceType) => (
                  <SelectItem key={absenceType} value={absenceType}>{ABSENCE_TYPE_LABELS[absenceType]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="absence-is-paid" checked={isPaid} onCheckedChange={setIsPaid} />
            <Label htmlFor="absence-is-paid">{t("attendance_modals.absence.paid_leave_label")}</Label>
          </div>

          {prefill?.attendanceId && (
            <div className="space-y-1">
              <Label>{t("attendance_modals.absence.linked_attendance_label")}</Label>
              <p className="text-xs text-slate-500 bg-slate-50 rounded px-3 py-2 font-mono">{prefill.attendanceId}</p>
            </div>
          )}

          {type === "APPROVED_LEAVE" && !isEdit && (
            <div className="space-y-2">
              <Label htmlFor="tor-id">{t("attendance_modals.absence.time_off_request_label")}</Label>
              <Input
                id="tor-id"
                placeholder={t("attendance_modals.absence.time_off_request_placeholder")}
                value={timeOffRequestId}
                onChange={(e) => setTimeOffRequestId(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="absence-notes">{t("attendance_modals.absence.notes_label")}</Label>
            <Textarea
              id="absence-notes"
              placeholder={t("attendance_modals.absence.notes_placeholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-url">{t("attendance_modals.absence.document_url_label")}</Label>
            <Input
              id="doc-url"
              type="url"
              placeholder={t("attendance_modals.absence.document_url_placeholder")}
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("attendance_modals.absence.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("attendance_modals.absence.saving") : isEdit ? t("attendance_modals.absence.update") : t("attendance_modals.absence.record_absence")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AbsenceModal;
