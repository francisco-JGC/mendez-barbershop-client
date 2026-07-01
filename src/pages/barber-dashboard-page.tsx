import { useState } from 'react';
import { Armchair, Banknote, Scissors } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { PeriodTabs } from '@/components/dashboard/period-tabs';
import { PageHeader } from '@/components/layout/page-header';
import { useBarberDashboard } from '@/hooks/use-barber-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/format';
import type { DashboardPeriod } from '@/types/dashboard';

const CUTS_LABEL: Record<DashboardPeriod, string> = {
  day: 'Cortes hoy',
  yesterday: 'Cortes ayer',
  week: 'Cortes esta semana',
  month: 'Cortes este mes',
};

export function BarberDashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardPeriod>('day');
  const { data, isLoading, isError } = useBarberDashboard(period);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${user?.email.split('@')[0]} 👋`}
        description="Este es tu resumen personal."
        action={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar tu resumen</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={CUTS_LABEL[period]}
            value={String(data.cutsCount)}
            icon={Scissors}
            accent
          />
          <StatCard
            label="Total generado"
            value={formatCurrency(data.totalRevenue)}
            icon={Banknote}
          />
          <StatCard
            label="Tu silla"
            value={data.stationNumber ? `Silla ${data.stationNumber}` : 'Sin asignar'}
            icon={Armchair}
          />
        </div>
      ) : null}
    </div>
  );
}
