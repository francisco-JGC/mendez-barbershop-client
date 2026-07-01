export type DashboardPeriod = 'day' | 'yesterday' | 'week' | 'month';

export interface BarberRankingEntry {
  barberId: string;
  barberName: string;
  cutsCount: number;
  revenue: string;
  commission: string;
}

export interface ServiceBreakdownEntry {
  serviceId: string;
  serviceName: string;
  count: number;
}

export interface LowStockProductEntry {
  productId: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

export interface AdminDashboardSummary {
  servicesRevenue: string;
  productsRevenue: string;
  totalRevenue: string;
  totalCommissions: string;
  barberRanking: BarberRankingEntry[];
  serviceBreakdown: ServiceBreakdownEntry[];
  lowStockProducts: LowStockProductEntry[];
}

export interface BarberDashboardSummary {
  cutsCount: number;
  totalRevenue: string;
  commission: string;
  stationNumber: number | null;
  serviceBreakdown: ServiceBreakdownEntry[];
}
