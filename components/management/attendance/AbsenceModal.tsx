import React, { useState, useEffect } from "react";
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
  const isEdit = !!existing;

  const [type, setType] = useState<AbsenceType>("SICK_LEAVE");
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
      setDate(existing.date);
      setNotes(existing.notes ?? "");
      setDocumentUrl(existing.documentUrl ?? "");
      setTimeOffRequestId(existing.timeOffRequestId ?? "");
    } else {
      setType("SICK_LEAVE");
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
        { absenceId: existing.id, data: { type, notes: notes || undefined, documentUrl: documentUrl || undefined } },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createAbsence(
        {
          businessId,
          employmentId: prefill?.employmentId ?? employmentId,
          date,
          type,
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
          <DialogTitle>{isEdit ? "Edit Absence Record" : "Record Absence"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {employeeName ? (
            <div className="space-y-1">
              <Label>Employee</Label>
              <p className="text-sm font-medium text-slate-700 bg-slate-50 rounded-md px-3 py-2">{employeeName}</p>
            </div>
          ) : !isEdit && !prefill?.employmentId ? (
            <div className="space-y-2">
              <Label htmlFor="employment-id">Employment ID</Label>
              <Input
                id="employment-id"
                placeholder="Employee employment UUID"
                value={employmentId}
                onChange={(e) => setEmploymentId(e.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="absence-date">Date</Label>
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
            <Label htmlFor="absence-type">Absence Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AbsenceType)} required>
              <SelectTrigger id="absence-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ABSENCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{ABSENCE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {prefill?.attendanceId && (
            <div className="space-y-1">
              <Label>Linked Attendance</Label>
              <p className="text-xs text-slate-500 bg-slate-50 rounded px-3 py-2 font-mono">{prefill.attendanceId}</p>
            </div>
          )}

          {type === "APPROVED_LEAVE" && !isEdit && (
            <div className="space-y-2">
              <Label htmlFor="tor-id">Linked Time-Off Request ID (optional)</Label>
              <Input
                id="tor-id"
                placeholder="UUID of the approved time-off request"
                value={timeOffRequestId}
                onChange={(e) => setTimeOffRequestId(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="absence-notes">Notes</Label>
            <Textarea
              id="absence-notes"
              placeholder="e.g. Doctor's appointment confirmed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-url">Document URL (optional)</Label>
            <Input
              id="doc-url"
              type="url"
              placeholder="https://... doctor's note or upload link"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update" : "Record Absence"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AbsenceModal;
