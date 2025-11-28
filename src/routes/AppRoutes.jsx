// src/routes/AppRoutes.jsx
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const EmergenciesPage = lazy(() => import('../pages/EmergenciesPage'));
const UserManagementPage = lazy(() => import('../pages/usermanagement')); // Updated path
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const MapPage = lazy(() => import('../pages/MapPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.EMERGENCIES} element={<EmergenciesPage />} />
          {/* Update User Management route */}
          <Route path={`${ROUTES.USER_MANAGEMENT}/*`} element={<UserManagementPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.MAP} element={<MapPage />} />
          {/* Keep the old /users route for backward compatibility if needed */}
          <Route path={ROUTES.USERS} element={<Navigate to={ROUTES.USER_MANAGEMENT} replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
}