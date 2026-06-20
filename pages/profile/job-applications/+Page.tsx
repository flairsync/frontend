import React, { useState } from "react";
import { format } from "date-fns";
import { Briefcase, ExternalLink, FileText, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyApplications } from "@/features/jobs/useMyApplications";
import {
  APPLICATION_STATUS_COLORS,
  ApplicationStatus,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
} from "@/models/Job";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  gray: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_MESSAGES: Record<ApplicationStatus, string> = {
  pending: "Application received",
  reviewed: "Being reviewed",
  shortlisted: "You've been shortlisted!",
  accepted: "You've been accepted!",
  hired: "You're now part of the team!",
  rejected: "Not selected",
};

const ALL_TABS: Array<{ label: string; value: ApplicationStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
];

const JobApplicationsPage = () => {
  const [activeTab, setActiveTab] = useState<ApplicationStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { applications, totalPages, loadingApplications } = useMyApplications({
    page,
    limit: 10,
    status: activeTab !== "all" ? activeTab : undefined,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle>Job Applications</CardTitle>
        <a href="/jobs" className="text-sm text-primary hover:underline">
          Browse open jobs →
        </a>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
          {ALL_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadingApplications ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center border-2 border-dashed border-border rounded-2xl p-12">
            <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-base font-semibold mb-1">No applications yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't applied to any positions yet.
            </p>
            <a href="/jobs" className="text-primary hover:underline text-sm font-medium">
              Browse open jobs →
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {applications.map((app) => {
                const job = app.job;
                const colorKey = APPLICATION_STATUS_COLORS[app.status];
                const badgeClass = STATUS_BADGE_CLASSES[colorKey] ?? STATUS_BADGE_CLASSES.gray;

                return (
                  <div
                    key={app.id}
                    className={cn(
                      "rounded-xl border p-4",
                      app.status === "accepted" || app.status === "hired"
                        ? "border-green-300 bg-green-50/40 dark:border-green-800 dark:bg-green-950/20"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 border border-border shrink-0">
                        <AvatarImage src={job?.business?.logo} alt={job?.business?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {job?.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-xs text-muted-foreground">{job?.business?.name}</p>
                            <p className="font-semibold text-sm">{job?.title ?? "Job position"}</p>
                          </div>
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full shrink-0", badgeClass)}>
                            {STATUS_MESSAGES[app.status]}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job?.type && (
                            <Badge variant="secondary" className="text-xs">
                              {JOB_TYPE_LABELS[job.type]}
                            </Badge>
                          )}
                          {job?.category && (
                            <Badge variant="outline" className="text-xs">
                              {JOB_CATEGORY_LABELS[job.category]}
                            </Badge>
                          )}
                          {app.invitedAt && (
                            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                              Staff Invite Sent
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-muted-foreground">
                            Applied {format(new Date(app.createdAt), "MMM d, yyyy")}
                          </p>
                          <a
                            href={`/profile/job-applications/${app.id}`}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            View details <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JobApplicationsPage;
