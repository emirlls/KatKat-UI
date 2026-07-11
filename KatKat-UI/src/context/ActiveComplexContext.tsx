import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

const ID_STORAGE_KEY = 'katkat.activeComplexId';
const NAME_STORAGE_KEY = 'katkat.activeComplexName';

interface ActiveComplexContextValue {
  activeComplexId: string | null;
  activeComplexName: string | null;
  setActiveComplex: (complexId: string | null, complexName?: string | null) => void;
}

const ActiveComplexContext = createContext<ActiveComplexContextValue | null>(null);

export function ActiveComplexProvider({ children }: { children: ReactNode }) {
  const [activeComplexId, setActiveComplexIdState] = useState<string | null>(() =>
    localStorage.getItem(ID_STORAGE_KEY),
  );
  const [activeComplexName, setActiveComplexNameState] = useState<string | null>(() =>
    localStorage.getItem(NAME_STORAGE_KEY),
  );

  const setActiveComplex = useCallback((complexId: string | null, complexName?: string | null) => {
    if (complexId) {
      localStorage.setItem(ID_STORAGE_KEY, complexId);
    } else {
      localStorage.removeItem(ID_STORAGE_KEY);
    }
    if (complexName) {
      localStorage.setItem(NAME_STORAGE_KEY, complexName);
    } else {
      localStorage.removeItem(NAME_STORAGE_KEY);
    }
    setActiveComplexIdState(complexId);
    setActiveComplexNameState(complexName ?? null);
  }, []);

  const value = useMemo(
    () => ({ activeComplexId, activeComplexName, setActiveComplex }),
    [activeComplexId, activeComplexName, setActiveComplex],
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
