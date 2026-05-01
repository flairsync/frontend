import React, { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Briefcase, ExternalLink, FileText, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyApplications } from "@/features/jobs/useMyApplications";
import {
  APPLICATION_STATUS_COLORS,
  ApplicationStatus,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
} from "@/models/Job";
import PublicFeedHeader from "@/components/feed/PublicFeedHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
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

const MyApplicationsPage = () => {
  const [activeTab, setActiveTab] = useState<ApplicationStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { applications, totalPages, loadingApplications } = useMyApplications({
    page,
    limit: 10,
    status: activeTab !== "all" ? activeTab : undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicFeedHeader />

      <main className="pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <a href="/jobs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Browse all positions
          </a>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track the status of your job applications.
            </p>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 overflow-x-auto">
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

          {/* Content */}
          {loadingApplications ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center border-2 border-dashed border-border rounded-2xl p-16 bg-card">
              <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-lg font-semibold mb-1">No applications yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't applied to any positions yet.
              </p>
              <a href="/jobs" className="text-primary hover:underline text-sm font-medium">
                Browse open jobs →
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app) => {
                const job = app.job;
                const colorKey = APPLICATION_STATUS_COLORS[app.status];
                const badgeClass = STATUS_BADGE_CLASSES[colorKey] ?? STATUS_BADGE_CLASSES.gray;

                return (
                  <Card
                    key={app.id}
                    className={cn(
                      "border",
                      app.status === "accepted"
                        ? "border-green-300 bg-green-50/40 dark:border-green-800 dark:bg-green-950/20"
                        : "border-border"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border border-border shrink-0">
                          <AvatarImage src={job?.business?.logo} alt={job?.business?.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {job?.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="text-xs text-muted-foreground truncate">{job?.business?.name}</p>
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
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                {app.resumeType === "file" ? (
                                  <FileText className="h-3 w-3" />
                                ) : (
                                  <Link className="h-3 w-3" />
                                )}
                                View Resume
                              </a>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-muted-foreground">
                              Applied on {format(new Date(app.createdAt), "MMM d, yyyy")}
                            </p>
                            <a
                              href={`/jobs/${app.jobId}/my-application`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              View details <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
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
            </div>
          )}
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default MyApplicationsPage;
