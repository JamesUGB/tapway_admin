// src/routes/PublicRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return children;
}