import { apiClient } from './client';

// 獲取使用者資料
export const getProfile = async () => {
  return await apiClient.get('/user/profile');
};

// 更新使用者資料
export const updateProfile = async (displayName, bio, avatar) => {
  return await apiClient.put('/user/profile', {
    display_name: displayName,
    bio,
    avatar,
  });
};

// 更新密碼
export const updatePassword = async (oldPassword, newPassword) => {
  return await apiClient.put('/user/password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
};
