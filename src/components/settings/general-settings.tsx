import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCurrentBarbershop,
  useUpdateBarbershopName,
} from '@/hooks/use-current-barbershop';
import { getApiErrorMessage } from '@/lib/errors';

export function GeneralSettings() {
  const { data, isLoading } = useCurrentBarbershop();
  const updateMutation = useUpdateBarbershopName();
  const [name, setName] = useState('');

  useEffect(() => {
    if (data) setName(data.name);
  }, [data]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await updateMutation.mutateAsync(name.trim());
      toast.success('Nombre actualizado');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el nombre'));
    }
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="branch-name">Nombre del comercio</Label>
        <Input
          id="branch-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
        />
        <p className="text-xs text-muted-foreground">
          Se muestra en el ticket impreso y en la interfaz de tu equipo.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Código de la sucursal</Label>
        <Input value={data?.code ?? ''} disabled />
        <p className="text-xs text-muted-foreground">
          El código es fijo — se usa para iniciar sesión en tu sucursal.
        </p>
      </div>

      <Button
        type="submit"
        disabled={
          updateMutation.isPending || !name.trim() || name.trim() === data?.name
        }
      >
        {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
