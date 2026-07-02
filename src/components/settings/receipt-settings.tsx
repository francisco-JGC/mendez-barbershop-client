import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { getApiErrorMessage } from '@/lib/errors';

export function ReceiptSettings() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [footer, setFooter] = useState('');

  useEffect(() => {
    if (data) setFooter(data.receiptFooter);
  }, [data]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await updateMutation.mutateAsync({ receiptFooter: footer });
      toast.success('Ticket actualizado');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el ticket'));
    }
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="receipt-footer">Mensaje al pie del ticket</Label>
        <Textarea
          id="receipt-footer"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          maxLength={200}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Aparece centrado al final de cada ticket impreso. Se aplica también a
          reimpresiones.
        </p>
      </div>

      <Button
        type="submit"
        disabled={updateMutation.isPending || footer === data?.receiptFooter}
      >
        {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
