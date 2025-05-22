import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import apiService from '../../services/apiService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  width: '100%',
  margin: '12px auto',
  borderRadius: 20,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '40px',
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#99CCFF',
    },
    '&:hover fieldset': {
      borderColor: '#6699CC', 
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6699CC',
    },
    '& .MuiOutlinedInput-input': {
      padding: '8px 14px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#6699CC',
    fontSize: '14px',
    transform: 'translate(14px, 8px)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#6699CC',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: '#99CCFF',
  color: 'white',
  '&:hover': {
    backgroundColor: '#6699CC',
  },
  '&.Mui-disabled': {
    backgroundColor: '#ccc',
  },
}));

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
    <Container component="main" maxWidth="sm">
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          backgroundImage: 'url("/img/bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <StyledPaper elevation={3}>
          <PersonAddOutlinedIcon sx={{ fontSize: 40, color: '#6699CC', mb: 2 }} />
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Đăng ký tài khoản
          </Typography>
          {!showVerification ? (
            <StyledForm onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <StyledTextField
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  slotProps={{
                    input: {
                      pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    }
                  }}
                />
                <StyledTextField
                  fullWidth
                  label="Số điện thoại" 
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]{0,10}$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  slotProps={{
                    input: {
                      inputMode: 'numeric',
                      pattern: '^(0[0-9]{9})$',
                      maxLength: 10
                    }
                  }}
                />
                <StyledTextField
                  fullWidth
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
                <StyledTextField
                  fullWidth
                  label="Nhập lại mật khẩu"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
                </StyledButton>
              </Stack>
            </StyledForm>
          ) : (
            <StyledForm onSubmit={handleVerification}>
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Chúng tôi đã gửi mã xác thực tới email của bạn. Vui lòng kiểm tra và nhập mã dưới đây.
                </Typography>
                <StyledTextField
                  fullWidth
                  label="Mã xác thực"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.verificationCode}
                  helperText={errors.verificationCode}
                />
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác thực'}
                </StyledButton>
              </Stack>
            </StyledForm>
          )}
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Đã có tài khoản?{' '}
            <MuiLink component={Link} to="/login" sx={{ color: '#99CCFF' }}>
              Đăng nhập
            </MuiLink>
          </Typography>
        </StyledPaper>
      </Box>
    </Container>
  );
}

export default Register; 