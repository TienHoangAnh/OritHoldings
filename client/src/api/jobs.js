import axiosInstance from './axios';

export const getJobs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.type) params.append('type', filters.type);
  if (filters.location) params.append('location', filters.location);
  if (filters.includeApplicationStatus) {
    params.append('includeApplicationStatus', 'true');
  }

  const response = await axiosInstance.get(`/jobs?${params.toString()}`);
  return response.data;
};

export const getJob = async (id) => {
  const response = await axiosInstance.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await axiosInstance.post('/jobs', jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await axiosInstance.put(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await axiosInstance.delete(`/jobs/${id}`);
  return response.data;
};

// Employer job history
export const getMyJobs = async (includeExpired = false) => {
  const response = await axiosInstance.get(
    `/jobs/mine?includeExpired=${includeExpired ? 'true' : 'false'}`
  );
  return response.data;
};

export const reopenJob = async (jobId, applicationStartDate, applicationEndDate) => {
  const response = await axiosInstance.put(`/jobs/${jobId}/reopen`, {
    applicationStartDate,
    applicationEndDate,
  });
  return response.data;
};

