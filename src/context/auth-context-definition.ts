import { createContext } from 'react';
import type { AuthenticatedUser, LoginPayload } from '@/types/auth';

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthenticatedUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
