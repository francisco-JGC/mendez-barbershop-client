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
import { useCreateStation } from '@/hooks/use-stations';

export function CreateStationDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState('');
  const createMutation = useCreateStation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await createMutation.mutateAsync({ number: Number(number) });
      toast.success('Silla creada');
      setOpen(false);
      setNumber('');
    } catch {
      toast.error('No se pudo crear la silla. Verifica que el número no esté en uso.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva silla</DialogTitle>
            <DialogDescription>
              Agrega una nueva estación de trabajo a tu barbería.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="station-number">Número de silla</Label>
            <Input
              id="station-number"
              type="number"
              min="1"
              placeholder="1"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Crear silla
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
