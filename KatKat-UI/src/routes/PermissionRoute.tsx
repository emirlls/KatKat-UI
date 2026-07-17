import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { usePermission } from '../hooks/usePermission';

/**
 * Route guard that only lets a user through if they hold the given permission. Waits for the
 * permission fetch to finish (so it never redirects on a false negative during load), then
 * redirects to the dashboard if the permission is missing. Used for manager-only pages so a
 * resident who deep-links them lands somewhere sensible instead of an all-forbidden screen.
 */
export function PermissionRoute({ permission }: { permission: string }) {
  const { hasPermission, loading } = usePermission();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spinner />
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
