import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { usePageContext } from "vike-react/usePageContext";
import { format } from "date-fns";
import {
  ClipboardList,
  Edit,
  Trash2,
  ChevronDown,
  AlertTriangle,
  Globe,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  useBusinessTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  useUpdateTaskStatus,
} from "@/features/tasks/useTasks";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import {
  Task,
  TaskStatus,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  getAssigneeName,
} from "@/models/Task";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "all" | "global" | "assigned";

const FILTER_TABS: Array<{ label: string; value: FilterTab }> = [
  { label: "All", value: "all" },
  { label: "Global", value: "global" },
  { label: "Assigned", value: "assigned" },
];

const ALL_STATUSES: TaskStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ISSUE"];

// ─── Task Form Dialog ─────────────────────────────────────────────────────────

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  businessId: string;
}

function TaskFormDialog({ open, onOpenChange, task, businessId }: TaskFormDialogProps) {
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToEmploymentId, setAssignedToEmploymentId] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>("NOT_STARTED");

  const { employees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
  const { createTask, creatingTask } = useCreateTask(businessId);
  const { updateTask, updatingTask } = useUpdateTask(businessId, task?.id ?? "");

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setAssignedToEmploymentId(task?.assignedToEmploymentId ?? "");
      setStatus(task?.status ?? "NOT_STARTED");
    }
  }, [open, task]);

  const isPending = creatingTask || updatingTask;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      assignedToEmploymentId: assignedToEmploymentId || undefined,
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
          <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update task details, reassign, or force a status change."
              : "Add a new task for your team. Leave assignee blank for a global task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean the storage room"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details or instructions..."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-assignee">Assign to (optional)</Label>
            <Select
              value={assignedToEmploymentId || "global"}
              onValueChange={(v) => setAssignedToEmploymentId(v === "global" ? "" : v)}
            >
              <SelectTrigger id="task-assignee">
                <SelectValue
                  placeholder={
                    fetchingEmployees ? "Loading staff..." : "Global (visible to all)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (visible to all)</SelectItem>
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

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger id="task-status">
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
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPending || !title.trim()}
            >
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status Update Dialog (for assignee quick-update with optional comment) ───

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
                newStatus === "ISSUE"
                  ? "Describe the issue..."
                  : "Optional note..."
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onUpdateStatus: (task: Task) => void;
}

function TaskCard({ task, onEdit, onDelete, onUpdateStatus }: TaskCardProps) {
  const isGlobal = task.assignedToEmploymentId === null;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="font-semibold text-zinc-900">{task.title}</h3>
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
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-500">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 shrink-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onUpdateStatus(task)}>
            Update Status
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={() => onDelete(task)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const OwnerTasksPage = () => {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;

  const [filter, setFilter] = useState<FilterTab>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [statusTarget, setStatusTarget] = useState<Task | null>(null);

  const { tasks, loadingTasks } = useBusinessTasks(businessId);
  const { deleteTask, deletingTask } = useDeleteTask(businessId);

  const filtered = tasks.filter((t) => {
    if (filter === "global") return t.assignedToEmploymentId === null;
    if (filter === "assigned") return t.assignedToEmploymentId !== null;
    return true;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTask(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Create and manage tasks for your team.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
        >
          + Create Task
        </Button>
      </div>

      <Separator />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm text-zinc-500">Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center border-2 border-dashed border-zinc-200 rounded-2xl p-16 bg-zinc-50/30">
          <ClipboardList className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-lg font-semibold text-zinc-700 mb-1">No tasks yet</p>
          <p className="text-sm text-zinc-400 mb-4">
            Create your first task to get your team organized.
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setCreateOpen(true)}
          >
            Create Task
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onUpdateStatus={setStatusTarget}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        businessId={businessId}
      />

      {/* Edit dialog */}
      <TaskFormDialog
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        task={editTarget}
        businessId={businessId}
      />

      {/* Status update dialog */}
      <StatusUpdateDialog
        open={!!statusTarget}
        onOpenChange={(v) => { if (!v) setStatusTarget(null); }}
        task={statusTarget}
        businessId={businessId}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingTask}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerTasksPage;
