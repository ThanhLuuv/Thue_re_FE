import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenService from '../services/tokenService';

const useTokenCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenExpired = () => {
      navigate('/login');
    };

    const intervalId = tokenService.startTokenCheck(handleTokenExpired);

    return () => {
      tokenService.stopTokenCheck(intervalId);
    };
  }, [navigate]);
};

export default useTokenCheck; 