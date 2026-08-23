import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Unlock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
    ABSENCE_TYPE_BADGE_COLORS,
    CreateAbsenceRecordDto,
    UpdateAbsenceRecordDto,
} from "@/models/business/shift/AbsenceRecord";
import { useAbsences } from "@/features/shifts/useAbsences";
import dayjs from "@/utils/date-utils";

const ABSENCE_TYPE_OPTIONS: AbsenceType[] = ['SICK_LEAVE', 'UNAUTHORIZED', 'PERSONAL_EMERGENCY', 'APPROVED_LEAVE'];

interface AbsenceFormState {
    type: AbsenceType;
    isPaid: boolean;
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
    isPaid: true,
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
    const { t } = useTranslation("management");
    const {
        absences,
        fetchingAbsences,
        createAbsence,
        isCreating,
        updateAbsence,
        isUpdating,
        deleteAbsence,
        isDeleting,
        lockAbsence,
        isLocking,
        unlockAbsence,
        isUnlocking,
    } = useAbsences(businessId);

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
            isPaid: record.isPaid,
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
            isPaid: form.isPaid,
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
            businessId,
            type: form.type,
            isPaid: form.isPaid,
            notes: form.notes || undefined,
            documentUrl: form.documentUrl || undefined,
        };
        updateAbsence({ absenceId: editTarget.id, data: payload }, { onSuccess: () => setEditTarget(null) });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteAbsence(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    };

    const handleToggleLock = (record: AbsenceRecord) => {
        if (record.locked) {
            unlockAbsence(record.id);
        } else {
            lockAbsence(record.id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t("absence_log_panel.title")}</h2>
                <Button size="sm" onClick={openCreate}>{t("absence_log_panel.record_absence")}</Button>
            </div>

            {fetchingAbsences ? (
                <p className="text-sm text-muted-foreground">{t("absence_log_panel.loading")}</p>
            ) : absences.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                    {t("absence_log_panel.empty")}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("absence_log_panel.col_date")}</TableHead>
                            <TableHead>{t("absence_log_panel.col_employee")}</TableHead>
                            <TableHead>{t("absence_log_panel.col_type")}</TableHead>
                            <TableHead className="hidden lg:table-cell">{t("absence_log_panel.col_linked_shift")}</TableHead>
                            <TableHead className="hidden md:table-cell">{t("absence_log_panel.col_notes")}</TableHead>
                            <TableHead className="hidden lg:table-cell">{t("absence_log_panel.col_document")}</TableHead>
                            <TableHead className="sticky right-0 bg-background text-right">{t("absence_log_panel.col_actions")}</TableHead>
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
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ABSENCE_TYPE_BADGE_COLORS[record.type]}`}>
                                            {t(`absence_types.${record.type}`)}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${record.isPaid ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {record.isPaid ? t("absence_log_panel.paid") : t("absence_log_panel.unpaid")}
                                        </span>
                                        {record.locked && (
                                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                                <Lock className="h-3 w-3" /> {t("absence_log_panel.locked")}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                    {record.shift
                                        ? `${dayjs(record.shift.startTime).format('HH:mm')} – ${dayjs(record.shift.endTime).format('HH:mm')}`
                                        : '—'}
                                </TableCell>
                                <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm">{record.notes ?? '—'}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {record.documentUrl
                                        ? <a href={record.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">{t("absence_log_panel.view")}</a>
                                        : '—'}
                                </TableCell>
                                <TableCell className="sticky right-0 bg-background">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            title={t("absence_log_panel.edit")}
                                            aria-label={t("absence_log_panel.edit")}
                                            onClick={() => openEdit(record)}
                                            disabled={record.locked}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            title={t("absence_log_panel.delete")}
                                            aria-label={t("absence_log_panel.delete")}
                                            onClick={() => setDeleteTarget(record)}
                                            disabled={record.locked}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            title={record.locked ? t("absence_log_panel.unlock") : t("absence_log_panel.lock")}
                                            aria-label={record.locked ? t("absence_log_panel.unlock") : t("absence_log_panel.lock")}
                                            disabled={isLocking || isUnlocking}
                                            onClick={() => handleToggleLock(record)}
                                        >
                                            {record.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                        </Button>
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
                        <DialogTitle>{t("absence_log_panel.record_absence")}</DialogTitle>
                        <DialogDescription>{t("absence_log_panel.create_dialog.description")}</DialogDescription>
                    </DialogHeader>
                    <AbsenceForm form={form} setField={setField} showEmploymentId />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("absence_log_panel.cancel")}</Button>
                        <Button onClick={handleCreate} disabled={isCreating || !form.employmentId || !form.date}>
                            {isCreating ? t("absence_log_panel.saving") : t("absence_log_panel.save")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit modal */}
            <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("absence_log_panel.edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    {editTarget?.locked && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-4 py-3 text-sm font-medium">
                            <Lock className="h-4 w-4 shrink-0" />
                            {t("absence_log_panel.edit_dialog.locked_notice")}
                        </div>
                    )}
                    <AbsenceForm form={form} setField={setField} showEmploymentId={false} disabled={editTarget?.locked} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setEditTarget(null)}>{t("absence_log_panel.cancel")}</Button>
                        <Button onClick={handleUpdate} disabled={isUpdating || editTarget?.locked}>
                            {isUpdating ? t("absence_log_panel.saving") : t("absence_log_panel.save")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("absence_log_panel.delete_dialog.title")}</DialogTitle>
                        <DialogDescription>
                            {t("absence_log_panel.delete_dialog.description", { date: deleteTarget?.date })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("absence_log_panel.cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? t("absence_log_panel.deleting") : t("absence_log_panel.delete")}
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
    disabled?: boolean;
}

const AbsenceForm = ({ form, setField, showEmploymentId, disabled }: AbsenceFormProps) => {
    const { t } = useTranslation("management");
    return (
    <div className="space-y-3">
        {showEmploymentId && (
            <div className="space-y-1">
                <Label>{t("absence_log_panel.form.employment_id_label")}</Label>
                <Input
                    value={form.employmentId}
                    onChange={(e) => setField('employmentId', e.target.value)}
                    placeholder={t("absence_log_panel.form.employment_id_placeholder")}
                    disabled={disabled}
                />
            </div>
        )}
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label>{t("absence_log_panel.form.date_label")}</Label>
                <Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} disabled={disabled} />
            </div>
            <div className="space-y-1">
                <Label>{t("absence_log_panel.form.type_label")}</Label>
                <Select value={form.type} onValueChange={(v) => setField('type', v as AbsenceType)} disabled={disabled}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ABSENCE_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{t(`absence_types.${opt}`)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Switch id="absence-form-is-paid" checked={form.isPaid} onCheckedChange={(checked) => setField('isPaid', checked)} disabled={disabled} />
            <Label htmlFor="absence-form-is-paid">{t("absence_log_panel.form.paid_leave_label")}</Label>
        </div>
        <div className="space-y-1">
            <Label>{t("absence_log_panel.form.notes_label")}</Label>
            <Textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder={t("absence_log_panel.form.notes_placeholder")}
                rows={2}
                disabled={disabled}
            />
        </div>
        <div className="space-y-1">
            <Label>{t("absence_log_panel.form.document_url_label")}</Label>
            <Input
                value={form.documentUrl}
                onChange={(e) => setField('documentUrl', e.target.value)}
                placeholder={t("absence_log_panel.form.document_url_placeholder")}
                disabled={disabled}
            />
        </div>
        <div className="space-y-1">
            <Label>{t("absence_log_panel.form.time_off_request_id_label")}</Label>
            <Input
                value={form.timeOffRequestId}
                onChange={(e) => setField('timeOffRequestId', e.target.value)}
                placeholder={t("absence_log_panel.form.time_off_request_id_placeholder")}
                disabled={disabled}
            />
        </div>
    </div>
    );
};

export default AbsenceLogPanel;
