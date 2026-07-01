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
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import type { Product } from '@/types/catalog';

export function ProductFormDialog({
  product,
  trigger,
}: {
  product?: Product;
  trigger: ReactNode;
}) {
  const isEditing = !!product;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(product?.lowStockThreshold ?? 3),
  );

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setName(product?.name ?? '');
      setPrice(product?.price ?? '');
      setStock(String(product?.stock ?? 0));
      setLowStockThreshold(String(product?.lowStockThreshold ?? 3));
    }
  }, [open, product]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      name,
      price,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: product.id, input: payload });
        toast.success('Producto actualizado');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Producto creado');
      }
      setOpen(false);
    } catch {
      toast.error('No se pudo guardar el producto');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar producto' : 'Nuevo producto'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualiza los datos de este producto.'
                : 'Agrega un nuevo producto a tu inventario.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nombre</Label>
              <Input
                id="product-name"
                placeholder="Cera para cabello"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price">Precio</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="80.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-threshold">
                Alertar cuando el stock sea menor o igual a
              </Label>
              <Input
                id="product-threshold"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
