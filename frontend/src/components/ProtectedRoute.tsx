import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('JOB_SEEKER' | 'EMPLOYER' | 'ADMIN')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  // If token is null but loading, we might show a spinner, but localstorage is synchronous
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
