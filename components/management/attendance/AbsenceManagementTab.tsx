import React, { useState } from "react";
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
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAbsences } from "@/features/shifts/useAbsences";
import { AbsenceRecord, ABSENCE_TYPE_LABELS, ABSENCE_TYPE_BADGE_COLORS } from "@/models/business/shift/AbsenceRecord";
import AbsenceModal from "./AbsenceModal";
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
  const { absences, fetchingAbsences, deleteAbsence, isDeleting } = useAbsences(businessId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AbsenceRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Absence Log</h2>
          <p className="text-slate-500 text-sm">Manager-recorded absences for all staff.</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Absence
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Employee</TableHead>
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Type</TableHead>
              <TableHead className="font-semibold text-slate-600">Notes</TableHead>
              <TableHead className="font-semibold text-slate-600">Document</TableHead>
              <TableHead className="font-semibold text-slate-600">Recorded By</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right pr-6">Actions</TableHead>
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
                  : "—";

                return (
                  <TableRow key={absence.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-semibold text-slate-900">{employeeName}</TableCell>
                    <TableCell className="text-slate-600">
                      {format(parseISO(absence.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${ABSENCE_TYPE_BADGE_COLORS[absence.type]} border-none font-medium rounded-full`}
                      >
                        {ABSENCE_TYPE_LABELS[absence.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                      {absence.notes ?? "—"}
                    </TableCell>
                    <TableCell>
                      {absence.documentUrl ? (
                        <a
                          href={absence.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:underline text-sm"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{recordedBy}</TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          onClick={() => setEditingRecord(absence)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
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
                <TableCell colSpan={7} className="h-32 text-center text-slate-400 italic">
                  No absence records found.
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

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Absence Record</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the absence record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletingId) {
                  deleteAbsence(deletingId, { onSuccess: () => setDeletingId(null) });
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AbsenceManagementTab;
