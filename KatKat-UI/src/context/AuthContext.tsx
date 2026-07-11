import { jwtDecode } from 'jwt-decode';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { getTokens, isExpired } from '../services/tokenStorage';
import type { AccessTokenClaims, AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(accessToken: string): AuthUser {
  const claims = jwtDecode<AccessTokenClaims>(accessToken);
  const roles = claims.role ? (Array.isArray(claims.role) ? claims.role : [claims.role]) : [];
  return { id: claims.sub, userName: claims.preferred_username ?? claims.sub, roles };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const tokens = getTokens();
      if (!tokens) {
        setIsLoading(false);
        return;
      }
      if (!isExpired(tokens)) {
        setUser(decodeUser(tokens.accessToken));
        setIsLoading(false);
        return;
      }
      const refreshedToken = await authService.refreshAccessToken();
      setUser(refreshedToken ? decodeUser(refreshedToken) : null);
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await authService.login(username, password);
    setUser(decodeUser(tokens.accessToken));
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
