import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, AUTH_LOGOUT_EVENT } from '@/lib/api';
import { decodeAccessToken, isTokenExpired } from '@/lib/jwt';
import { tokenStorage } from '@/lib/token-storage';
import { tenantStorage } from '@/lib/tenant-storage';
import type { AuthenticatedUser, AuthTokens, LoginPayload } from '@/types/auth';
import { AuthContext } from '@/context/auth-context-definition';

function readUserFromStorage(): AuthenticatedUser | null {
  const tokens = tokenStorage.get();
  if (!tokens || isTokenExpired(tokens.accessToken)) {
    return null;
  }
  try {
    return decodeAccessToken(tokens.accessToken);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.clear();
    tenantStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUser(readUserFromStorage());
    setIsLoading(false);

    window.addEventListener(AUTH_LOGOUT_EVENT, logout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
  }, [logout]);

  const login = useCallback(
    async ({ tenantCode, ...credentials }: LoginPayload) => {
      if (tenantCode) {
        tenantStorage.set(tenantCode);
      } else {
        tenantStorage.clear();
      }

      const { data } = await api.post<AuthTokens>('/auth/login', credentials);
      tokenStorage.set(data);
      const decoded = decodeAccessToken(data.accessToken);
      setUser(decoded);
      return decoded;
    },
    [],
  );

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
