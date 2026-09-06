import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTaskStatus } from "@/features/tasks/useTasks";
import {
  Task,
  TaskStatus,
  TASK_ALLOWED_TRANSITIONS,
  getTaskStatusLabel,
} from "@/models/Task";

// ─── Status Update Dialog (for assignee quick-update with optional comment) ───

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  businessId: string;
  // True when the business requires staff to be clocked in to start a task
  // (settings_page.location.attendance.require_clock_in_tasks) and the current
  // user isn't. Blocks selecting/submitting IN_PROGRESS client-side so staff get
  // an immediate explanation instead of a failed request — the backend
  // (assertClockedInForTasks) is still the real enforcement point.
  blockStartWithoutClockIn?: boolean;
}

export function StatusUpdateDialog({ open, onOpenChange, task, businessId, blockStartWithoutClockIn }: StatusUpdateDialogProps) {
  const { t } = useTranslation("management");
  const [newStatus, setNewStatus] = useState<TaskStatus>("NOT_STARTED");
  const [comment, setComment] = useState("");
  const { updateTaskStatus, updatingStatus } = useUpdateTaskStatus(businessId);
  const blocksThisSelection = !!blockStartWithoutClockIn && newStatus === "IN_PROGRESS";

  useEffect(() => {
    if (open && task) {
      setNewStatus(task.status);
      setComment(task.comment ?? "");
    }
  }, [open, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    updateTaskStatus(
      { taskId: task.id, data: { status: newStatus, comment: comment.trim() || undefined } },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const allowedStatuses = task ? TASK_ALLOWED_TRANSITIONS[task.status] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("staff_tasks.update_status_dialog_title")}</DialogTitle>
          <DialogDescription>{t("staff_tasks.update_status_dialog_description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>{t("staff_tasks.status_label")}</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {getTaskStatusLabel(s, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {blocksThisSelection && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {t("staff_tasks.clock_in_required_to_start")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              {t("staff_tasks.comment_label")}{newStatus === "ISSUE" && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                newStatus === "ISSUE"
                  ? t("staff_tasks.describe_issue_placeholder")
                  : t("staff_tasks.optional_note_placeholder")
              }
              rows={3}
              required={newStatus === "ISSUE"}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatingStatus}
            >
              {t("staff_tasks.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={updatingStatus || (newStatus === "ISSUE" && !comment.trim()) || blocksThisSelection}
            >
              {updatingStatus ? t("staff_tasks.saving") : t("staff_tasks.update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
