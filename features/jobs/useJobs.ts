import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Job, JobApplication, PaginatedResponse } from "@/models/Job";
import {
  CreateJobDto,
  ListJobsParams,
  ListApplicationsParams,
  UpdateApplicationDto,
  UpdateJobDto,
  createJobApiCall,
  fetchOwnerApplicationDetailApiCall,
  deleteJobApiCall,
  fetchBusinessJobByIdApiCall,
  fetchBusinessJobsApiCall,
  fetchJobApplicationsApiCall,
  updateApplicationStatusApiCall,
  updateJobApiCall,
} from "./service";

export const useBusinessJobs = (businessId: string, params: ListJobsParams = {}) => {
  const { data, isPending: loadingJobs, refetch } = useQuery<PaginatedResponse<Job>>({
    queryKey: ["business_jobs", businessId, params],
    queryFn: async () => {
      const resp = await fetchBusinessJobsApiCall(businessId, params);
      return resp.data.data;
    },
    enabled: !!businessId,
  });

  return {
    jobs: data?.data ?? [],
    totalPages: data?.pages ?? 1,
    currentPage: data?.current ?? 1,
    loadingJobs,
    refetch,
  };
};

export const useBusinessJob = (businessId: string, jobId: string) => {
  const { data: job, isPending: loadingJob } = useQuery<Job>({
    queryKey: ["business_job", businessId, jobId],
    queryFn: async () => {
      const resp = await fetchBusinessJobByIdApiCall(businessId, jobId);
      return resp.data.data;
    },
    enabled: !!businessId && !!jobId,
  });

  return { job, loadingJob };
};

export const useCreateJob = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: createJob, isPending: creatingJob } = useMutation({
    mutationFn: (data: CreateJobDto) => createJobApiCall(businessId, data),
    onSuccess: (resp) => {
      toast.success("Job posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["business_jobs", businessId] });
      return resp.data.data as Job;
    },
    onError: () => {
      toast.error("Failed to create job. Please try again.");
    },
  });

  return { createJob, creatingJob };
};

export const useUpdateJob = (businessId: string, jobId: string) => {
  const queryClient = useQueryClient();

  const { mutate: updateJob, isPending: updatingJob } = useMutation({
    mutationFn: (data: UpdateJobDto) => updateJobApiCall(businessId, jobId, data),
    onSuccess: () => {
      toast.success("Job updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["business_jobs", businessId] });
      queryClient.invalidateQueries({ queryKey: ["business_job", businessId, jobId] });
    },
    onError: () => {
      toast.error("Failed to update job. Please try again.");
    },
  });

  return { updateJob, updatingJob };
};

export const useDeleteJob = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: deleteJob, isPending: deletingJob } = useMutation({
    mutationFn: (jobId: string) => deleteJobApiCall(businessId, jobId),
    onSuccess: () => {
      toast.success("Job deleted.");
      queryClient.invalidateQueries({ queryKey: ["business_jobs", businessId] });
    },
    onError: () => {
      toast.error("Failed to delete job. Please try again.");
    },
  });

  return { deleteJob, deletingJob };
};

export const useJobApplications = (
  businessId: string,
  jobId: string,
  params: ListApplicationsParams = {}
) => {
  const queryClient = useQueryClient();

  const { data, isPending: loadingApplications, refetch } = useQuery<PaginatedResponse<JobApplication>>({
    queryKey: ["job_applications", businessId, jobId, params],
    queryFn: async () => {
      const resp = await fetchJobApplicationsApiCall(businessId, jobId, params);
      return resp.data.data;
    },
    enabled: !!businessId && !!jobId,
  });

  const { mutate: updateApplicationStatus, isPending: updatingApplication } = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: UpdateApplicationDto }) =>
      updateApplicationStatusApiCall(businessId, jobId, applicationId, data),
    onMutate: async ({ applicationId, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey: ["job_applications", businessId, jobId, params] });
      const previous = queryClient.getQueryData<PaginatedResponse<JobApplication>>(
        ["job_applications", businessId, jobId, params]
      );
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<JobApplication>>(
          ["job_applications", businessId, jobId, params],
          {
            ...previous,
            data: previous.data.map((app) =>
              app.id === applicationId
                ? { ...app, status: updateData.status, ownerNote: updateData.ownerNote ?? app.ownerNote }
                : app
            ),
          }
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["job_applications", businessId, jobId, params], context.previous);
      }
      toast.error("Failed to update status. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_applications", businessId, jobId] });
    },
  });

  return {
    applications: data?.data ?? [],
    totalPages: data?.pages ?? 1,
    currentPage: data?.current ?? 1,
    loadingApplications,
    refetch,
    updateApplicationStatus,
    updatingApplication,
  };
};

export const useOwnerApplicationDetail = (businessId: string, jobId: string, appId: string) => {
  const queryClient = useQueryClient();

  const { data: application, isPending: loadingApplication, isError } = useQuery<JobApplication>({
    queryKey: ["owner_application_detail", businessId, jobId, appId],
    queryFn: async () => {
      const resp = await fetchOwnerApplicationDetailApiCall(businessId, jobId, appId);
      return resp.data.data;
    },
    enabled: !!businessId && !!jobId && !!appId,
    retry: false,
  });

  const { mutate: updateStatus, isPending: updatingStatus } = useMutation({
    mutationFn: (data: UpdateApplicationDto) =>
      updateApplicationStatusApiCall(businessId, jobId, appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner_application_detail", businessId, jobId, appId] });
      queryClient.invalidateQueries({ queryKey: ["job_applications", businessId, jobId] });
    },
    onError: () => {
      toast.error("Failed to update status. Please try again.");
    },
  });

  return { application, loadingApplication, isError, updateStatus, updatingStatus };
};
