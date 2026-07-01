import { useQuery } from '@tanstack/react-query';
import { fetchAdminDashboard } from '@/lib/dashboard-api';
import type { DashboardPeriod } from '@/types/dashboard';

export function useAdminDashboard(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'admin', period],
    queryFn: () => fetchAdminDashboard(period),
    refetchInterval: 60_000,
  });
}
