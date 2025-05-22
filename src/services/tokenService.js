const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

const tokenService = {
  getToken: () => {
    return localStorage.getItem('token');
  },

  getName: () => {
    return localStorage.getItem('name');
  },

  setToken: (token, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('name', name);
  },

  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  startTokenCheck: (onExpired) => {
    const checkToken = () => {
      const token = tokenService.getToken();
      if (tokenService.isTokenExpired(token)) {
        tokenService.removeToken();
        if (onExpired) onExpired();
      }
    };

    // Check immediately
    checkToken();

    // Then check every 5 minutes
    return setInterval(checkToken, TOKEN_CHECK_INTERVAL);
  },

  stopTokenCheck: (intervalId) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
};

export default tokenService; 