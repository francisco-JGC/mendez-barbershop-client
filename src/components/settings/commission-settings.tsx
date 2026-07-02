import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { getApiErrorMessage } from '@/lib/errors';

export function CommissionSettings() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [percent, setPercent] = useState('');

  useEffect(() => {
    if (data) setPercent((Number(data.commissionRate) * 100).toFixed(2).replace(/\.?0+$/, ''));
  }, [data]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = Number(percent);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      toast.error('Ingresa un porcentaje entre 0 y 100.');
      return;
    }
    try {
      await updateMutation.mutateAsync({ commissionRate: value / 100 });
      toast.success('Comisión actualizada');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar la comisión'));
    }
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="commission-rate">
          Porcentaje del barbero por servicio
        </Label>
        <div className="relative w-40">
          <Input
            id="commission-rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            required
            className="pr-8"
          />
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Se aplica sólo a los servicios (no a productos). Afecta todos los
          cálculos históricos y futuros en el dashboard.
        </p>
      </div>

      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
