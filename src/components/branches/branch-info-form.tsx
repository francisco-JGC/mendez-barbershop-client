import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSetBranchActive, useUpdateBranch } from '@/hooks/use-branches';
import { getApiErrorMessage } from '@/lib/errors';
import type { Branch } from '@/types/branch';

export function BranchInfoForm({ branch }: { branch: Branch }) {
  const [name, setName] = useState(branch.name);
  const updateMutation = useUpdateBranch(branch.id);
  const setActiveMutation = useSetBranchActive();

  useEffect(() => {
    setName(branch.name);
  }, [branch.name]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await updateMutation.mutateAsync({ name: name.trim() });
      toast.success('Sucursal actualizada');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar la sucursal'));
    }
  }

  async function handleToggleActive(isActive: boolean) {
    try {
      await setActiveMutation.mutateAsync({ id: branch.id, isActive });
      toast.success(isActive ? 'Sucursal activada' : 'Sucursal desactivada');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar la sucursal'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="branch-name">Nombre</Label>
        <Input
          id="branch-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Código</Label>
        <Input value={branch.code} disabled />
        <p className="text-xs text-muted-foreground">
          El código es fijo — los usuarios lo usan para iniciar sesión.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
        <div className="space-y-0.5">
          <Label htmlFor="branch-active" className="cursor-pointer">
            Sucursal activa
          </Label>
          <p className="text-xs text-muted-foreground">
            Si la desactivas, sus usuarios no podrán iniciar sesión.
          </p>
        </div>
        <Switch
          id="branch-active"
          checked={branch.isActive}
          disabled={setActiveMutation.isPending}
          onCheckedChange={handleToggleActive}
        />
      </div>

      <Button
        type="submit"
        disabled={
          updateMutation.isPending || !name.trim() || name.trim() === branch.name
        }
      >
        {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
