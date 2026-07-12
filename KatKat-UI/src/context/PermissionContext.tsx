import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { abpApplicationConfigurationUrl } from '../config/appConfig';
import { getValidAccessToken } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

interface PermissionContextValue {
  /** ABP granted-policy map: permission name -> true. Absent/false means not granted. */
  grantedPolicies: Record<string, boolean>;
  loading: boolean;
  hasPermission: (name: string) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

/**
 * Loads the current user's permissions once per session from ABP's application-configuration
 * endpoint (auth.grantedPolicies) and exposes hasPermission(...). This is the single source of
 * truth the UI uses to show/hide manager-only controls and pages.
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [grantedPolicies, setGrantedPolicies] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setGrantedPolicies({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const token = getValidAccessToken();
        const response = await fetch(abpApplicationConfigurationUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const body = await response.json();
        // Envelope-tolerant: the ABP endpoint may or may not be wrapped by the API response
        // middleware, so accept both the wrapped ({data:{auth}}) and raw ({auth}) shapes.
        const policies: Record<string, boolean> =
          body?.data?.auth?.grantedPolicies ?? body?.auth?.grantedPolicies ?? {};
        if (!cancelled) {
          setGrantedPolicies(policies);
        }
      } catch {
        if (!cancelled) {
          setGrantedPolicies({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const hasPermission = useCallback((name: string) => grantedPolicies[name] === true, [grantedPolicies]);

  const value = useMemo<PermissionContextValue>(
    () => ({ grantedPolicies, loading, hasPermission }),
    [grantedPolicies, loading, hasPermission],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermission(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}
