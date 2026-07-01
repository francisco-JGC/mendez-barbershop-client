export type DashboardPeriod = 'day' | 'yesterday' | 'week' | 'month';

export interface BarberRankingEntry {
  barberId: string;
  barberName: string;
  revenue: string;
}

export interface TopServiceEntry {
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
  barberRanking: BarberRankingEntry[];
  topService: TopServiceEntry | null;
  lowStockProducts: LowStockProductEntry[];
}

export interface BarberDashboardSummary {
  cutsCount: number;
  totalRevenue: string;
  stationNumber: number | null;
}
