import { format } from "date-fns";
import {
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
  Task,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  getAssigneeName,
} from "@/models/Task";
import { cn } from "@/lib/utils";

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onUpdateStatus: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onUpdateStatus }: TaskCardProps) {
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
