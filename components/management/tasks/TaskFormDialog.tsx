import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask, useUpdateTask } from "@/features/tasks/useTasks";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { Task, TaskStatus, getTaskStatusLabel } from "@/models/Task";

// ─── Task Form Dialog ─────────────────────────────────────────────────────────

const ALL_STATUSES: TaskStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ISSUE"];

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  businessId: string;
}

export function TaskFormDialog({ open, onOpenChange, task, businessId }: TaskFormDialogProps) {
  const { t } = useTranslation("management");
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToEmploymentId, setAssignedToEmploymentId] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>("NOT_STARTED");
  const [dueDate, setDueDate] = useState("");
  const [dueDateError, setDueDateError] = useState("");

  const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
  const { createTask, creatingTask } = useCreateTask(businessId);
  const { updateTask, updatingTask } = useUpdateTask(businessId, task?.id ?? "");

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setAssignedToEmploymentId(task?.assignedToEmploymentId ?? "");
      setStatus(task?.status ?? "NOT_STARTED");
      setDueDate(task?.dueDate ? task.dueDate.split("T")[0] : "");
      setDueDateError("");
    }
  }, [open, task]);

  const isPending = creatingTask || updatingTask;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) {
        setDueDateError(t("owner_tasks_page.form_dialog.due_date_error"));
        return;
      }
    }
    setDueDateError("");

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      assignedToEmploymentId: assignedToEmploymentId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    if (isEdit) {
      updateTask(
        { ...payload, assignedToEmploymentId: assignedToEmploymentId || null, status },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createTask(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("owner_tasks_page.form_dialog.edit_title") : t("owner_tasks_page.create_task")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("owner_tasks_page.form_dialog.edit_description")
              : t("owner_tasks_page.form_dialog.create_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">{t("owner_tasks_page.form_dialog.title_label")}</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("owner_tasks_page.form_dialog.title_placeholder")}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">{t("owner_tasks_page.form_dialog.description_label")}</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("owner_tasks_page.form_dialog.description_placeholder")}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-assignee">{t("owner_tasks_page.form_dialog.assignee_label")}</Label>
            <Select
              value={assignedToEmploymentId || "global"}
              onValueChange={(v) => setAssignedToEmploymentId(v === "global" ? "" : v)}
            >
              <SelectTrigger id="task-assignee">
                <SelectValue
                  placeholder={
                    fetchingEmployees
                      ? t("owner_tasks_page.form_dialog.assignee_loading")
                      : t("owner_tasks_page.form_dialog.assignee_global")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">{t("owner_tasks_page.form_dialog.assignee_global")}</SelectItem>
                {employees.map((emp) => {
                  const name =
                    emp.professionalProfile?.getDisplayName() ??
                    emp.professionalProfile?.workEmail ??
                    emp.id;
                  return (
                    <SelectItem key={emp.id} value={emp.id}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-due-date">{t("owner_tasks_page.form_dialog.due_date_label")}</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="max-w-xs"
            />
            {dueDateError && <p className="text-xs text-red-600">{dueDateError}</p>}
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-status">{t("staff_tasks.status_label")}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {getTaskStatusLabel(s, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("staff_tasks.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isPending || !title.trim()}
            >
              {isPending
                ? t("staff_tasks.saving")
                : isEdit
                ? t("owner_tasks_page.form_dialog.save_changes")
                : t("owner_tasks_page.create_task")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
