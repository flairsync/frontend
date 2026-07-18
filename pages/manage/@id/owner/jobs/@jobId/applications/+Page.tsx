import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicantCard } from "@/components/management/jobs/ApplicantCard";
import { useBusinessJob, useJobApplications } from "@/features/jobs/useJobs";
import { ApplicationStatus, JOB_CATEGORY_LABELS, JOB_TYPE_LABELS } from "@/models/Job";
import { cn } from "@/lib/utils";

const ALL_TABS: Array<{ label: string; value: ApplicationStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Accepted", value: "accepted" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const JobApplicationsPage = () => {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;
  const jobId = routeParams.jobId;

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { job, loadingJob } = useBusinessJob(businessId, jobId);
  const {
    applications,
    totalPages,
    loadingApplications,
    updateApplicationStatus,
    updatingApplication,
  } = useJobApplications(businessId, jobId, {
    page,
    limit: 10,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <a
          href={`/manage/${businessId}/owner/jobs`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {loadingJob ? "Job Postings" : (job?.title ?? "Job Postings")}
        </a>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{job?.title ?? "Applicants"}</h1>
            {job && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {JOB_TYPE_LABELS[job.type]} · {JOB_CATEGORY_LABELS[job.category]}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
              <Users className="h-4 w-4" />
              {job?.applicationCount ?? 0} total
            </span>
            {job?.status && (
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  job.status === "open"
                    ? "bg-green-100 text-green-700"
                    : job.status === "draft"
                    ? "bg-muted text-muted-foreground"
                    : "bg-red-100 text-red-700"
                )}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 w-fit overflow-x-auto">
        {ALL_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
              statusFilter === tab.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applicant list */}
      {loadingApplications ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm text-muted-foreground">Loading applicants...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground mb-1">No applicants yet</p>
          <p className="text-sm text-muted-foreground">
            {statusFilter !== "all"
              ? "Try switching to a different filter tab."
              : "Share the job link to start receiving applications."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
          {applications.map((app) => (
            <ApplicantCard
              key={app.id}
              application={app}
              businessId={businessId}
              jobId={jobId}
              isUpdating={updatingApplication}
              onUpdateStatus={(applicationId, status, ownerNote) => {
                updateApplicationStatus({ applicationId, data: { status, ownerNote } });
              }}
            />
          ))}

          {/* Pagination */}
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
    </div>
  );
};

export default JobApplicationsPage;
