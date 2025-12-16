import { apiClient } from './client';

// 發送好友請求
export const sendFriendRequest = async (friendUsername) => {
  return await apiClient.post('/friends/request', {
    friend_username: friendUsername,
  });
};

// 獲取收到的好友請求
export const getFriendRequests = async () => {
  return await apiClient.get('/friends/requests');
};

// 獲取發送的好友請求
export const getSentRequests = async () => {
  return await apiClient.get('/friends/sent');
};

// 接受好友請求
export const acceptFriendRequest = async (requestId) => {
  return await apiClient.post(`/friends/accept/${requestId}`);
};

// 拒絕好友請求
export const rejectFriendRequest = async (requestId) => {
  return await apiClient.post(`/friends/reject/${requestId}`);
};

// 獲取好友列表
export const getFriends = async () => {
  return await apiClient.get('/friends');
};

// 刪除好友
export const removeFriend = async (friendId) => {
  return await apiClient.delete(`/friends/${friendId}`);
};
