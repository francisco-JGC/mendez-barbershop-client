import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Banknote,
  ChevronRight,
  Crown,
  HandCoins,
  ListChecks,
  Package,
  Scissors,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatCard } from '@/components/dashboard/stat-card';
import { PeriodTabs } from '@/components/dashboard/period-tabs';
import { PageHeader } from '@/components/layout/page-header';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DashboardPeriod } from '@/types/dashboard';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<DashboardPeriod>('day');
  const { data, isLoading, isError } = useAdminDashboard(period);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Rendimiento general de la barbería."
        action={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el dashboard</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total recaudado"
              value={formatCurrency(data.totalRevenue)}
              icon={Banknote}
              accent
            />
            <StatCard
              label="Cortes y servicios"
              value={formatCurrency(data.servicesRevenue)}
              icon={Scissors}
            />
            <StatCard
              label="Productos"
              value={formatCurrency(data.productsRevenue)}
              icon={Package}
            />
            <StatCard
              label="Comisión de barberos"
              value={formatCurrency(data.totalCommissions)}
              icon={HandCoins}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Crown className="size-4 text-primary" />
                  Ranking de barberos
                </CardTitle>
                <CardDescription>
                  Quién ha generado más ingresos en el periodo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.barberRanking.length === 0 ? (
                  <EmptyState message="Todavía no hay ventas registradas." />
                ) : (
                  <ul className="-mx-2 space-y-0.5">
                    {data.barberRanking.map((entry, index) => (
                      <li key={entry.barberId}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/sales-record?barberId=${entry.barberId}`)
                          }
                          className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                index === 0
                                  ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground'
                                  : 'bg-muted text-muted-foreground',
                              )}
                            >
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {entry.barberName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.cutsCount} servicio
                                {entry.cutsCount === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-semibold">
                                {formatCurrency(entry.revenue)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Comisión {formatCurrency(entry.commission)}
                              </span>
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecks className="size-4 text-primary" />
                  Desglose por servicio
                </CardTitle>
                <CardDescription>
                  Cuántas veces se realizó cada servicio en el periodo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.serviceBreakdown.length === 0 ? (
                  <EmptyState message="Aún no hay servicios registrados." />
                ) : (
                  <ul className="divide-y">
                    {data.serviceBreakdown.map((entry) => (
                      <li
                        key={entry.serviceId}
                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <span className="truncate text-sm font-medium">
                          {entry.serviceName}
                        </span>
                        <Badge variant="secondary">
                          {entry.count} {entry.count === 1 ? 'vez' : 'veces'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-destructive" />
                Inventario bajo
              </CardTitle>
              <CardDescription>
                Productos que necesitan reabastecimiento pronto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.lowStockProducts.length === 0 ? (
                <EmptyState message="Todo el inventario está en buen nivel." />
              ) : (
                <ul className="divide-y">
                  {data.lowStockProducts.map((product) => (
                    <li
                      key={product.productId}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm font-medium">
                        {product.name}
                      </span>
                      <Badge variant="destructive">
                        {product.stock} en stock
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
