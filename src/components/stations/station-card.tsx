import { Armchair, Loader2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReleaseStation } from '@/hooks/use-stations';
import { AssignBarberDialog } from '@/components/stations/assign-barber-dialog';
import { cn } from '@/lib/utils';
import { StationStatus, type Station } from '@/types/station';
import type { UserSummary } from '@/types/user';

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function StationCard({
  station,
  barbers,
  barberName,
}: {
  station: Station;
  barbers: UserSummary[];
  barberName: string | null;
}) {
  const releaseMutation = useReleaseStation();
  const isOccupied = station.status === StationStatus.OCCUPIED;

  async function handleRelease() {
    try {
      await releaseMutation.mutateAsync(station.id);
      toast.success('Silla liberada');
    } catch {
      toast.error('No se pudo liberar la silla');
    }
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden shadow-sm',
        isOccupied ? 'ring-primary/20' : 'border-dashed',
      )}
    >
      {isOccupied && (
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
      )}
      <CardContent className="flex flex-col gap-4 px-5 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-full',
                isOccupied
                  ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Armchair className="size-6" />
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Silla
              </p>
              <p className="font-heading text-3xl leading-none">{station.number}</p>
            </div>
          </div>
          <Badge variant={isOccupied ? 'default' : 'secondary'}>
            {isOccupied ? 'Ocupada' : 'Disponible'}
          </Badge>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2">
          {barberName ? (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {initials(barberName)}
            </span>
          ) : (
            <UserRound className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span
            className={cn(
              'truncate text-sm',
              barberName ? 'font-medium' : 'text-muted-foreground',
            )}
          >
            {barberName ?? 'Sin barbero asignado'}
          </span>
        </div>

        {isOccupied ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleRelease}
            disabled={releaseMutation.isPending}
          >
            {releaseMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Liberar silla
          </Button>
        ) : (
          <AssignBarberDialog
            station={station}
            barbers={barbers}
            trigger={
              <Button size="sm" className="w-full">
                Asignar barbero
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
