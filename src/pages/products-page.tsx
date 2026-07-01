import { AlertTriangle, Package, Pencil, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useProducts } from '@/hooks/use-products';
import { formatCurrency } from '@/lib/format';
import { ProductFormDialog } from '@/components/catalog/product-form-dialog';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';

export function ProductsPage() {
  const { data, isLoading, isError } = useProducts();

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
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((product) => {
                  const isLowStock = product.stock <= product.lowStockThreshold;
                  return (
                    <TableRow key={product.id}>
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
                      <TableCell>
                        <Badge variant={product.isActive ? 'secondary' : 'outline'}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductFormDialog
                          product={product}
                          trigger={
                            <Button variant="ghost" size="icon">
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
