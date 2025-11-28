// src/routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';

const ROUTE_PERMISSIONS = {
  [ROUTES.USER_MANAGEMENT]: [ROLES.SUPER_ADMIN, ROLES.POLICE_ADMIN, ROLES.FIRE_ADMIN, ROLES.PARAMEDIC_ADMIN],
  [ROUTES.USER_MANAGEMENT + '/*']: [ROLES.SUPER_ADMIN, ROLES.POLICE_ADMIN, ROLES.FIRE_ADMIN, ROLES.PARAMEDIC_ADMIN],
  [ROUTES.REPORTS]: [ROLES.SUPER_ADMIN, ROLES.POLICE_ADMIN, ROLES.FIRE_ADMIN, ROLES.PARAMEDIC_ADMIN],
  [ROUTES.SETTINGS]: [ROLES.SUPER_ADMIN, ROLES.POLICE_ADMIN, ROLES.FIRE_ADMIN, ROLES.PARAMEDIC_ADMIN],
  // Add other routes as needed
};

// Helper function to check if a path matches a pattern
const pathMatches = (currentPath, pattern) => {
  if (pattern.endsWith('/*')) {
    const basePattern = pattern.slice(0, -2);
    return currentPath === basePattern || currentPath.startsWith(basePattern + '/');
  }
  return currentPath === pattern;
};

export default function PrivateRoute() {
  const { currentUser, loading, userData } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;

  // Check if user has permission for the current route
  const hasPermission = Object.entries(ROUTE_PERMISSIONS).some(([routePattern, allowedRoles]) => {
    if (pathMatches(location.pathname, routePattern)) {
      return allowedRoles.some(role => userData?.role === role);
    }
    return false;
  });

  // If route has specific permissions and user doesn't have them, redirect to dashboard
  if (Object.keys(ROUTE_PERMISSIONS).some(pattern => pathMatches(location.pathname, pattern)) && !hasPermission) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}