import axiosInstance from './axios';

export const getUserProfile = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/users/profile', profileData);
  return response.data;
};

