import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/apiService';
import tokenService from '../../services/tokenService';
import { useErrorHandler } from '../../services/errorService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { handleApiError } = useErrorHandler();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    tokenService.removeToken();
  }, []); 

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.login(formData);

      if (result?.success && result?.data?.token) {
        setErrors({});
        tokenService.setToken(result.data.token, result.data.user.name);
        console.log('User roles:', result.data.user.roles[0]);
        const role = result.data.user.roles[0]? result.data.user.roles[0].toLowerCase() : 'user';
        navigate(role === 'admin' ? '/admin' : '/');
      } else {
        const errorMessage = handleApiError(result);
        const errorText = typeof errorMessage === 'object' 
          ? (errorMessage.message || errorMessage.details || 'Đã xảy ra lỗi')
          : errorMessage;
        setErrors({ form: errorText });
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      const errorText = typeof errorMessage === 'object' 
        ? (errorMessage.message || errorMessage.details || 'Đã xảy ra lỗi')
        : errorMessage;
      setErrors({ form: errorText });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        closeButton={false}
        style={{ top: '20px', right: '20px' }}
        toastStyle={{
          background: 'white',
          color: '#333',
          fontSize: '12px',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: '300px',
          lineHeight: '1.2',
          minHeight: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          cursor: 'pointer'
        }}
        bodyStyle={{
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      />
      <div className="login-box">
        <div className="login-paper">
          <div className="lock-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h1 className="login-title">Đăng Nhập</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Mật khẩu"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            {errors.form && (
              <div className="form-error">{errors.form}</div>
            )}
            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>
          <Link to="/forgot-password" className="forgot-password-link">
            Quên mật khẩu?
          </Link>
          <div className="register-link">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="register-text">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;