import { apiClient } from './client';

// 獲取使用者資料
export const getProfile = async () => {
  return await apiClient.get('/profile');
};

// 更新使用者資料
export const updateProfile = async (data) => {
  return await apiClient.put('/profile', data);
};

// 更新密碼
export const updatePassword = async (oldPassword, newPassword) => {
  return await apiClient.put('/password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
};
