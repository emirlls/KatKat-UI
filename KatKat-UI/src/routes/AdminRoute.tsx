import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Nested inside ProtectedRoute, so `user` is already known to be non-null by the time this renders. */
export function AdminRoute() {
  const { user } = useAuth();

  if (!user?.roles.includes('admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
