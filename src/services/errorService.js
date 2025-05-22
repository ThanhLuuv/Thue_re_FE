import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN_ERROR'
};

const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const handleNetworkError = (error) => {
  toast.error('Không thể kết nối đến máy chủ', {
    ...toastConfig,
    toastId: 'network-error'
  });
  return {
    type: ErrorTypes.NETWORK,
    message: 'Không thể kết nối đến máy chủ',
    details: error.message
  };
};

const handleServerError = (error) => {
  toast.error('Máy chủ đang gặp sự cố. Vui lòng thử lại sau.', {
    ...toastConfig,
    toastId: 'server-error'
  });
  return {
    type: ErrorTypes.SERVER,
    message: 'Lỗi máy chủ',
    details: error.message
  };
};

const handleValidationError = (error) => {
  const messages = error.response?.data?.errors || [error.message];
  messages.forEach(message => {
    toast.warning(message, {
      ...toastConfig,
      toastId: `validation-error-${message}`
    });
  });
  return {
    type: ErrorTypes.VALIDATION,
    message: 'Lỗi dữ liệu',
    details: messages
  };
};

const handleAuthError = (error) => {
  toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
    ...toastConfig,
    toastId: 'auth-error'
  });
  return {
    type: ErrorTypes.AUTH,
    message: 'Lỗi xác thực',
    details: error.message
  };
};

const handleNotFoundError = (error) => {
  toast.error('Không tìm thấy tài nguyên yêu cầu.', {
    ...toastConfig,
    toastId: 'not-found-error'
  });
  return {
    type: ErrorTypes.NOT_FOUND,
    message: 'Không tìm thấy',
    details: error.message
  };
};

const handleUnknownError = (error) => {
  toast.error('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.', {
    ...toastConfig,
    toastId: 'unknown-error'
  });
  return {
    type: ErrorTypes.UNKNOWN,
    message: 'Lỗi không xác định',
    details: error.message
  };
};

const handleError = (error) => {
  if (!error.response) {
    return handleNetworkError(error);
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      return handleValidationError(error);
    case 401:
    case 403:
      return handleAuthError(error);
    case 404:
      return handleNotFoundError(error);
    case 500:
    case 502:
    case 503:
    case 504:
      return handleServerError(error);
    default:
      return handleUnknownError(error);
  }
};

export const ErrorDisplay = React.memo(({ error }) => {
  if (!error) return null;

  const getErrorIcon = (type) => {
    const iconStyle = {
      fontSize: '24px',
      marginRight: '8px'
    };

    switch (type) {
      case ErrorTypes.NETWORK:
        return <span className="material-icons" style={iconStyle}>wifi_off</span>;
      case ErrorTypes.SERVER:
        return <span className="material-icons" style={iconStyle}>build</span>;
      case ErrorTypes.VALIDATION:
        return <span className="material-icons" style={iconStyle}>warning</span>;
      case ErrorTypes.AUTH:
        return <span className="material-icons" style={iconStyle}>lock</span>;
      case ErrorTypes.NOT_FOUND:
        return <span className="material-icons" style={iconStyle}>search_off</span>;
      default:
        return <span className="material-icons" style={iconStyle}>error</span>;
    }
  };

  return (
    <div className="error-display" data-type={error.type} style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', marginBottom: '16px' }}>
      <div className="error-icon">{getErrorIcon(error.type)}</div>
      <div className="error-content">
        <h3 style={{ margin: '0 0 8px 0', color: '#d32f2f' }}>{error.message}</h3>
        {error.details && (
          <div className="error-details">
            {Array.isArray(error.details) 
              ? error.details.map((detail, index) => (
                  <p key={index} style={{ margin: '4px 0', color: '#666' }}>{detail}</p>
                ))
              : <p style={{ margin: '4px 0', color: '#666' }}>{error.details}</p>
            }
          </div>
        )}
      </div>
    </div>
  );
});

export const useErrorHandler = () => {
  const handleApiError = useCallback((error) => {
    return handleError(error);
  }, []);

  return { handleApiError };
};