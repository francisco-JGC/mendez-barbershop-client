import { useState } from 'react';
import { Armchair, Banknote, Scissors } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { useBarberDashboard } from '@/hooks/use-barber-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/format';
import type { DashboardPeriod } from '@/types/dashboard';

export function BarberDashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardPeriod>('day');
  const { data, isLoading, isError } = useBarberDashboard(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {user?.email.split('@')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Este es tu resumen personal.
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as DashboardPeriod)}>
          <TabsList>
            <TabsTrigger value="day">Hoy</TabsTrigger>
            <TabsTrigger value="month">Este mes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
            label={period === 'day' ? 'Cortes hoy' : 'Cortes este mes'}
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
