import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Copy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JobForm } from "@/components/management/jobs/JobForm";
import { useCreateJob } from "@/features/jobs/useJobs";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { CreateJobDto } from "@/features/jobs/service";
import { Job } from "@/models/Job";

const CreateJobPage = () => {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;

  const { myBusinessFullDetails } = useMyBusiness(businessId);
  const { createJob, creatingJob } = useCreateJob(businessId);

  const [createdJob, setCreatedJob] = useState<Job | null>(null);

  const defaultLocation = myBusinessFullDetails?.city ?? "";

  const handleSubmit = (data: CreateJobDto, status: "draft" | "open") => {
    createJob(
      { ...data, status },
      {
        onSuccess: (resp: any) => {
          const job = resp.data.data as Job;
          setCreatedJob(job);
        },
      }
    );
  };

  const copyLink = async () => {
    if (!createdJob) return;
    const url = `${window.location.origin}/jobs/${createdJob.slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied! Share it on Facebook, WhatsApp, or wherever you recruit.");
  };

  if (createdJob) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-1">
            {createdJob.status === "open" ? "Job posted successfully!" : "Job saved as draft."}
          </h2>
          <p className="text-sm text-green-700 mb-4">
            {createdJob.status === "open"
              ? "Share the link below so candidates can find and apply."
              : "You can publish it later from the job list."}
          </p>
          {createdJob.status === "open" && (
            <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2.5">
              <span className="text-sm text-zinc-600 flex-1 truncate">
                {window.location.origin}/jobs/{createdJob.slug}
              </span>
              <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 shrink-0">
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { window.location.href = `/manage/${businessId}/owner/jobs`; }}
          >
            Back to Job List
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setCreatedJob(null)}
          >
            Post Another Job
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <a
        href={`/manage/${businessId}/owner/jobs`}
        className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job Postings
      </a>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Post a Job</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Fill in the details below to create a new job posting.
        </p>
      </div>

      <JobForm
        defaultLocation={defaultLocation}
        onSubmitDraft={(data) => handleSubmit(data as CreateJobDto, "draft")}
        onSubmitPublish={(data) => handleSubmit(data as CreateJobDto, "open")}
        isSubmitting={creatingJob}
      />
    </div>
  );
};

export default CreateJobPage;
