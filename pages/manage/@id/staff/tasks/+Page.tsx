import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { usePageContext } from "vike-react/usePageContext";
import { format } from "date-fns";
import {
  AlertTriangle,
  ClipboardList,
  Globe,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessTasks, useUpdateTaskStatus } from "@/features/tasks/useTasks";
import { useMyEmployments } from "@/features/business/employment/useMyEmployments";
import {
  Task,
  TaskStatus,
  TASK_ALLOWED_TRANSITIONS,
  TASK_STATUS_COLORS,
  getTaskStatusLabel,
  getAssigneeName,
} from "@/models/Task";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "all" | "mine" | "team";

const FILTER_TABS: Array<{ labelKey: string; value: FilterTab }> = [
  { labelKey: "staff_tasks.filters.all", value: "all" },
  { labelKey: "staff_tasks.filters.mine", value: "mine" },
  { labelKey: "staff_tasks.filters.team", value: "team" },
];

// ─── Status Update Dialog ─────────────────────────────────────────────────────

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  businessId: string;
}

function StatusUpdateDialog({ open, onOpenChange, task, businessId }: StatusUpdateDialogProps) {
  const { t } = useTranslation("management");
  const [newStatus, setNewStatus] = useState<TaskStatus>("NOT_STARTED");
  const [comment, setComment] = useState("");
  const { updateTaskStatus, updatingStatus } = useUpdateTaskStatus(businessId);

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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              {t("staff_tasks.comment_label")}{newStatus === "ISSUE" && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                newStatus === "ISSUE" ? t("staff_tasks.describe_issue_placeholder") : t("staff_tasks.optional_note_placeholder")
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
              disabled={updatingStatus || (newStatus === "ISSUE" && !comment.trim())}
            >
              {updatingStatus ? t("staff_tasks.saving") : t("staff_tasks.update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (task: Task) => void;
}

function TaskCard({ task, onUpdateStatus }: TaskCardProps) {
  const { t } = useTranslation("management");
  const isGlobal = task.assignedToEmploymentId === null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="font-semibold text-foreground">{task.title}</h3>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
              TASK_STATUS_COLORS[task.status],
            )}
          >
            {getTaskStatusLabel(task.status, t)}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {isGlobal ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
            {getAssigneeName(task.assignedTo)}
          </span>
          <span>{t("staff_tasks.created_on", { date: format(new Date(task.createdAt), "MMM d, yyyy") })}</span>
          {task.dueDate && <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>}
          {task.lastActionBy && (
            <span>Last updated by {getAssigneeName(task.lastActionBy)}</span>
          )}
        </div>

        {task.comment && (
          <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">{task.comment}</p>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => onUpdateStatus(task)}
      >
        {t("staff_tasks.update_status_button")}
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const StaffTasksPage = () => {
  const { t } = useTranslation("management");
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;

  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState<Task | null>(null);

  const { myEmployments, loadingMyEmployments } = useMyEmployments();
  const activeEmployment = myEmployments?.find((e) => e.business?.id === businessId);
  const myEmploymentId = activeEmployment?.id;

  const { tasks, totalPages, loadingTasks } = useBusinessTasks(businessId, { page, limit: 10 });

  const relevantTasks = tasks.filter(
    (t) => t.assignedToEmploymentId === null || t.assignedToEmploymentId === myEmploymentId,
  );

  const filtered = relevantTasks.filter((t) => {
    if (filter === "mine") return t.assignedToEmploymentId === myEmploymentId;
    if (filter === "team") return t.assignedToEmploymentId === null;
    return true;
  });

  const isLoading = loadingMyEmployments || loadingTasks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("staff_tasks.title")}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {t("staff_tasks.subtitle")}
        </p>
      </div>

      <Separator />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setFilter(tab.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("staff_tasks.loading")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
          <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground mb-1">{t("staff_tasks.empty_title")}</p>
          <p className="text-sm text-muted-foreground">
            {filter === "mine"
              ? t("staff_tasks.empty_mine")
              : filter === "team"
              ? t("staff_tasks.empty_team")
              : t("staff_tasks.empty_all")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onUpdateStatus={setStatusTarget} />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <StatusUpdateDialog
        open={!!statusTarget}
        onOpenChange={(v) => { if (!v) setStatusTarget(null); }}
        task={statusTarget}
        businessId={businessId}
      />
    </div>
  );
};

export default StaffTasksPage;
