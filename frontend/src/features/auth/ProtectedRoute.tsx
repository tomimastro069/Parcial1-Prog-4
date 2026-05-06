import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  requiredRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  requiredRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (requiredRoles.length > 0 && !requiredRoles.some((r) => hasRole(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
