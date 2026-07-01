import { useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Crown,
  Package,
  Scissors,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatCard } from '@/components/dashboard/stat-card';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { formatCurrency } from '@/lib/format';
import type { DashboardPeriod } from '@/types/dashboard';

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('day');
  const { data, isLoading, isError } = useAdminDashboard(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Rendimiento general de la barbería.
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <ul className="space-y-3">
                    {data.barberRanking.map((entry, index) => (
                      <li
                        key={entry.barberId}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">
                            {entry.barberName}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(entry.revenue)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-primary" />
                  Servicio más solicitado
                </CardTitle>
                <CardDescription>
                  El corte o servicio favorito de tus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.topService ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {data.topService.serviceName}
                    </span>
                    <Badge variant="secondary">
                      {data.topService.count}{' '}
                      {data.topService.count === 1 ? 'vez' : 'veces'}
                    </Badge>
                  </div>
                ) : (
                  <EmptyState message="Aún no hay servicios registrados." />
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
