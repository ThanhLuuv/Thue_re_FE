import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import tokenService from '../services/tokenService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem có token trong localStorage không
    const token = tokenService.getToken();
    if (token) {
      // Nếu có token, lấy thông tin user
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      } else {
        // Nếu lỗi xác thực (401/403) thì mới xóa token
        if (response.status === 401 || response.status === 403) {
          tokenService.removeToken();
          setUser(null);
        } else {
          // Lỗi khác: giữ nguyên user, chỉ log lỗi
          console.error('API error (not auth):', response.message || response.error);
        }
      }
    } catch (error) {
      // Nếu lỗi xác thực (401/403) thì mới xóa token
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        tokenService.removeToken();
        setUser(null);
      } else {
        // Lỗi khác: giữ nguyên user, chỉ log lỗi
        console.error('Error fetching user info:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        tokenService.setToken(response.data.token, response.data.user.name);
        console.log(response.data.user);
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        tokenService.setToken(response.data.token, response.data.user.name);
        setUser(response.data.user);
        return response;
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Đăng ký thất bại' };
    }
  };

  const logout = () => {
    tokenService.removeToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 