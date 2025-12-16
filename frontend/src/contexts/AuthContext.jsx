import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated as checkAuth, logout } from '../api/auth';
import wsClient from '../api/websocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化時檢查登入狀態
    if (checkAuth()) {
      const userData = getCurrentUser();
      setUser(userData);
      
      // 建立 WebSocket 連接
      const token = localStorage.getItem('token');
      if (token) {
        wsClient.connect(token);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    wsClient.disconnect();
    logout();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
