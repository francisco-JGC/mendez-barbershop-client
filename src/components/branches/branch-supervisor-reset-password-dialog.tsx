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
import { useResetBranchSupervisorPassword } from '@/hooks/use-branches';
import { generatePassword } from '@/lib/generate-password';
import { getApiErrorMessage } from '@/lib/errors';
import type { UserSummary } from '@/types/user';

export function BranchSupervisorResetPasswordDialog({
  branchId,
  supervisor,
  trigger,
}: {
  branchId: string;
  supervisor: UserSummary;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const resetMutation = useResetBranchSupervisorPassword(branchId);

  useEffect(() => {
    if (open) {
      setPassword('');
      setPasswordVisible(false);
    }
  }, [open]);

  function handleGeneratePassword() {
    setPassword(generatePassword());
    setPasswordVisible(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await resetMutation.mutateAsync({ userId: supervisor.id, password });
      toast.success('Contraseña actualizada');
      setOpen(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'No se pudo restablecer la contraseña'),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Define una nueva contraseña para{' '}
              <strong>{supervisor.name}</strong>. Se cerrarán sus sesiones
              activas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="reset-password">Nueva contraseña</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="reset-password"
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
                Comparte esta contraseña con el usuario de forma segura.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={resetMutation.isPending}>
              {resetMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Actualizar contraseña
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
