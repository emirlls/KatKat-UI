import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { complexService } from '../features/management/services/complexService';
import { useAuth } from '../hooks/useAuth';

interface ActiveComplexContextValue {
  activeComplexId: string | null;
  activeComplexName: string | null;
  loading: boolean;
  /** Updates the cached "my complex" info - called after creating/editing it, no picking involved. */
  setActiveComplex: (complexId: string | null, complexName?: string | null) => void;
}

const ActiveComplexContext = createContext<ActiveComplexContextValue | null>(null);

/**
 * A Manager/Resident belongs to exactly one Tenant, so there is nothing to pick here - this
 * simply mirrors whatever GET /complexes/my returns for the current session. There used to be a
 * user-facing "switch active site" flow before real multi-tenancy existed; that concept no longer
 * applies (and was itself the source of several "wrong/stale site" bugs).
 */
export function ActiveComplexProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [activeComplexId, setActiveComplexId] = useState<string | null>(null);
  const [activeComplexName, setActiveComplexName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveComplexId(null);
      setActiveComplexName(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    complexService
      .getMy()
      .then((complex) => {
        if (cancelled) return;
        setActiveComplexId(complex?.id ?? null);
        setActiveComplexName(complex?.name ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setActiveComplexId(null);
          setActiveComplexName(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const setActiveComplex = useCallback((complexId: string | null, complexName?: string | null) => {
    setActiveComplexId(complexId);
    setActiveComplexName(complexName ?? null);
  }, []);

  const value = useMemo(
    () => ({ activeComplexId, activeComplexName, loading, setActiveComplex }),
    [activeComplexId, activeComplexName, loading, setActiveComplex],
  );

  return <ActiveComplexContext.Provider value={value}>{children}</ActiveComplexContext.Provider>;
}

export function useActiveComplex(): ActiveComplexContextValue {
  const context = useContext(ActiveComplexContext);
  if (!context) {
    throw new Error('useActiveComplex must be used within an ActiveComplexProvider');
  }
  return context;
}
