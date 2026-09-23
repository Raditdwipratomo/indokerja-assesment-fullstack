import api from './api';
import { Job, JobType, ApiResponse } from '../types';

export interface GetJobsQuery {
  search?: string;
  jobType?: JobType;
}

export const jobsService = {
  getJobs: async (query?: GetJobsQuery) => {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.jobType) params.append('jobType', query.jobType);

    const response = await api.get<ApiResponse<Job[]>>(`/jobs?${params.toString()}`);
    return response.data;
  },
  getMyJobs: async () => {
    const response = await api.get<ApiResponse<Job[]>>('/jobs/my');
    return response.data;
  },
  getJob: async (id: string) => {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data;
  },
  createJob: async (data: {
    title: string;
    location: string;
    salary: number;
    jobType: JobType;
    description?: string;
  }) => {
    const response = await api.post<ApiResponse<Job>>('/jobs', data);
    return response.data;
  },
};
