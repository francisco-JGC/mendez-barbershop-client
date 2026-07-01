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
    <Card>
      <CardContent className="flex flex-col gap-4 px-5 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-full',
                isOccupied
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Armchair className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Silla</p>
              <p className="text-lg font-semibold leading-none">
                {station.number}
              </p>
            </div>
          </div>
          <Badge variant={isOccupied ? 'default' : 'secondary'}>
            {isOccupied ? 'Ocupada' : 'Disponible'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="size-4" />
          {barberName ?? 'Sin barbero asignado'}
        </div>

        {isOccupied ? (
          <Button
            variant="outline"
            size="sm"
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
            trigger={<Button size="sm">Asignar barbero</Button>}
          />
        )}
      </CardContent>
    </Card>
  );
}
