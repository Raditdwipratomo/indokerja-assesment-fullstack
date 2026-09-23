export type Role = 'JOB_SEEKER' | 'COMPANY';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  location: string;
  salary: number;
  jobType: JobType;
  companyId: string;
  company: { id: string; name: string };
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobSeekerId: string;
  status: ApplicationStatus;
  createdAt: string;
  job: Job;
  jobSeeker?: { id: string; name: string; email: string };
}

export interface ApplicationHistory {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
