import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Share2,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { fetchPublicJobBySlugApiCall } from "@/features/jobs/service";
import { useMyApplicationForJob } from "@/features/jobs/useMyApplications";
import { Job, JOB_CATEGORY_LABELS, JOB_TYPE_LABELS } from "@/models/Job";
import PublicFeedHeader from "@/components/feed/PublicFeedHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";

function ApplyButton({ job, user }: { job: Job; user: any }) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const existingApplication = useMyApplicationForJob(job.id);

  const isClosed =
    job.status === "closed" ||
    (job.closesAt != null && new Date(job.closesAt) < new Date());

  const hasApplied = applied || !!existingApplication;

  if (isClosed) {
    return (
      <Button disabled size="lg">
        Position Closed
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-100 px-3 py-2 rounded-lg">
          <CheckCircle2 className="h-4 w-4" />
          Applied{existingApplication ? ` on ${format(new Date(existingApplication.createdAt), "MMM d")}` : " ✓"}
        </span>
        {existingApplication && (
          <a
            href={`/jobs/${job.id}/my-application`}
            className="text-sm text-primary hover:underline font-medium"
          >
            View my application →
          </a>
        )}
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(`/jobs/${job.slug}`);
    return (
      <Button
        size="lg"
        onClick={() => { window.location.href = `/login?returnTo=${returnTo}`; }}
      >
        Sign in to Apply
      </Button>
    );
  }

  if (!user.hasPP) {
    return (
      <Button
        size="lg"
        onClick={() => { window.location.href = "/manage/join"; }}
      >
        Complete Profile to Apply
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" onClick={() => setApplyOpen(true)}>
        Apply Now
      </Button>
      <ApplyModal
        job={job}
        open={applyOpen}
        onOpenChange={setApplyOpen}
        onSuccess={() => setApplied(true)}
      />
    </>
  );
}

const JobDetailPage = () => {
  const { routeParams, user } = usePageContext() as any;
  const slug = routeParams.slug;

  const { data: job, isPending: loading, isError } = useQuery<Job>({
    queryKey: ["public_job", slug],
    queryFn: async () => {
      const resp = await fetchPublicJobBySlugApiCall(slug);
      return resp.data.data;
    },
    enabled: !!slug,
    retry: false,
  });

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied! Share it on Facebook, WhatsApp, or wherever you recruit.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicFeedHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <WebsiteFooter />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-background">
        <PublicFeedHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <Briefcase className="h-10 w-10 text-muted-foreground/40" />
          <h1 className="text-2xl font-bold">Position no longer available</h1>
          <p className="text-muted-foreground max-w-sm">
            This job posting has been removed or is no longer accepting applications.
          </p>
          <a href="/jobs" className="text-primary hover:underline text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Browse all positions
          </a>
        </div>
        <WebsiteFooter />
      </div>
    );
  }

  const locationLabel = job.location ?? job.business?.city ?? null;
  const isClosed =
    job.status === "closed" ||
    (job.closesAt != null && new Date(job.closesAt) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <PublicFeedHeader />

      <main className="pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Back */}
          <a href="/jobs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Browse all positions
          </a>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border border-border shadow-sm shrink-0">
                  <AvatarImage src={job.business?.logo} alt={job.business?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {job.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground mb-0.5">{job.business?.name}</p>
                  <h1 className="text-2xl font-bold leading-snug">{job.title}</h1>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{JOB_TYPE_LABELS[job.type]}</Badge>
                    <Badge variant="outline">{JOB_CATEGORY_LABELS[job.category]}</Badge>
                    {isClosed && (
                      <Badge className="bg-destructive/10 text-destructive border-0">Closed</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {locationLabel && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {locationLabel}
                  </span>
                )}
                {job.salaryRange && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" /> {job.salaryRange}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
                </span>
                {job.closesAt && (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <Calendar className="h-4 w-4" />
                    Closes {format(new Date(job.closesAt), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border-b border-border">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                About this role
              </h2>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 flex flex-wrap items-center gap-3">
              <ApplyButton job={job} user={user} />
              <Button variant="outline" onClick={copyLink} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default JobDetailPage;
