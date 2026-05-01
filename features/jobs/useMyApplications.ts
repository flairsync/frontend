import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { JobApplication, PaginatedResponse, ApplicationStatus } from "@/models/Job";
import {
  ApplyToJobDto,
  ListApplicationsParams,
  applyToJobApiCall,
  fetchMyApplicationsApiCall,
  fetchMyApplicationDetailApiCall,
  uploadResumeFileApiCall,
  setResumeUrlApiCall,
} from "./service";

export const useMyApplications = (params: ListApplicationsParams = {}) => {
  const { data, isPending: loadingApplications, refetch } = useQuery<PaginatedResponse<JobApplication>>({
    queryKey: ["my_job_applications", params],
    queryFn: async () => {
      const resp = await fetchMyApplicationsApiCall(params);
      return resp.data.data;
    },
  });

  return {
    applications: data?.data ?? [],
    totalPages: data?.pages ?? 1,
    currentPage: data?.current ?? 1,
    loadingApplications,
    refetch,
  };
};

export const useMyApplicationDetail = (jobId: string) => {
  const queryClient = useQueryClient();

  const { data: application, isPending: loadingApplication, isError } = useQuery<JobApplication>({
    queryKey: ["my_job_application_detail", jobId],
    queryFn: async () => {
      const resp = await fetchMyApplicationDetailApiCall(jobId);
      return resp.data.data;
    },
    enabled: !!jobId,
    retry: false,
  });

  const { mutate: uploadResumeFile, isPending: uploadingResume } = useMutation({
    mutationFn: (file: File) => uploadResumeFileApiCall(jobId, file),
    onSuccess: () => {
      toast.success("Resume uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["my_job_application_detail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["my_job_applications"] });
    },
    onError: () => {
      toast.error("Failed to upload resume. Please try again.");
    },
  });

  const { mutate: setResumeUrl, isPending: settingResumeUrl } = useMutation({
    mutationFn: (url: string) => setResumeUrlApiCall(jobId, url),
    onSuccess: () => {
      toast.success("Resume link saved!");
      queryClient.invalidateQueries({ queryKey: ["my_job_application_detail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["my_job_applications"] });
    },
    onError: () => {
      toast.error("Failed to save resume link. Please try again.");
    },
  });

  return {
    application,
    loadingApplication,
    isError,
    uploadResumeFile,
    uploadingResume,
    setResumeUrl,
    settingResumeUrl,
  };
};

export const useApplyToJob = (jobId: string) => {
  const queryClient = useQueryClient();

  const { mutate: applyToJob, isPending: applying, error: applyError } = useMutation({
    mutationFn: (data: ApplyToJobDto) => applyToJobApiCall(jobId, data),
    onSuccess: () => {
      toast.success("Application submitted!");
      queryClient.invalidateQueries({ queryKey: ["my_job_applications"] });
    },
  });

  const getErrorMessage = (): string | null => {
    if (!applyError) return null;
    const code = (applyError as any)?.response?.data?.code;
    if (code === 'application.duplicate') return "You've already applied to this position.";
    if (code === 'job.not_available') return "This job is not accepting applications.";
    if (code === 'job.closed') return "The application deadline has passed.";
    return "Something went wrong. Please try again.";
  };

  return { applyToJob, applying, applyErrorMessage: getErrorMessage() };
};

export const useHasApplied = (jobId: string): boolean => {
  const { applications } = useMyApplications();
  return applications.some((app) => app.jobId === jobId);
};

export const useMyApplicationForJob = (jobId: string): JobApplication | undefined => {
  const { applications } = useMyApplications();
  return applications.find((app) => app.jobId === jobId);
};
