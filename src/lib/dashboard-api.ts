import { api } from '@/lib/api';
import type {
  AdminDashboardSummary,
  BarberDashboardSummary,
  DashboardPeriod,
} from '@/types/dashboard';

export async function fetchAdminDashboard(
  period: DashboardPeriod,
): Promise<AdminDashboardSummary> {
  const { data } = await api.get<AdminDashboardSummary>('/dashboard/admin', {
    params: { period },
  });
  return data;
}

export async function fetchBarberDashboard(
  period: DashboardPeriod,
): Promise<BarberDashboardSummary> {
  const { data } = await api.get<BarberDashboardSummary>('/dashboard/barber', {
    params: { period },
  });
  return data;
}
