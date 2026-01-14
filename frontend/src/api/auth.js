import { apiClient } from './client';

// 註冊
export const register = async (username, email, password) => {
  const response = await apiClient.post('/register', {
    username,
    email,
    password,
  });
  
  if (response.data) {
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  return response;
};

// 登入
export const login = async (usernameOrEmail, password) => {
  // 判斷輸入是 email 還是 username
  const isEmail = usernameOrEmail.includes('@');
  
  const response = await apiClient.post('/login', {
    ...(isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail }),
    password,
  });
  
  if (response.data) {
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  return response;
};

// 登出
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

// 獲取當前使用者資訊
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 檢查是否已登入
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
