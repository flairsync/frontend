import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { usePageContext } from "vike-react/usePageContext";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  useBusinessTasks,
  useDeleteTask,
} from "@/features/tasks/useTasks";
import { Task } from "@/models/Task";
import { cn } from "@/lib/utils";
import { TaskFormDialog } from "@/components/management/tasks/TaskFormDialog";
import { StatusUpdateDialog } from "@/components/management/tasks/StatusUpdateDialog";
import { TaskCard } from "@/components/management/tasks/TaskCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "all" | "global" | "assigned";

const FILTER_TABS: Array<{ label: string; value: FilterTab }> = [
  { label: "All", value: "all" },
  { label: "Global", value: "global" },
  { label: "Assigned", value: "assigned" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const OwnerTasksPage = () => {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;

  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [statusTarget, setStatusTarget] = useState<Task | null>(null);

  const { tasks, totalPages, loadingTasks } = useBusinessTasks(businessId, { page, limit: 10 });
  const { deleteTask, deletingTask } = useDeleteTask(businessId);

  // Filter tabs apply client-side to the current page of results — a task on
  // another page won't show up in a tab until you page to it.
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
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
          <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground mb-1">No tasks yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first task to get your team organized.
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
