import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  requiredRoles?: string[];
  redirectTo?: string;
  children?: React.ReactNode;
}

export function ProtectedRoute({
  requiredRoles = [],
  redirectTo = '/login',
  children,
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRoles.length > 0 && !requiredRoles.some((r) => hasRole(r))) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
