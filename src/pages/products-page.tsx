import { AlertTriangle, Package, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProducts, useUpdateProduct } from '@/hooks/use-products';
import { getApiErrorMessage } from '@/lib/errors';
import { formatCurrency } from '@/lib/format';
import { ProductFormDialog } from '@/components/catalog/product-form-dialog';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';

export function ProductsPage() {
  const { data, isLoading, isError } = useProducts();
  const updateMutation = useUpdateProduct();

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await updateMutation.mutateAsync({ id, input: { isActive } });
      toast.success(isActive ? 'Producto activado' : 'Producto desactivado');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el producto'));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Inventario de productos disponibles para la venta."
        action={
          <ProductFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nuevo producto
              </Button>
            }
          />
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar los productos</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4 text-primary" />
            Inventario
          </CardTitle>
          <CardDescription>
            {data ? `${data.length} producto(s) registrados.` : 'Cargando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((product) => {
                  const isLowStock = product.stock <= product.lowStockThreshold;
                  return (
                    <TableRow
                      key={product.id}
                      className={cn(!product.isActive && 'opacity-60')}
                    >
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5',
                            isLowStock && 'font-medium text-destructive',
                          )}
                        >
                          {isLowStock && <AlertTriangle className="size-3.5" />}
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={product.isActive}
                          disabled={updateMutation.isPending}
                          onCheckedChange={(checked) =>
                            handleToggleActive(product.id, checked)
                          }
                          aria-label={
                            product.isActive
                              ? 'Desactivar producto'
                              : 'Activar producto'
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductFormDialog
                          product={product}
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Editar producto">
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todavía no tienes productos. Crea el primero con el botón de
              arriba.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
