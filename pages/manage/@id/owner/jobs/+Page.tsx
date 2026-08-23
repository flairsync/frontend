import { useState } from "react";
import { useTranslation } from "react-i18next";
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

const STATUS_BADGE: Record<JobStatus, string> = {
  open: "bg-green-100 text-green-700",
  draft: "bg-muted text-muted-foreground",
  closed: "bg-red-100 text-red-700",
};

const OwnerJobsPage = () => {
  const { t } = useTranslation("management");
  const { routeParams } = usePageContext();

  const STATUS_TABS: Array<{ label: string; value: JobStatus | "all" }> = [
    { label: t("owner_jobs_page.status.all"), value: "all" },
    { label: t("owner_jobs_page.status.open"), value: "open" },
    { label: t("owner_jobs_page.status.draft"), value: "draft" },
    { label: t("owner_jobs_page.status.closed"), value: "closed" },
  ];

  const jobStatusLabel = (status: JobStatus) => {
    switch (status) {
      case "open": return t("owner_jobs_page.status.open");
      case "draft": return t("owner_jobs_page.status.draft");
      case "closed": return t("owner_jobs_page.status.closed");
      default: return status;
    }
  };

  function copyJobLink(slug: string) {
    const url = `${window.location.origin}/jobs/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success(t("owner_jobs_page.link_copied"));
  }
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
          <h1 className="text-3xl font-bold tracking-tight">{t("owner_jobs_page.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t("owner_jobs_page.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs/new`; }}
        >
          + {t("owner_jobs_page.post_a_job")}
        </Button>
      </div>

      <Separator />

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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
          <p className="text-sm text-muted-foreground">{t("owner_jobs_page.loading_jobs")}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
          <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground mb-1">{t("owner_jobs_page.no_jobs_yet")}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {t("owner_jobs_page.no_jobs_hint")}
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs/new`; }}
          >
            {t("owner_jobs_page.post_a_job")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_BADGE[job.status])}>
                    {jobStatusLabel(job.status)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <Badge variant="secondary" className="text-xs">{JOB_TYPE_LABELS[job.type]}</Badge>
                  <Badge variant="outline" className="text-xs">{JOB_CATEGORY_LABELS[job.category]}</Badge>
                </div>

                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t("owner_jobs_page.applicant_count", { count: job.applicationCount })}
                  </span>
                  <span>{t("owner_jobs_page.posted_on", { date: format(new Date(job.createdAt), "MMM d, yyyy") })}</span>
                  <span>{job.closesAt ? t("owner_jobs_page.closes_on", { date: format(new Date(job.closesAt), "MMM d, yyyy") }) : t("owner_jobs_page.no_deadline")}</span>
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
                  {t("owner_jobs_page.copy_link")}
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
                      {t("owner_jobs_page.view_applicants")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs/${job.id}/edit`; }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("owner_jobs_page.edit")}
                    </DropdownMenuItem>
                    {job.status !== "closed" && (
                      <DropdownMenuItem onClick={() => setCloseTarget(job)}>
                        {t("owner_jobs_page.close_position")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteTarget(job)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("owner_jobs_page.delete")}
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
                {t("owner_jobs_page.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">{t("owner_jobs_page.page_of", { page, totalPages })}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                {t("owner_jobs_page.next")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Close confirmation */}
      <AlertDialog open={!!closeTarget} onOpenChange={(v) => { if (!v) setCloseTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("owner_jobs_page.close_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("owner_jobs_page.close_confirm_description", { title: closeTarget?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("owner_jobs_page.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>{t("owner_jobs_page.close_position")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("owner_jobs_page.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("owner_jobs_page.delete_confirm_description", { title: deleteTarget?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("owner_jobs_page.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingJob}
            >
              {t("owner_jobs_page.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerJobsPage;
