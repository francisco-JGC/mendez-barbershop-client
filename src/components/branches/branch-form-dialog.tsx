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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  useCreateBranch,
  useCreateBranchSupervisor,
} from '@/hooks/use-branches';
import { generatePassword } from '@/lib/generate-password';
import { getApiErrorMessage } from '@/lib/errors';

const CODE_PATTERN = /^[a-z0-9-]+$/;
const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

export function BranchFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const [createSupervisor, setCreateSupervisor] = useState(true);
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorUsername, setSupervisorUsername] = useState('');
  const [supervisorPassword, setSupervisorPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const createBranchMutation = useCreateBranch();
  const createSupervisorMutation = useCreateBranchSupervisor();

  useEffect(() => {
    if (open) {
      setName('');
      setCode('');
      setCreateSupervisor(true);
      setSupervisorName('');
      setSupervisorUsername('');
      setSupervisorPassword('');
      setPasswordVisible(false);
    }
  }, [open]);

  function handleGeneratePassword() {
    setSupervisorPassword(generatePassword());
    setPasswordVisible(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!CODE_PATTERN.test(code)) {
      toast.error('El código solo puede contener minúsculas, números y guiones.');
      return;
    }

    if (createSupervisor && !USERNAME_PATTERN.test(supervisorUsername)) {
      toast.error(
        'El usuario del supervisor solo puede contener minúsculas, números, puntos, guiones y guiones bajos.',
      );
      return;
    }

    try {
      const branch = await createBranchMutation.mutateAsync({ name, code });

      if (createSupervisor) {
        try {
          await createSupervisorMutation.mutateAsync({
            branchId: branch.id,
            input: {
              name: supervisorName,
              username: supervisorUsername,
              password: supervisorPassword,
            },
          });
          toast.success(`Sucursal "${branch.name}" y supervisor creados`);
        } catch (err) {
          toast.warning(
            `Sucursal creada, pero no se pudo crear el supervisor: ${getApiErrorMessage(err, 'error desconocido')}`,
          );
          setOpen(false);
          return;
        }
      } else {
        toast.success(`Sucursal "${branch.name}" creada`);
      }

      setOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo crear la sucursal'));
    }
  }

  const isSubmitting =
    createBranchMutation.isPending || createSupervisorMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva sucursal</DialogTitle>
            <DialogDescription>
              Registra una nueva barbería y, opcionalmente, su primer supervisor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Nombre</Label>
              <Input
                id="branch-name"
                placeholder="Barbería Méndez Centro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-code">Código</Label>
              <Input
                id="branch-code"
                placeholder="mendez-centro"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase())}
                required
                maxLength={63}
                pattern="[a-z0-9\-]+"
              />
              <p className="text-xs text-muted-foreground">
                Se usa para identificar la sucursal al iniciar sesión. Sólo
                minúsculas, números y guiones.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label htmlFor="create-supervisor">Crear supervisor ahora</Label>
                <p className="text-xs text-muted-foreground">
                  Si lo omites, podrás crearlo después desde la lista de
                  sucursales.
                </p>
              </div>
              <Switch
                id="create-supervisor"
                checked={createSupervisor}
                onCheckedChange={setCreateSupervisor}
              />
            </div>

            {createSupervisor && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisor-name">Nombre del supervisor</Label>
                  <Input
                    id="supervisor-name"
                    placeholder="Carlos Ramírez"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    required
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor-username">Nombre de usuario</Label>
                  <Input
                    id="supervisor-username"
                    placeholder="carlos.ramirez"
                    value={supervisorUsername}
                    onChange={(e) =>
                      setSupervisorUsername(e.target.value.toLowerCase())
                    }
                    required
                    minLength={3}
                    maxLength={32}
                    pattern="[a-z0-9._\-]+"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se usa junto al código de sucursal para iniciar sesión.
                    Sólo minúsculas, números, puntos, guiones y guiones bajos.
                  </p>
                </div>
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
                        value={supervisorPassword}
                        onChange={(e) => setSupervisorPassword(e.target.value)}
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
                  {passwordVisible && supervisorPassword && (
                    <p className="text-xs text-muted-foreground">
                      Compártela con el supervisor de forma segura.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Crear sucursal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
