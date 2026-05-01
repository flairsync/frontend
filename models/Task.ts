export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ISSUE';

export interface TaskAssignedTo {
  id: string;
  professionalProfile: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    user: { id: string; email: string };
  };
}

export interface Task {
  id: string;
  businessId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedToEmploymentId: string | null;
  assignedTo: TaskAssignedTo | null;
  createdByUserId: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ISSUE: 'Issue',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  NOT_STARTED: 'bg-zinc-100 text-zinc-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ISSUE: 'bg-red-100 text-red-700',
};

export function getAssigneeName(assignedTo: TaskAssignedTo | null): string {
  if (!assignedTo) return 'Global';
  const p = assignedTo.professionalProfile;
  if (p.displayName) return p.displayName;
  if (p.firstName || p.lastName) return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
  return p.user.email;
}
