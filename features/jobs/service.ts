import flairapi from "@/lib/flairapi";
import { ApplicationStatus, JobCategory, JobStatus, JobType } from "@/models/Job";

export interface CreateJobDto {
  title: string;
  description: string;
  type: JobType;
  category: JobCategory;
  location?: string;
  salaryRange?: string;
  status: JobStatus;
  closesAt?: string | null;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  type?: JobType;
  category?: JobCategory;
  location?: string | null;
  salaryRange?: string | null;
  status?: JobStatus;
  closesAt?: string | null;
}

export interface ListJobsParams {
  page?: number;
  limit?: number;
  type?: JobType;
  category?: JobCategory;
  location?: string;
  status?: JobStatus;
}

export interface ListApplicationsParams {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
}

export interface UpdateApplicationDto {
  status: ApplicationStatus;
  ownerNote?: string;
}

export interface ApplyToJobDto {
  coverLetter?: string;
  resumeUrl?: string;
}

const baseUrl = `${import.meta.env.BASE_URL}/jobs`;
const businessesBaseUrl = `${import.meta.env.BASE_URL}/businesses`;

// ─── Public API ───────────────────────────────────────────────────────────────

export const fetchPublicJobsApiCall = (params: ListJobsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.type) qs.set('type', params.type);
  if (params.category) qs.set('category', params.category);
  if (params.location) qs.set('location', params.location);
  return flairapi.get(`${baseUrl}?${qs.toString()}`);
};

export const fetchPublicJobBySlugApiCall = (slug: string) => {
  return flairapi.get(`${baseUrl}/${slug}`);
};

export const applyToJobApiCall = (jobId: string, data: ApplyToJobDto) => {
  return flairapi.post(`${baseUrl}/${jobId}/apply`, data);
};

// ─── Professional: My Application ────────────────────────────────────────────

export const fetchMyApplicationsApiCall = (params: ListApplicationsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  return flairapi.get(`${baseUrl}/my/applications?${qs.toString()}`);
};

export const fetchMyApplicationDetailApiCall = (jobId: string) => {
  return flairapi.get(`${baseUrl}/${jobId}/my-application`);
};

export const uploadResumeFileApiCall = (jobId: string, file: File) => {
  const form = new FormData();
  form.append('resume', file);
  return flairapi.post(`${baseUrl}/${jobId}/my-application/resume/file`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const setResumeUrlApiCall = (jobId: string, resumeUrl: string) => {
  return flairapi.put(`${baseUrl}/${jobId}/my-application/resume/url`, { resumeUrl });
};

// ─── Owner API ────────────────────────────────────────────────────────────────

export const fetchBusinessJobsApiCall = (businessId: string, params: ListJobsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.type) qs.set('type', params.type);
  if (params.category) qs.set('category', params.category);
  return flairapi.get(`${businessesBaseUrl}/${businessId}/jobs?${qs.toString()}`);
};

export const fetchBusinessJobByIdApiCall = (businessId: string, jobId: string) => {
  return flairapi.get(`${businessesBaseUrl}/${businessId}/jobs/${jobId}`);
};

export const createJobApiCall = (businessId: string, data: CreateJobDto) => {
  return flairapi.post(`${businessesBaseUrl}/${businessId}/jobs`, data);
};

export const updateJobApiCall = (businessId: string, jobId: string, data: UpdateJobDto) => {
  return flairapi.patch(`${businessesBaseUrl}/${businessId}/jobs/${jobId}`, data);
};

export const deleteJobApiCall = (businessId: string, jobId: string) => {
  return flairapi.delete(`${businessesBaseUrl}/${businessId}/jobs/${jobId}`);
};

export const fetchJobApplicationsApiCall = (
  businessId: string,
  jobId: string,
  params: ListApplicationsParams = {}
) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  return flairapi.get(`${businessesBaseUrl}/${businessId}/jobs/${jobId}/applications?${qs.toString()}`);
};

export const fetchOwnerApplicationDetailApiCall = (
  businessId: string,
  jobId: string,
  appId: string
) => {
  return flairapi.get(`${businessesBaseUrl}/${businessId}/jobs/${jobId}/applications/${appId}`);
};

export const updateApplicationStatusApiCall = (
  businessId: string,
  jobId: string,
  applicationId: string,
  data: UpdateApplicationDto
) => {
  return flairapi.patch(
    `${businessesBaseUrl}/${businessId}/jobs/${jobId}/applications/${applicationId}`,
    data
  );
};
