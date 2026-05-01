import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AbsenceRecord,
    AbsenceType,
    ABSENCE_TYPE_LABELS,
    ABSENCE_TYPE_BADGE_COLORS,
    CreateAbsenceRecordDto,
    UpdateAbsenceRecordDto,
} from "@/models/business/shift/AbsenceRecord";
import { useAbsences } from "@/features/shifts/useAbsences";
import dayjs from "@/utils/date-utils";

const ABSENCE_TYPE_OPTIONS: AbsenceType[] = ['SICK_LEAVE', 'UNAUTHORIZED', 'PERSONAL_EMERGENCY', 'APPROVED_LEAVE'];

interface AbsenceFormState {
    type: AbsenceType;
    date: string;
    notes: string;
    documentUrl: string;
    employmentId: string;
    shiftId: string;
    attendanceId: string;
    timeOffRequestId: string;
}

const defaultForm = (): AbsenceFormState => ({
    type: 'SICK_LEAVE',
    date: dayjs().format('YYYY-MM-DD'),
    notes: '',
    documentUrl: '',
    employmentId: '',
    shiftId: '',
    attendanceId: '',
    timeOffRequestId: '',
});

interface Props {
    businessId: string;
}

const AbsenceLogPanel = ({ businessId }: Props) => {
    const { absences, fetchingAbsences, createAbsence, isCreating, updateAbsence, isUpdating, deleteAbsence, isDeleting } = useAbsences(businessId);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AbsenceRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AbsenceRecord | null>(null);
    const [form, setForm] = useState<AbsenceFormState>(defaultForm());

    const setField = <K extends keyof AbsenceFormState>(key: K, value: AbsenceFormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const openCreate = () => {
        setForm(defaultForm());
        setCreateOpen(true);
    };

    const openEdit = (record: AbsenceRecord) => {
        setEditTarget(record);
        setForm({
            type: record.type,
            date: record.date,
            notes: record.notes ?? '',
            documentUrl: record.documentUrl ?? '',
            employmentId: record.employmentId,
            shiftId: record.shiftId ?? '',
            attendanceId: record.attendanceId ?? '',
            timeOffRequestId: record.timeOffRequestId ?? '',
        });
    };

    const handleCreate = () => {
        if (!form.employmentId || !form.date || !form.type) return;
        const payload: CreateAbsenceRecordDto = {
            businessId,
            employmentId: form.employmentId,
            date: form.date,
            type: form.type,
            notes: form.notes || undefined,
            documentUrl: form.documentUrl || undefined,
            shiftId: form.shiftId || undefined,
            attendanceId: form.attendanceId || undefined,
            timeOffRequestId: form.timeOffRequestId || undefined,
        };
        createAbsence(payload, { onSuccess: () => setCreateOpen(false) });
    };

    const handleUpdate = () => {
        if (!editTarget) return;
        const payload: UpdateAbsenceRecordDto = {
            type: form.type,
            notes: form.notes || undefined,
            documentUrl: form.documentUrl || undefined,
        };
        updateAbsence({ absenceId: editTarget.id, data: payload }, { onSuccess: () => setEditTarget(null) });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteAbsence(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Absence Log</h2>
                <Button size="sm" onClick={openCreate}>Record Absence</Button>
            </div>

            {fetchingAbsences ? (
                <p className="text-sm text-muted-foreground">Loading absences…</p>
            ) : absences.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                    No absence records yet.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Linked Shift</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {absences.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="whitespace-nowrap">{record.date}</TableCell>
                                <TableCell>
                                    {record.employment
                                        ? `${record.employment.professionalProfile.firstName} ${record.employment.professionalProfile.lastName}`
                                        : record.employmentId}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ABSENCE_TYPE_BADGE_COLORS[record.type]}`}>
                                        {ABSENCE_TYPE_LABELS[record.type]}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {record.shift
                                        ? `${dayjs(record.shift.startTime).format('HH:mm')} – ${dayjs(record.shift.endTime).format('HH:mm')}`
                                        : '—'}
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-sm">{record.notes ?? '—'}</TableCell>
                                <TableCell>
                                    {record.documentUrl
                                        ? <a href={record.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">View</a>
                                        : '—'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => openEdit(record)}>Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteTarget(record)}>Delete</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Create modal */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Absence</DialogTitle>
                        <DialogDescription>Categorise a missed shift for a staff member.</DialogDescription>
                    </DialogHeader>
                    <AbsenceForm form={form} setField={setField} showEmploymentId />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isCreating || !form.employmentId || !form.date}>
                            {isCreating ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit modal */}
            <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Absence</DialogTitle>
                    </DialogHeader>
                    <AbsenceForm form={form} setField={setField} showEmploymentId={false} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete absence record?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the absence record for <strong>{deleteTarget?.date}</strong>. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting…" : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

interface AbsenceFormProps {
    form: AbsenceFormState;
    setField: <K extends keyof AbsenceFormState>(key: K, value: AbsenceFormState[K]) => void;
    showEmploymentId?: boolean;
}

const AbsenceForm = ({ form, setField, showEmploymentId }: AbsenceFormProps) => (
    <div className="space-y-3">
        {showEmploymentId && (
            <div className="space-y-1">
                <Label>Employment ID</Label>
                <Input
                    value={form.employmentId}
                    onChange={(e) => setField('employmentId', e.target.value)}
                    placeholder="Staff employment ID"
                />
            </div>
        )}
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setField('type', v as AbsenceType)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ABSENCE_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{ABSENCE_TYPE_LABELS[opt]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="e.g. Staff called in sick"
                rows={2}
            />
        </div>
        <div className="space-y-1">
            <Label>Document URL (Optional)</Label>
            <Input
                value={form.documentUrl}
                onChange={(e) => setField('documentUrl', e.target.value)}
                placeholder="e.g. https://storage.com/doctors-note.pdf"
            />
        </div>
        <div className="space-y-1">
            <Label>Time-Off Request ID (Optional)</Label>
            <Input
                value={form.timeOffRequestId}
                onChange={(e) => setField('timeOffRequestId', e.target.value)}
                placeholder="Link to approved time-off request"
            />
        </div>
    </div>
);

export default AbsenceLogPanel;
