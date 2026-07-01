import { useState } from 'react';
import { Armchair, Banknote, HandCoins, Scissors, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

const EARNINGS_LABEL: Record<DashboardPeriod, string> = {
  day: 'hoy',
  yesterday: 'ayer',
  week: 'esta semana',
  month: 'este mes',
};

function firstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}

export function BarberDashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardPeriod>('day');
  const { data, isLoading, isError } = useBarberDashboard(period);

  const averagePerCut =
    data && data.cutsCount > 0
      ? Number(data.totalRevenue) / data.cutsCount
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${user ? firstName(user.name) : ''} 👋`}
        description="Este es tu resumen personal."
        action={
          <div className="flex items-center gap-2">
            {data?.stationNumber && (
              <Badge variant="secondary" className="gap-1.5 hidden sm:inline-flex">
                <Armchair className="size-3.5" />
                Silla {data.stationNumber}
              </Badge>
            )}
            <PeriodTabs value={period} onChange={setPeriod} />
          </div>
        }
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
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <Card className="relative overflow-hidden border-primary/20 shadow-sm">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
            <div className="absolute -right-8 -bottom-12 opacity-[0.04]">
              <HandCoins className="size-56" strokeWidth={1.5} />
            </div>
            <CardContent className="relative flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tu ganancia {EARNINGS_LABEL[period]}
                </p>
                <p className="font-heading text-5xl leading-none tracking-tight sm:text-6xl">
                  {formatCurrency(data.commission)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sobre {formatCurrency(data.totalRevenue)} en servicios (50%)
                </p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
                <HandCoins className="size-6" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={CUTS_LABEL[period]}
              value={String(data.cutsCount)}
              icon={Scissors}
            />
            <StatCard
              label="Total generado"
              value={formatCurrency(data.totalRevenue)}
              icon={Banknote}
            />
            <StatCard
              label="Promedio por corte"
              value={formatCurrency(averagePerCut)}
              icon={TrendingUp}
              hint={
                data.cutsCount > 0
                  ? `${data.cutsCount} corte${data.cutsCount === 1 ? '' : 's'} en total`
                  : 'Sin cortes registrados'
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
