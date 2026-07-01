import { Armchair, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStations } from '@/hooks/use-stations';
import { useUsers } from '@/hooks/use-users';
import { CreateStationDialog } from '@/components/stations/create-station-dialog';
import { StationCard } from '@/components/stations/station-card';
import { Role } from '@/types/auth';

export function StationsPage() {
  const { data: stations, isLoading: isLoadingStations, isError: isStationsError } =
    useStations();
  const { data: users } = useUsers();

  const barbers = (users ?? []).filter(
    (u) => u.role === Role.BARBER && u.isActive,
  );
  const barberNameById = new Map(barbers.map((b) => [b.id, b.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sillas</h1>
          <p className="text-sm text-muted-foreground">
            Estaciones de trabajo y los barberos asignados.
          </p>
        </div>
        <CreateStationDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Nueva silla
            </Button>
          }
        />
      </div>

      {isStationsError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar las sillas</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      {isLoadingStations ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
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
                barbers={barbers}
                barberName={
                  station.currentBarberId
                    ? barberNameById.get(station.currentBarberId) ?? 'Barbero'
                    : null
                }
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <Armchair className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Todavía no tienes sillas. Crea la primera con el botón de arriba.
          </p>
        </div>
      )}
    </div>
  );
}
