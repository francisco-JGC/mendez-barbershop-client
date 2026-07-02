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
  useCreateBranchAdmin,
  useUpdateBranchAdmin,
} from '@/hooks/use-branches';
import { generatePassword } from '@/lib/generate-password';
import { getApiErrorMessage } from '@/lib/errors';
import type { UserSummary } from '@/types/user';

export function BranchAdminFormDialog({
  branchId,
  admin,
  trigger,
}: {
  branchId: string;
  admin?: UserSummary;
  trigger: ReactNode;
}) {
  const isEditing = !!admin;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(admin?.name ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const createMutation = useCreateBranchAdmin();
  const updateMutation = useUpdateBranchAdmin(branchId);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setName(admin?.name ?? '');
      setEmail(admin?.email ?? '');
      setPassword('');
      setPasswordVisible(false);
    }
  }, [open, admin]);

  function handleGeneratePassword() {
    setPassword(generatePassword());
    setPasswordVisible(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          userId: admin.id,
          input: { name, email },
        });
        toast.success('Administrador actualizado');
      } else {
        await createMutation.mutateAsync({
          branchId,
          input: { name, email, password },
        });
        toast.success('Administrador creado');
      }
      setOpen(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isEditing
            ? 'No se pudo actualizar el administrador'
            : 'No se pudo crear el administrador',
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
              {isEditing ? 'Editar administrador' : 'Nuevo administrador'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualiza los datos de este administrador.'
                : 'Agrega un nuevo administrador para esta sucursal.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nombre</Label>
              <Input
                id="admin-name"
                placeholder="Carlos Ramírez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Correo</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@barberia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="admin-password">Contraseña</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="admin-password"
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
                    Compártela con el administrador de forma segura.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear administrador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
