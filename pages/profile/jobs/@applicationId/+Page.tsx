import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import { format } from "date-fns";
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  FileText,
  Link,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useMyApplicationByAppId } from "@/features/jobs/useMyApplications";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
} from "@/models/Job";
import { ProApplicationTimeline } from "@/components/jobs/ApplicationTimeline";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  gray: "bg-zinc-100 text-zinc-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

const JobApplicationDetailPage = () => {
  const { routeParams } = usePageContext() as any;
  const applicationId = routeParams.applicationId;

  const { application, loadingApplication, isError } = useMyApplicationByAppId(applicationId);

  if (loadingApplication) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Briefcase className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-lg font-semibold">Application not found</p>
        <p className="text-sm text-muted-foreground">
          We couldn't find this application. It may have been removed.
        </p>
        <a href="/profile/jobs" className="text-primary hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </a>
      </div>
    );
  }

  const job = application.job;
  const colorKey = APPLICATION_STATUS_COLORS[application.status];
  const badgeClass = STATUS_BADGE_CLASSES[colorKey] ?? STATUS_BADGE_CLASSES.gray;

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <a
        href="/profile/jobs"
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </a>

      {/* Staff invite banner */}
      {application.status === "accepted" && application.invitedAt && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30 px-5 py-4 flex items-start gap-3">
          <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
              You've been invited to join the team!
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
              A staff invitation was sent on {format(new Date(application.invitedAt), "MMM d, yyyy")}. Check your email inbox.
            </p>
          </div>
        </div>
      )}

      {/* Job header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border border-border shrink-0">
              <AvatarImage src={job?.business?.logo} alt={job?.business?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {job?.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{job?.business?.name}</p>
              <h1 className="text-xl font-bold leading-snug">{job?.title ?? "Job position"}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {job?.type && <Badge variant="secondary" className="text-xs">{JOB_TYPE_LABELS[job.type]}</Badge>}
                {job?.category && <Badge variant="outline" className="text-xs">{JOB_CATEGORY_LABELS[job.category]}</Badge>}
                {job?.location && <Badge variant="outline" className="text-xs">{job.location}</Badge>}
              </div>
            </div>

            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full shrink-0", badgeClass)}>
              {APPLICATION_STATUS_LABELS[application.status]}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}</span>
            {job?.slug && (
              <a href={`/jobs/${job.slug}`} className="flex items-center gap-1 text-primary hover:underline">
                View job listing <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resume */}
      {application.resumeUrl && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="text-sm font-semibold mb-3">Resume</h2>
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {application.resumeType === "file" ? (
                <FileText className="h-4 w-4" />
              ) : (
                <Link className="h-4 w-4" />
              )}
              View resume
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Cover letter */}
      {application.coverLetter && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="text-sm font-semibold mb-3">Cover Letter</h2>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{application.coverLetter}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {application.events && application.events.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="text-sm font-semibold mb-4">Application Timeline</h2>
            <ProApplicationTimeline
              events={application.events}
              currentStatus={application.status}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobApplicationDetailPage;
