import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockResetIcon from '@mui/icons-material/LockReset';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import KeyIcon from '@mui/icons-material/Key';
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: 'Email không hợp lệ' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.forgotPassword({ email });
      if (response.success) {
        setStep(2);
        setTimeLeft(300);
        setCanResend(false);
      } else {
        setErrors({ form: response.message || 'Đã xảy ra lỗi khi gửi mã xác thực' });
      }
    } catch (error) {
      setErrors({ form: 'Lỗi kết nối máy chủ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!verificationCode) {
      setErrors({ verificationCode: 'Vui lòng nhập mã xác thực' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.verifyResetPassword({
        email,
        code: verificationCode
      });
      if (response.success) {
        setStep(3);
      } else {
        setErrors({ verificationCode: response.message || 'Mã xác thực không hợp lệ' });
      }
    } catch (error) {
      setErrors({ form: 'Lỗi kết nối máy chủ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validatePassword(password)) {
      setErrors({ password: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu không khớp' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.resetPassword({
        email,
        code: verificationCode,
        new_password: password
      });
      if (response.success) {
        navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công' } });
      } else {
        setErrors({ form: response.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu' });
      }
    } catch (error) {
      setErrors({ form: 'Lỗi kết nối máy chủ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      const response = await apiService.forgotPassword({ email });
      if (response.success) {
        setTimeLeft(300);
        setCanResend(false);
        setErrors({});
      } else {
        setErrors({ form: response.message || 'Đã xảy ra lỗi khi gửi lại mã xác thực' });
      }
    } catch (error) {
      setErrors({ form: 'Lỗi kết nối máy chủ' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {step === 1 && (
          <StyledPaper elevation={3}>
            <LockResetIcon sx={{ fontSize: 40, color: '#6699CC', mb: 2 }} />
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Quên mật khẩu
            </Typography>
            <StyledForm onSubmit={handleForgotPassword}>
              <Stack spacing={3}>
                <StyledTextField
                  required
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                {errors.form && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.form}
                  </Alert>
                )}
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Gửi mã xác thực'
                  )}
                </StyledButton>
              </Stack>
            </StyledForm>
            <Link href="/login" variant="body2" sx={{ mt: 3 }}>
              Quay lại đăng nhập
            </Link>
          </StyledPaper>
        )}

        {step === 2 && (
          <StyledPaper elevation={3}>
            <VerifiedUserIcon sx={{ fontSize: 40, color: '#6699CC', mb: 2 }} />
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Xác Thực Email
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Chúng tôi đã gửi mã xác thực tới email của bạn. Vui lòng kiểm tra và nhập mã dưới đây.
            </Typography>
            <StyledForm onSubmit={handleVerifyCode}>
              <Stack spacing={3}>
                <StyledTextField
                  required
                  fullWidth
                  label="Mã xác thực"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  error={!!errors.verificationCode}
                  helperText={errors.verificationCode}
                  inputProps={{ maxLength: 6 }}
                />
                {errors.form && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.form}
                  </Alert>
                )}
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Xác thực'
                  )}
                </StyledButton>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleResendCode}
                  disabled={!canResend || isLoading}
                  sx={{
                    borderColor: '#99CCFF',
                    color: '#6699CC',
                    '&:hover': {
                      borderColor: '#6699CC',
                      backgroundColor: '#f0f8ff',
                    },
                  }}
                >
                  Gửi lại mã
                </Button>
              </Stack>
            </StyledForm>
            <Typography variant="body2" color="primary" sx={{ mt: 3 }}>
              Mã xác thực hết hạn sau: <strong>{formatTime(timeLeft)}</strong>
            </Typography>
          </StyledPaper>
        )}

        {step === 3 && (
          <StyledPaper elevation={3}>
            <KeyIcon sx={{ fontSize: 40, color: '#6699CC', mb: 2 }} />
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Đặt Lại Mật Khẩu
            </Typography>
            <StyledForm onSubmit={handleResetPassword}>
              <Stack spacing={3}>
                <StyledTextField
                  required
                  fullWidth
                  label="Mật khẩu mới"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                />
                <StyledTextField
                  required
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
                {errors.form && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.form}
                  </Alert>
                )}
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </StyledButton>
              </Stack>
            </StyledForm>
          </StyledPaper>
        )}
      </Box>
    </Container>
  );
};

export default ForgotPassword; 