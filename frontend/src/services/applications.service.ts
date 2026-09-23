import api from './api';
import { Application, ApplicationHistory, ApplicationStatus, ApiResponse } from '../types';

export const applicationsService = {
  applyJob: async (jobId: string) => {
    const response = await api.post<ApiResponse<Application>>('/applications', { jobId });
    return response.data;
  },
  getMyApplications: async () => {
    const response = await api.get<ApiResponse<Application[]>>('/applications/me');
    return response.data;
  },
  getApplicants: async (jobId: string) => {
    const response = await api.get<ApiResponse<Application[]>>(`/jobs/${jobId}/applications`);
    return response.data;
  },
  updateStatus: async (applicationId: string, status: ApplicationStatus) => {
    const response = await api.patch<ApiResponse<Application>>(`/applications/${applicationId}/status`, { status });
    return response.data;
  },
  getHistory: async (applicationId: string) => {
    const response = await api.get<ApiResponse<ApplicationHistory[]>>(`/applications/${applicationId}/history`);
    return response.data;
  }
};
