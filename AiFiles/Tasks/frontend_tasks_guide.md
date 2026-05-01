# Tasks Feature — Frontend Integration Guide

## Overview

The Tasks feature allows admins/owners to create tasks (global or assigned to a specific staff member). Staff can update the status of their assigned tasks and leave a comment when something is wrong.

---

## Data Model

```ts
type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ISSUE';

interface Task {
  id: string;
  businessId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedToEmploymentId: string | null; // null = global task (visible to all)
  assignedTo: {
    id: string;
    professionalProfile: {
      id: string;
      user: { id: string; email: string };
      // firstName, lastName if available from your profile entity
    };
  } | null;
  createdByUserId: string;
  comment: string | null; // Updated by the assignee, especially when status = ISSUE
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

---

## API Endpoints

All endpoints are under:
```
/businesses/:businessId/tasks
```

Authentication: cookie-based JWT (same as all other endpoints).

---

### 1. Create a Task

**Requires:** `TASKS: create` permission (admin/owner)

```
POST /businesses/:businessId/tasks
```

**Body:**
```json
{
  "title": "Clean the storage room",
  "description": "Make sure to check the expiry dates as well",  // optional
  "assignedToEmploymentId": "uuid-of-employment"                  // optional, omit for global
}
```

**Response:** The created `Task` object.

---

### 2. List All Tasks

**Requires:** `TASKS: read` permission

```
GET /businesses/:businessId/tasks
```

**Response:** Array of `Task` objects, ordered newest first.

**Filtering tip (client-side):**
- Global tasks: `task.assignedToEmploymentId === null`
- My tasks: `task.assignedToEmploymentId === currentUserEmploymentId`

---

### 3. Get a Single Task

**Requires:** `TASKS: read` permission

```
GET /businesses/:businessId/tasks/:taskId
```

**Response:** A single `Task` object with full relations.

---

### 4. Update a Task (Admin/Manager)

**Requires:** `TASKS: update` permission

Use this to edit title, description, reassign, or force a status change.

```
PATCH /businesses/:businessId/tasks/:taskId
```

**Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "assignedToEmploymentId": "new-employment-uuid",  // reassign
  "status": "IN_PROGRESS"                           // force status
}
```

**Response:** Updated `Task` object.

> Reassigning to a new employment triggers a push notification to the new assignee.

---

### 5. Update Task Status (Assignee / Staff)

**No special permission required** — any authenticated staff member with a professional profile can call this, but the backend enforces they are the assignee. Global tasks (no assignee) can be updated by anyone.

```
PATCH /businesses/:businessId/tasks/:taskId/status
```

**Body:**
```json
{
  "status": "ISSUE",
  "comment": "The supplier didn't deliver the cleaning products"  // optional
}
```

**Valid statuses:** `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED` | `ISSUE`

**Response:** Updated `Task` object.

---

### 6. Delete a Task

**Requires:** `TASKS: delete` permission

```
DELETE /businesses/:businessId/tasks/:taskId
```

**Response:** `204 No Content` (no body).

---

## Status Flow

```
NOT_STARTED → IN_PROGRESS → COMPLETED
                    ↓
                  ISSUE  (assignee leaves a comment explaining the problem)
                    ↓
              IN_PROGRESS  (after issue is resolved, admin can force back)
```

Display guidance:
| Status | Badge color | Icon suggestion |
|---|---|---|
| NOT_STARTED | Gray | Circle / clock |
| IN_PROGRESS | Blue | Spinner / arrow |
| COMPLETED | Green | Checkmark |
| ISSUE | Red/Orange | Warning triangle |

---

## UI Suggestions

### Admin / Owner View
- **Task list**: Table or card grid showing all tasks. Filter tabs: All / Global / By Staff Member.
- **Create button**: Opens a modal/sheet with title, description, and an optional staff picker (dropdown from employment list).
- **Task row actions**: Edit (pencil), Delete (trash), quick status badge.
- **Task detail drawer**: Shows full info, comment from assignee, option to reassign.

### Staff View
- **My Tasks**: Only shows tasks assigned to them + global tasks.
- **Status update**: A dropdown or segmented control on the task card to change status.
- **Comment field**: Appears/required when selecting `ISSUE` status.

---

## Notifications

When a task is assigned (or reassigned), the assignee receives a push notification:
- **Title:** `New Task Assigned`
- **Message:** `You have been assigned a new task: "<title>"`
- **Payload:** `{ taskId, businessId }`

Use the `payload.taskId` from the notification to deep-link directly to the task detail view.

---

## Permission Gating

Use the existing permission system to conditionally show/hide UI elements:

| Action | Required Permission |
|---|---|
| See "Create Task" button | `TASKS: create` |
| See task list | `TASKS: read` |
| Edit / Reassign task | `TASKS: update` |
| Delete task | `TASKS: delete` |
| Update own task status | No permission needed (staff always can) |

---

## Example Flows

### Admin creates a global task:
```
POST /businesses/biz-123/tasks
{ "title": "Check fire extinguishers" }
```

### Admin assigns a task to a staff member:
```
POST /businesses/biz-123/tasks
{
  "title": "Restock napkins at table section B",
  "assignedToEmploymentId": "emp-456"
}
→ Staff emp-456 receives a push notification
```

### Staff marks their task as having an issue:
```
PATCH /businesses/biz-123/tasks/task-789/status
{
  "status": "ISSUE",
  "comment": "The napkin supplier is out of stock until Thursday"
}
```

### Staff completes a task:
```
PATCH /businesses/biz-123/tasks/task-789/status
{ "status": "COMPLETED" }
```
