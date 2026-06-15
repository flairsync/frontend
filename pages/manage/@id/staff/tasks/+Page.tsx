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
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  getAssigneeName,
} from "@/models/Task";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "all" | "mine" | "team";

const FILTER_TABS: Array<{ label: string; value: FilterTab }> = [
  { label: "All", value: "all" },
  { label: "My Tasks", value: "mine" },
  { label: "Team Tasks", value: "team" },
];

const ALL_STATUSES: TaskStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ISSUE"];

// ─── Status Update Dialog ─────────────────────────────────────────────────────

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  businessId: string;
}

function StatusUpdateDialog({ open, onOpenChange, task, businessId }: StatusUpdateDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>Change the task status and optionally add a comment.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Comment{newStatus === "ISSUE" && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                newStatus === "ISSUE" ? "Describe the issue..." : "Optional note..."
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
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={updatingStatus || (newStatus === "ISSUE" && !comment.trim())}
            >
              {updatingStatus ? "Saving..." : "Update"}
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
            {TASK_STATUS_LABELS[task.status]}
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
          <span>Created {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
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
        Update Status
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const StaffTasksPage = () => {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;

  const [filter, setFilter] = useState<FilterTab>("all");
  const [statusTarget, setStatusTarget] = useState<Task | null>(null);

  const { myEmployments, loadingMyEmployments } = useMyEmployments();
  const activeEmployment = myEmployments?.find((e) => e.business?.id === businessId);
  const myEmploymentId = activeEmployment?.id;

  const { tasks, loadingTasks } = useBusinessTasks(businessId);

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
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your assigned tasks and team-wide responsibilities.
        </p>
      </div>

      <Separator />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
          <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground mb-1">No tasks</p>
          <p className="text-sm text-muted-foreground">
            {filter === "mine"
              ? "You have no tasks assigned to you."
              : filter === "team"
              ? "There are no team-wide tasks right now."
              : "No tasks have been assigned yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onUpdateStatus={setStatusTarget} />
          ))}
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
