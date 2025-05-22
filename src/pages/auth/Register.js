import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import apiService from '../../services/apiService';
import styles from './Register.module.css';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(0[0-9]{9})$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0123456789)';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService.register({
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
      });

      if (response.success) {
        setShowVerification(true);
        toast.success('Mã xác thực đã được gửi đến email của bạn');
      } else {
        toast.error(response.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      if(err.message === 'Email already exists')
        toast.error('Email đã tồn tại');
      else
        if(err.message === 'Phone number already exists')
          toast.error('Số điện thoại đã tồn tại');
        else
          toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = 'Vui lòng nhập mã xác thực';
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyEmail({
        email: formData.email,
        code: formData.verificationCode,
      });

      if (response.success) {
        toast.success('Xác thực thành công!');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
        }, 2000);
      } else {
        toast.error(response.message || 'Xác thực thất bại');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
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
      <main className={styles.main}>
        <div className={styles.paper}>
          <PersonAddOutlinedIcon className={styles.icon} />
          <h1 className={styles.title}>Đăng ký tài khoản</h1>
          {!showVerification ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  className={`${styles.input} ${errors.fullName ? styles.error : ''}`}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Họ và tên"
                />
                {errors.fullName && <div className={styles.errorText}>{errors.fullName}</div>}
              </div>

              <div className={styles.formGroup}>
                <input
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                {errors.email && <div className={styles.errorText}>{errors.email}</div>}
              </div>

              <div className={styles.formGroup}>
                <input
                  className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]{0,10}$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="Số điện thoại"
                  inputMode="numeric"
                  pattern="^(0[0-9]{9})$"
                  maxLength={10}
                />
                {errors.phone && <div className={styles.errorText}>{errors.phone}</div>}
              </div>

              <div className={styles.formGroup}>
                <input
                  className={`${styles.input} ${errors.password ? styles.error : ''}`}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mật khẩu"
                />
                {errors.password && <div className={styles.errorText}>{errors.password}</div>}
              </div>

              <div className={styles.formGroup}>
                <input
                  className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                />
                {errors.confirmPassword && <div className={styles.errorText}>{errors.confirmPassword}</div>}
              </div>

              <button
                type="submit"
                className={styles.button}
                disabled={loading}
              >
                {loading ? <div className={styles.spinner} /> : 'Đăng ký'}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleVerification}>
              <div className={styles.formGroup}>
                <p className={styles.message}>
                  Chúng tôi đã gửi mã xác thực tới email của bạn. Vui lòng kiểm tra và nhập mã dưới đây.
                </p>
                <div className={styles.inputGroup}>
                  <input
                    className={`${styles.input} ${errors.verificationCode ? styles.error : ''}`}
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    placeholder=" "
                    maxLength={6}
                  />
                  <label className={styles.label}>Mã xác thực</label>
                  {errors.verificationCode && <div className={styles.errorText}>{errors.verificationCode}</div>}
                </div>

                <button
                  type="submit"
                  className={styles.button}
                  disabled={loading}
                >
                  {loading ? <div className={styles.spinner} /> : 'Xác thực'}
                </button>
              </div>
            </form>
          )}
          <p className={styles.message}>
            Đã có tài khoản?{' '}
            <Link to="/login" className={styles.link}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Register; 