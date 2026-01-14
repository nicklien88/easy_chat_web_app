import { apiClient } from './client';

// 發送訊息
export const sendMessage = async (receiverId, content, messageType = 'text', fileData = null) => {
  return await apiClient.post('/chat/send', {
    receiver_id: receiverId,
    content,
    message_type: messageType,
    file_url: fileData?.file_url,
    file_name: fileData?.file_name,
    file_size: fileData?.file_size,
  });
};

// 上傳檔案
export const uploadFile = async (file, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  if (fileType) {
    formData.append('type', fileType);
  }
  
  return await apiClient.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 獲取聊天記錄
export const getMessages = async (friendId, page = 1, pageSize = 50) => {
  return await apiClient.get(`/chat/${friendId}/messages`, {
    params: { page, page_size: pageSize },
  });
};

// 標記訊息已讀
export const markAsRead = async (messageId) => {
  return await apiClient.put(`/messages/${messageId}/read`);
};

// 獲取未讀訊息數量
export const getUnreadCount = async () => {
  return await apiClient.get('/messages/unread');
};

// 獲取最近聊天列表
export const getRecentChats = async () => {
  return await apiClient.get('/chat/recent');
};
