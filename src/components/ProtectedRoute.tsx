import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'STAFF' | 'ADMIN';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Cargando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user) {
    const allowed =
      requiredRole === 'STAFF'
        ? user.role === 'STAFF' || user.role === 'ADMIN'
        : user.role === 'ADMIN';

    if (!allowed) {
      return <Navigate to="/eventos" replace />;
    }
  }

  return <>{children}</>;
}
