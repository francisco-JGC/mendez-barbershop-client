export const Role = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  BARBER: 'barber',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  barbershopId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  tenantCode?: string;
  email: string;
  password: string;
}
