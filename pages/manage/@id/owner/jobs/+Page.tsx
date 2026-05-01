import { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Briefcase,
  Copy,
  Edit,
  Trash2,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useBusinessJobs, useDeleteJob, useUpdateJob } from "@/features/jobs/useJobs";
import {
  Job,
  JobStatus,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
} from "@/models/Job";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<{ label: string; value: JobStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
];

const STATUS_BADGE: Record<JobStatus, string> = {
  open: "bg-green-100 text-green-700",
  draft: "bg-zinc-100 text-zinc-600",
  closed: "bg-red-100 text-red-700",
};

function copyJobLink(slug: string) {
  const url = `${window.location.origin}/jobs/${slug}`;
  navigator.clipboard.writeText(url);
  toast.success("Link copied! Share it on social media.");
}

const OwnerJobsPage = () => {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;

  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [closeTarget, setCloseTarget] = useState<Job | null>(null);

  const { jobs, totalPages, loadingJobs } = useBusinessJobs(businessId, {
    page,
    limit: 10,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { deleteJob, deletingJob } = useDeleteJob(businessId);
  const { updateJob: closeJob } = useUpdateJob(businessId, closeTarget?.id ?? "");

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteJob(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleClose = () => {
    if (!closeTarget) return;
    closeJob({ status: "closed" }, {
      onSuccess: () => setCloseTarget(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your open positions and review applicants.
          </p>
        </div>
        <Button
          onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs/new`; }}
        >
          + Post a Job
        </Button>
      </div>

      <Separator />

      {/* Status tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loadingJobs ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm text-zinc-500">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center border-2 border-dashed border-zinc-200 rounded-2xl p-16 bg-zinc-50/30">
          <Briefcase className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-lg font-semibold text-zinc-700 mb-1">No job postings yet</p>
          <p className="text-sm text-zinc-400 mb-4">
            Post your first job to start receiving applications.
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs/new`; }}
          >
            Post a Job
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-zinc-900">{job.title}</h3>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_BADGE[job.status])}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <Badge variant="secondary" className="text-xs">{JOB_TYPE_LABELS[job.type]}</Badge>
                  <Badge variant="outline" className="text-xs">{JOB_CATEGORY_LABELS[job.category]}</Badge>
                </div>

                <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
                  </span>
                  <span>Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
                  <span>{job.closesAt ? `Closes ${format(new Date(job.closesAt), "MMM d, yyyy")}` : "No deadline"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => copyJobLink(job.slug)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs/${job.id}/applications`; }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Applicants
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs/${job.id}/edit`; }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {job.status !== "closed" && (
                      <DropdownMenuItem onClick={() => setCloseTarget(job)}>
                        Close Position
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteTarget(job)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Close confirmation */}
      <AlertDialog open={!!closeTarget} onOpenChange={(v) => { if (!v) setCloseTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this position?</AlertDialogTitle>
            <AlertDialogDescription>
              "{closeTarget?.title}" will stop accepting new applications. This can be undone by editing the job.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>Close Position</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.title}" and all its applications. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingJob}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerJobsPage;
