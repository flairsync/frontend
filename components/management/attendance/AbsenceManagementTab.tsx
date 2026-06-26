import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, ExternalLink, ClipboardCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useAbsences } from "@/features/shifts/useAbsences";
import { AbsenceRecord, ABSENCE_TYPE_LABELS, ABSENCE_TYPE_BADGE_COLORS } from "@/models/business/shift/AbsenceRecord";
import AbsenceModal from "./AbsenceModal";
import { LogShiftWorkedModal } from "../schedule/LogShiftWorkedModal";
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

interface AbsenceManagementTabProps {
  businessId: string;
}

const AbsenceManagementTab = ({ businessId }: AbsenceManagementTabProps) => {
  const { t } = useTranslation("management");
  const { absences, fetchingAbsences, deleteAbsence, isDeleting } = useAbsences(businessId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AbsenceRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [logWorkedRecord, setLogWorkedRecord] = useState<AbsenceRecord | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("attendance_absences.heading")}</h2>
          <p className="text-muted-foreground text-sm">{t("attendance_absences.subtitle")}</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t("attendance_absences.add_absence")}
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_absences.col_employee")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_absences.col_date")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_absences.col_type")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_absences.col_notes")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_absences.col_document")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t("attendance_absences.col_recorded_by")}</TableHead>
              <TableHead className="font-semibold text-muted-foreground text-right pr-6">{t("attendance_absences.col_actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetchingAbsences ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))
            ) : absences.length > 0 ? (
              absences.map((absence) => {
                const employeeName = absence.employment
                  ? `${absence.employment.professionalProfile.firstName} ${absence.employment.professionalProfile.lastName}`
                  : absence.employmentId.slice(0, 8);
                const recordedBy = (absence as any).recordedBy
                  ? `${(absence as any).recordedBy.professionalProfile.firstName} ${(absence as any).recordedBy.professionalProfile.lastName}`
                  : t("attendance_absences.not_available");

                return (
                  <TableRow key={absence.id} className="hover:bg-muted/50">
                    <TableCell className="font-semibold text-foreground">{employeeName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(absence.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={`${ABSENCE_TYPE_BADGE_COLORS[absence.type]} border-none font-medium rounded-full`}
                        >
                          {ABSENCE_TYPE_LABELS[absence.type]}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`${absence.isPaid ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'} border-none font-medium rounded-full`}
                        >
                          {absence.isPaid ? t("attendance_absences.paid") : t("attendance_absences.unpaid")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {absence.notes ?? "—"}
                    </TableCell>
                    <TableCell>
                      {absence.documentUrl ? (
                        <a
                          href={absence.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          {t("attendance_absences.view_document")} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{recordedBy}</TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        {absence.shiftId && absence.shift && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t("attendance_absences.log_as_worked_title")}
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => setLogWorkedRecord(absence)}
                          >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => setEditingRecord(absence)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeletingId(absence.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                  {t("attendance_absences.no_records")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AbsenceModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        businessId={businessId}
      />

      {editingRecord && (
        <AbsenceModal
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
          businessId={businessId}
          existing={editingRecord}
        />
      )}

      <LogShiftWorkedModal
        open={!!logWorkedRecord}
        onOpenChange={(open) => !open && setLogWorkedRecord(null)}
        businessId={businessId}
        shift={logWorkedRecord?.shift ?? null}
        onAlreadyHasAttendance={() => {
          setLogWorkedRecord(null);
          toast.info(t("attendance_absences.already_has_attendance_toast"));
        }}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("attendance_absences.delete_dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("attendance_absences.delete_dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("attendance_absences.delete_dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletingId) {
                  deleteAbsence(deletingId, { onSuccess: () => setDeletingId(null) });
                }
              }}
            >
              {isDeleting ? t("attendance_absences.delete_dialog.deleting") : t("attendance_absences.delete_dialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AbsenceManagementTab;
