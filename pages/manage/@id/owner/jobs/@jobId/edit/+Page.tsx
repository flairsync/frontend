import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JobForm } from "@/components/management/jobs/JobForm";
import { useBusinessJob, useUpdateJob } from "@/features/jobs/useJobs";
import { UpdateJobDto } from "@/features/jobs/service";

const EditJobPage = () => {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;
  const jobId = routeParams.jobId;

  const { job, loadingJob } = useBusinessJob(businessId, jobId);
  const { updateJob, updatingJob } = useUpdateJob(businessId, jobId);

  const handleSubmit = (data: UpdateJobDto) => {
    updateJob(data, {
      onSuccess: (resp: any) => {
        const updated = resp?.data?.data;
        if (updated?.slug && updated.slug !== job?.slug) {
          toast.info("Job title changed — the shareable link has been updated.");
        }
      },
    });
  };

  const copyLink = async () => {
    if (!job) return;
    const url = `${window.location.origin}/jobs/${job.slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied! Share it on social media.");
  };

  if (loadingJob) {
    return (
      <div className="p-6 flex items-center gap-3 text-zinc-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        Loading job...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <p className="text-zinc-500">Job not found.</p>
        <a href={`/manage/${businessId}/owner/jobs`} className="text-blue-600 hover:underline text-sm mt-2 block">
          ← Back to Job Postings
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <a
            href={`/manage/${businessId}/owner/jobs`}
            className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Postings
          </a>
          <h1 className="text-2xl font-bold">Edit Job</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{job.title}</p>
        </div>

        <Button variant="outline" onClick={copyLink} className="gap-2 shrink-0">
          <Copy className="h-4 w-4" />
          Copy Shareable Link
        </Button>
      </div>

      <JobForm
        job={job}
        onSubmitDraft={(data) => handleSubmit({ ...data, status: "draft" })}
        onSubmitPublish={(data) => handleSubmit({ ...data, status: "open" })}
        isSubmitting={updatingJob}
      />
    </div>
  );
};

export default EditJobPage;
