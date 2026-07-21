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
  useCreateBranchSupervisor,
  useUpdateBranchSupervisor,
} from '@/hooks/use-branches';
import { generatePassword } from '@/lib/generate-password';
import { getApiErrorMessage } from '@/lib/errors';
import type { UserSummary } from '@/types/user';

export function BranchSupervisorFormDialog({
  branchId,
  supervisor,
  trigger,
}: {
  branchId: string;
  supervisor?: UserSummary;
  trigger: ReactNode;
}) {
  const isEditing = !!supervisor;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(supervisor?.name ?? '');
  const [username, setUsername] = useState(supervisor?.username ?? '');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const createMutation = useCreateBranchSupervisor();
  const updateMutation = useUpdateBranchSupervisor(branchId);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setName(supervisor?.name ?? '');
      setUsername(supervisor?.username ?? '');
      setPassword('');
      setPasswordVisible(false);
    }
  }, [open, supervisor]);

  function handleGeneratePassword() {
    setPassword(generatePassword());
    setPasswordVisible(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          userId: supervisor.id,
          input: { name, username },
        });
        toast.success('Supervisor actualizado');
      } else {
        await createMutation.mutateAsync({
          branchId,
          input: { name, username, password },
        });
        toast.success('Supervisor creado');
      }
      setOpen(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isEditing
            ? 'No se pudo actualizar el supervisor'
            : 'No se pudo crear el supervisor',
        ),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar supervisor' : 'Nuevo supervisor'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualiza los datos de este supervisor.'
                : 'Agrega un nuevo supervisor para esta sucursal.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supervisor-name">Nombre</Label>
              <Input
                id="supervisor-name"
                placeholder="Carlos Ramírez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor-username">Nombre de usuario</Label>
              <Input
                id="supervisor-username"
                placeholder="carlos.ramirez"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                minLength={3}
                maxLength={32}
                pattern="[a-z0-9._\-]+"
              />
              <p className="text-xs text-muted-foreground">
                Se usa junto con el código de sucursal para iniciar sesión.
                Sólo minúsculas, números, puntos, guiones y guiones bajos.
              </p>
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="supervisor-password">Contraseña</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="supervisor-password"
                      type={passwordVisible ? 'text' : 'password'}
                      minLength={8}
                      maxLength={72}
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
                      aria-label={
                        passwordVisible
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {passwordVisible ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                  >
                    <Wand2 className="size-4" />
                    Generar
                  </Button>
                </div>
                {passwordVisible && password && (
                  <p className="text-xs text-muted-foreground">
                    Compártela con el supervisor de forma segura.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear supervisor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
