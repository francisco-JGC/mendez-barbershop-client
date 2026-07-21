import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, Loader2, Wand2 } from 'lucide-react';
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
import { useCreateUser, useUpdateUser } from '@/hooks/use-users';
import { useStations, useAssignBarber } from '@/hooks/use-stations';
import { useAuth } from '@/hooks/use-auth';
import { generatePassword } from '@/lib/generate-password';
import { getApiErrorMessage } from '@/lib/errors';
import { Role } from '@/types/auth';
import type { UserSummary } from '@/types/user';

export function UserFormDialog({
  user,
  trigger,
}: {
  user?: UserSummary;
  trigger: ReactNode;
}) {
  const isEditing = !!user;
  const { user: currentUser } = useAuth();
  const isSupervisor = currentUser?.role === Role.SUPERVISOR;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [role, setRole] = useState<Role>(user?.role ?? Role.BARBER);
  const [stationId, setStationId] = useState('');

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const assignBarberMutation = useAssignBarber();
  const { data: stations } = useStations();
  const availableStations = (stations ?? []).filter((s) => !s.currentBarberId);

  useEffect(() => {
    if (open) {
      setName(user?.name ?? '');
      setEmail(user?.email ?? '');
      setUsername(user?.username ?? '');
      setPassword('');
      setPasswordVisible(false);
      setRole(user?.role ?? Role.BARBER);
      setStationId('');
    }
  }, [open, user]);

  function handleGeneratePassword() {
    setPassword(generatePassword());
    setPasswordVisible(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const identityFields =
        role === Role.BARBER || role === Role.SELLER
          ? { username: username.trim().toLowerCase() }
          : { email: email.trim() };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: user.id,
          input: { name, role, ...identityFields },
        });
        toast.success('Usuario actualizado');
        setOpen(false);
        return;
      }

      const created = await createMutation.mutateAsync({
        name,
        password,
        role,
        ...identityFields,
      });

      if (role === Role.BARBER && stationId) {
        try {
          await assignBarberMutation.mutateAsync({ stationId, barberId: created.id });
        } catch {
          toast.warning('Usuario creado, pero no se pudo asignar la silla. Asígnala desde Sillas.');
          setOpen(false);
          return;
        }
      }

      toast.success('Usuario creado');
      setOpen(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, isEditing ? 'No se pudo actualizar el usuario' : 'No se pudo crear el usuario'),
      );
    }
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || assignBarberMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualiza los datos de este miembro del equipo.'
                : 'Agrega un administrador, barbero o vendedor a tu equipo.'}
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
            {role === Role.BARBER || role === Role.SELLER ? (
              <div className="space-y-2">
                <Label htmlFor="user-username">Nombre de usuario</Label>
                <Input
                  id="user-username"
                  placeholder="carlos.ramirez"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  pattern="[a-z0-9._\-]+"
                  minLength={3}
                  maxLength={32}
                />
                <p className="text-xs text-muted-foreground">
                  Se usa para iniciar sesión. Sólo minúsculas, números, puntos, guiones y guiones bajos.
                </p>
              </div>
            ) : (
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
            )}
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="user-password">Contraseña</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="user-password"
                      type={passwordVisible ? 'text' : 'password'}
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
                      aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <Button type="button" variant="outline" onClick={handleGeneratePassword}>
                    <Wand2 className="size-4" />
                    Generar
                  </Button>
                </div>
                {passwordVisible && password && (
                  <p className="text-xs text-muted-foreground">
                    Comparte esta contraseña con el usuario de forma segura.
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="user-role">Rol</Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as Role);
                  setStationId('');
                }}
                disabled={isEditing}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.BARBER}>Barbero</SelectItem>
                  <SelectItem value={Role.SELLER}>Vendedor</SelectItem>
                  {!isSupervisor && (
                    <SelectItem value={Role.ADMIN}>Administrador</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  El rol no se puede cambiar. Crea un nuevo usuario si necesitas otro rol.
                </p>
              )}
            </div>

            {!isEditing && role === Role.BARBER && (
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
              {isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
