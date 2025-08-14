import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ROUTE_PERMISSIONS = {
  '/users': [ROLES.SUPER_ADMIN],
  '/settings': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  // Add other routes as needed
};

export default function PrivateRoute() {
  const { currentUser, loading, userData } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;

  const requiredRoles = ROUTE_PERMISSIONS[location.pathname];
  if (requiredRoles && !requiredRoles.some(role => userData?.role === role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}