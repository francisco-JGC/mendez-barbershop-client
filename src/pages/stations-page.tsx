import { Armchair, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatCard } from '@/components/dashboard/stat-card';
import { useStations } from '@/hooks/use-stations';
import { useUsers } from '@/hooks/use-users';
import { CreateStationDialog } from '@/components/stations/create-station-dialog';
import { StationCard } from '@/components/stations/station-card';
import { PageHeader } from '@/components/layout/page-header';
import { StationStatus } from '@/types/station';
import { Role } from '@/types/auth';

export function StationsPage() {
  const { data: stations, isLoading: isLoadingStations, isError: isStationsError } =
    useStations();
  const { data: users } = useUsers();

  const barbers = (users ?? []).filter(
    (u) => u.role === Role.BARBER && u.isActive,
  );
  const barberNameById = new Map(barbers.map((b) => [b.id, b.name]));

  const occupiedBarberIds = new Set(
    (stations ?? [])
      .map((s) => s.currentBarberId)
      .filter((id): id is string => !!id),
  );
  const availableBarbers = barbers.filter((b) => !occupiedBarberIds.has(b.id));

  const occupiedCount = (stations ?? []).filter(
    (s) => s.status === StationStatus.OCCUPIED,
  ).length;
  const availableCount = (stations ?? []).length - occupiedCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sillas"
        description="Estaciones de trabajo y los barberos asignados."
        action={
          <CreateStationDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nueva silla
              </Button>
            }
          />
        }
      />

      {isStationsError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar las sillas</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      {!isLoadingStations && stations && stations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Sillas ocupadas"
            value={String(occupiedCount)}
            icon={Armchair}
            accent
          />
          <StatCard
            label="Sillas disponibles"
            value={String(availableCount)}
            icon={CheckCircle2}
          />
        </div>
      )}

      {isLoadingStations ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : stations && stations.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stations
            .sort((a, b) => a.number - b.number)
            .map((station) => (
              <StationCard
                key={station.id}
                station={station}
                barbers={availableBarbers}
                barberName={
                  station.currentBarberId
                    ? barberNameById.get(station.currentBarberId) ?? 'Barbero'
                    : null
                }
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Armchair className="size-6" />
          </span>
          <div>
            <p className="text-sm font-medium">Todavía no tienes sillas</p>
            <p className="text-sm text-muted-foreground">
              Crea la primera con el botón de arriba.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
