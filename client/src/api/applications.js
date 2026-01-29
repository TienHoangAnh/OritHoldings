import axiosInstance from './axios';

export const createApplication = async (jobId, coverLetter) => {
  const response = await axiosInstance.post(`/applications/${jobId}`, {
    coverLetter,
  });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await axiosInstance.get('/applications/my');
  return response.data;
};

export const getJobApplications = async (jobId) => {
  const response = await axiosInstance.get(`/applications/job/${jobId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axiosInstance.put(`/applications/${applicationId}/status`, {
    status,
  });
  return response.data;
};

export const getUnseenCount = async () => {
  const response = await axiosInstance.get('/applications/unseen-count');
  return response.data;
};

export const getUnseenApplications = async () => {
  const response = await axiosInstance.get('/applications/unseen');
  return response.data;
};

export const markApplicationSeen = async (applicationId) => {
  const response = await axiosInstance.patch(`/applications/${applicationId}/seen`);
  return response.data;
};

// Employer notifications: new applicants
export const getEmployerUnseenApplications = async () => {
  const response = await axiosInstance.get('/applications/employer/unseen');
  return response.data;
};

export const markEmployerSeen = async (applicationId) => {
  const response = await axiosInstance.patch(`/applications/${applicationId}/employer-seen`);
  return response.data;
};

