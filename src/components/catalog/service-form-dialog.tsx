import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
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
import { useCreateService, useUpdateService } from '@/hooks/use-services';
import type { Service } from '@/types/catalog';

export function ServiceFormDialog({
  service,
  trigger,
}: {
  service?: Service;
  trigger: ReactNode;
}) {
  const isEditing = !!service;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(service?.name ?? '');
  const [price, setPrice] = useState(service?.price ?? '');

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setName(service?.name ?? '');
      setPrice(service?.price ?? '');
    }
  }, [open, service]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: service.id,
          input: { name, price },
        });
        toast.success('Servicio actualizado');
      } else {
        await createMutation.mutateAsync({ name, price });
        toast.success('Servicio creado');
      }
      setOpen(false);
    } catch {
      toast.error('No se pudo guardar el servicio');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar servicio' : 'Nuevo servicio'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualiza el nombre o precio de este servicio.'
                : 'Agrega un nuevo corte o servicio a tu catálogo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Nombre</Label>
              <Input
                id="service-name"
                placeholder="Corte clásico"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-price">Precio</Label>
              <Input
                id="service-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
