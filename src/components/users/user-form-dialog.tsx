import { useState, type FormEvent, type ReactNode } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUser } from '@/hooks/use-users';
import { useStations, useAssignBarber } from '@/hooks/use-stations';
import { getApiErrorMessage } from '@/lib/errors';
import { Role } from '@/types/auth';

export function UserFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.BARBER);
  const [stationId, setStationId] = useState('');

  const createMutation = useCreateUser();
  const assignBarberMutation = useAssignBarber();
  const { data: stations } = useStations();
  const availableStations = (stations ?? []).filter((s) => !s.currentBarberId);

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setRole(Role.BARBER);
    setStationId('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const created = await createMutation.mutateAsync({ name, email, password, role });

      if (role === Role.BARBER && stationId) {
        try {
          await assignBarberMutation.mutateAsync({ stationId, barberId: created.id });
        } catch {
          toast.warning('Usuario creado, pero no se pudo asignar la silla. Asígnala desde Sillas.');
          setOpen(false);
          resetForm();
          return;
        }
      }

      toast.success('Usuario creado');
      setOpen(false);
      resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo crear el usuario'));
    }
  }

  const isSubmitting = createMutation.isPending || assignBarberMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Agrega un administrador o barbero a tu equipo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nombre</Label>
              <Input
                id="user-name"
                placeholder="Carlos Ramírez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Correo</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="carlos@barberia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Contraseña</Label>
              <Input
                id="user-password"
                type="password"
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Rol</Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as Role);
                  setStationId('');
                }}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.BARBER}>Barbero</SelectItem>
                  <SelectItem value={Role.ADMIN}>Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === Role.BARBER && (
              <div className="space-y-2">
                <Label htmlFor="user-station">Silla</Label>
                {availableStations.length > 0 ? (
                  <Select value={stationId} onValueChange={setStationId}>
                    <SelectTrigger id="user-station" className="w-full">
                      <SelectValue placeholder="Selecciona una silla" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          Silla {station.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No hay sillas disponibles. Puedes crear una en "Sillas" y
                    asignarla después.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Crear usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
