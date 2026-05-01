export type JobStatus = 'draft' | 'open' | 'closed';

export type JobType = 'full_time' | 'part_time' | 'contract' | 'temporary';

export type JobCategory =
  | 'server'
  | 'chef'
  | 'bartender'
  | 'host'
  | 'dishwasher'
  | 'manager'
  | 'cashier'
  | 'delivery'
  | 'barista'
  | 'other';

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';

export type ResumeType = 'url' | 'file';

export type ApplicationEventType =
  | 'submitted'
  | 'reviewed'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'resume_added'
  | 'note_updated';

export type ApplicationEventSource = 'applicant' | 'owner' | 'system';

export interface JobBusiness {
  id: string;
  name: string;
  city?: string;
  state?: string;
  logo?: string;
}

export interface Job {
  id: string;
  slug: string;
  businessId: string;
  business?: JobBusiness;
  title: string;
  description: string;
  location: string | null;
  type: JobType;
  category: JobCategory;
  salaryRange: string | null;
  status: JobStatus;
  closesAt: string | null;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  workEmail?: string;
}

export interface JobApplicationEvent {
  id: string;
  applicationId: string;
  type: ApplicationEventType;
  source: ApplicationEventSource;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  triggeredById: string | null;
  triggeredBy?: { id: string; firstName?: string; lastName?: string };
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job?: Job;
  professionalProfileId: string;
  professionalProfile?: JobApplicationProfile;
  coverLetter: string | null;
  resumeUrl: string | null;
  resumeType: ResumeType | null;
  status: ApplicationStatus;
  ownerNote: string | null;
  events?: JobApplicationEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current: number;
  pages: number;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  temporary: 'Temporary',
};

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  server: 'Server',
  chef: 'Chef',
  bartender: 'Bartender',
  host: 'Host / Hostess',
  dishwasher: 'Dishwasher',
  manager: 'Manager',
  cashier: 'Cashier',
  delivery: 'Delivery',
  barista: 'Barista',
  other: 'Other',
};

// User-facing labels shown to the applicant
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Application received',
  reviewed: 'Being reviewed',
  shortlisted: "You've been shortlisted!",
  accepted: "You've been accepted! 🎉",
  rejected: 'Not selected',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'gray',
  reviewed: 'blue',
  shortlisted: 'yellow',
  accepted: 'green',
  rejected: 'red',
};

// Concise labels for owner-facing tables/dropdowns
export const APPLICATION_STATUS_OWNER_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const EVENT_TYPE_LABELS: Record<ApplicationEventType, string> = {
  submitted: 'Application submitted',
  reviewed: 'Application reviewed',
  shortlisted: 'Moved to shortlist',
  accepted: 'Offer accepted — congratulations!',
  rejected: 'Application closed',
  resume_added: 'Resume attached',
  note_updated: 'Note updated',
};
