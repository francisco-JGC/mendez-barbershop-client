import type { AuthenticatedUser } from '@/types/auth';

interface RawAccessTokenPayload {
  sub: string;
  email: string | null;
  username: string | null;
  role: AuthenticatedUser['role'];
  barbershopId: string | null;
  exp: number;
}

export function decodeAccessToken(token: string): AuthenticatedUser {
  const [, payloadSegment] = token.split('.');
  const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(base64);
  const payload = JSON.parse(json) as RawAccessTokenPayload;

  return {
    userId: payload.sub,
    email: payload.email,
    username: payload.username,
    role: payload.role,
    barbershopId: payload.barbershopId,
  };
}

export function isTokenExpired(token: string): boolean {
  const [, payloadSegment] = token.split('.');
  const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
  const { exp } = JSON.parse(atob(base64)) as { exp: number };
  return Date.now() >= exp * 1000;
}
