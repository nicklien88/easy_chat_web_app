import axios from 'axios';

// API 基礎配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ws';

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理錯誤
apiClient.interceptors.response.use(
  (response) => {
    // 統一返回 data 字段
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 401 未授權 - 跳轉登入
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
      // 返回後端錯誤訊息
      const message = error.response.data?.message || '請求失敗';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('網絡連接失敗'));
    } else {
      return Promise.reject(error);
    }
  }
);

export { apiClient, API_BASE_URL, WS_BASE_URL };
