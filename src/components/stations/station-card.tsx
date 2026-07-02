import { Armchair, Loader2, LogOut, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReleaseStation } from '@/hooks/use-stations';
import { AssignBarberDialog } from '@/components/stations/assign-barber-dialog';
import { cn } from '@/lib/utils';
import { StationStatus, type Station } from '@/types/station';
import type { UserSummary } from '@/types/user';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
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
        'group relative overflow-hidden transition-all',
        isOccupied
          ? 'border-primary/30 shadow-md shadow-primary/5'
          : 'border-dashed bg-muted/20',
      )}
    >
      {isOccupied && (
        <>
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/10 blur-2xl" />
        </>
      )}

      <CardContent className="flex flex-col items-center gap-5 px-5 py-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Silla
            </span>
            <span className="font-heading text-2xl leading-none tracking-tight">
              {station.number}
            </span>
          </div>
          <span
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium',
              isOccupied ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                isOccupied ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40',
              )}
            />
            {isOccupied ? 'Ocupada' : 'Disponible'}
          </span>
        </div>

        {isOccupied && barberName ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 font-heading text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/25">
                {initials(barberName)}
              </span>
            </div>
            <p className="text-center text-base font-medium leading-tight">
              {barberName}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground/70">
            <span className="flex size-20 items-center justify-center rounded-full bg-muted/60">
              <Armchair className="size-10" strokeWidth={1.4} />
            </span>
            <p className="text-sm">Sin barbero</p>
          </div>
        )}

        {isOccupied ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleRelease}
            disabled={releaseMutation.isPending}
          >
            {releaseMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Liberar silla
          </Button>
        ) : (
          <AssignBarberDialog
            station={station}
            barbers={barbers}
            trigger={
              <Button size="sm" className="w-full">
                <UserPlus className="size-4" />
                Asignar barbero
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
