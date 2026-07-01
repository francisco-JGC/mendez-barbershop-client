import { useQuery } from '@tanstack/react-query';
import { fetchBarberDashboard } from '@/lib/dashboard-api';
import type { DashboardPeriod } from '@/types/dashboard';

export function useBarberDashboard(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'barber', period],
    queryFn: () => fetchBarberDashboard(period),
    refetchInterval: 60_000,
  });
}
