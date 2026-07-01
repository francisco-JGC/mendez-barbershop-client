import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAssignBarber } from '@/hooks/use-stations';
import type { Station } from '@/types/station';
import type { UserSummary } from '@/types/user';

export function AssignBarberDialog({
  station,
  barbers,
  trigger,
}: {
  station: Station;
  barbers: UserSummary[];
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [barberId, setBarberId] = useState(station.currentBarberId ?? '');
  const assignMutation = useAssignBarber();

  async function handleConfirm() {
    if (!barberId) return;
    try {
      await assignMutation.mutateAsync({ stationId: station.id, barberId });
      toast.success('Barbero asignado');
      setOpen(false);
    } catch {
      toast.error('No se pudo asignar el barbero');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar barbero a la silla {station.number}</DialogTitle>
          <DialogDescription>
            Selecciona qué barbero va a ocupar esta silla.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="barber-select">Barbero</Label>
          {barbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes barberos activos registrados todavía.
            </p>
          ) : (
            <Select value={barberId} onValueChange={setBarberId}>
              <SelectTrigger id="barber-select" className="w-full">
                <SelectValue placeholder="Selecciona un barbero" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!barberId || assignMutation.isPending}
          >
            {assignMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
