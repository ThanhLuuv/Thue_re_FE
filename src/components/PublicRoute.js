import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token') !== null;

  // if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default PublicRoute; 