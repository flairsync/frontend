import flairapi from "@/lib/flairapi";
import { ApplicationStatus, JobCategory, JobStatus, JobType } from "@/models/Job";
import { unwrap, unwrapPaginated } from "../shared/api-response";

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

const baseUrl = `${'https://api.flairsync.com/api/v1'}/jobs`;
const businessesBaseUrl = `${'https://api.flairsync.com/api/v1'}/businesses`;

// ─── Public API ───────────────────────────────────────────────────────────────

export const fetchPublicJobsApiCall = async (params: ListJobsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.type) qs.set('type', params.type);
  if (params.category) qs.set('category', params.category);
  if (params.location) qs.set('location', params.location);
  return unwrapPaginated(await flairapi.get(`${baseUrl}?${qs.toString()}`));
};

export const fetchPublicJobBySlugApiCall = async (slug: string) =>
  unwrap(await flairapi.get(`${baseUrl}/${slug}`));

export const applyToJobApiCall = (jobId: string, data: ApplyToJobDto) => {
  return flairapi.post(`${baseUrl}/${jobId}/apply`, data);
};

// ─── Professional: My Application ────────────────────────────────────────────

export const fetchMyApplicationsApiCall = async (params: ListApplicationsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  return unwrapPaginated(await flairapi.get(`${baseUrl}/my/applications?${qs.toString()}`));
};

export const fetchMyApplicationDetailApiCall = async (jobId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/${jobId}/my-application`));

export const fetchMyApplicationByAppIdApiCall = async (applicationId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/my/applications/${applicationId}`));

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

export const fetchBusinessJobsApiCall = async (businessId: string, params: ListJobsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.type) qs.set('type', params.type);
  if (params.category) qs.set('category', params.category);
  return unwrapPaginated(await flairapi.get(`${businessesBaseUrl}/${businessId}/jobs?${qs.toString()}`));
};

export const fetchBusinessJobByIdApiCall = async (businessId: string, jobId: string) =>
  unwrap(await flairapi.get(`${businessesBaseUrl}/${businessId}/jobs/${jobId}`));

export const createJobApiCall = (businessId: string, data: CreateJobDto) => {
  return flairapi.post(`${businessesBaseUrl}/${businessId}/jobs`, data);
};

export const updateJobApiCall = (businessId: string, jobId: string, data: UpdateJobDto) => {
  return flairapi.patch(`${businessesBaseUrl}/${businessId}/jobs/${jobId}`, data);
};

export const deleteJobApiCall = (businessId: string, jobId: string) => {
  return flairapi.delete(`${businessesBaseUrl}/${businessId}/jobs/${jobId}`);
};

export const fetchJobApplicationsApiCall = async (
  businessId: string,
  jobId: string,
  params: ListApplicationsParams = {}
) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  return unwrapPaginated(await flairapi.get(`${businessesBaseUrl}/${businessId}/jobs/${jobId}/applications?${qs.toString()}`));
};

export const fetchOwnerApplicationDetailApiCall = async (
  businessId: string,
  jobId: string,
  appId: string
) =>
  unwrap(await flairapi.get(`${businessesBaseUrl}/${businessId}/jobs/${jobId}/applications/${appId}`));

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

export const sendStaffInviteApiCall = (
  businessId: string,
  jobId: string,
  applicationId: string
) => {
  return flairapi.post(
    `${businessesBaseUrl}/${businessId}/jobs/${jobId}/applications/${applicationId}/invite`,
    {}
  );
};
