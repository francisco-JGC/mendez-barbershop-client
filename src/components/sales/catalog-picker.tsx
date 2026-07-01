import { AlertTriangle, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/hooks/use-services';
import { useProducts } from '@/hooks/use-products';
import { formatCurrency } from '@/lib/format';
import { TicketItemType } from '@/types/ticket';
import type { CartLine } from '@/types/ticket';
import type { Product } from '@/types/catalog';

export type CatalogPickEvent = Omit<CartLine, 'quantity'>;

export function CatalogPicker({
  onPick,
}: {
  onPick: (item: CatalogPickEvent) => void;
}) {
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: products, isLoading: loadingProducts } = useProducts();

  return (
    <Tabs defaultValue="services">
      <TabsList className="w-full">
        <TabsTrigger value="services" className="flex-1">
          Servicios
        </TabsTrigger>
        <TabsTrigger value="products" className="flex-1">
          Productos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="services" className="space-y-2">
        {loadingServices ? (
          <CatalogSkeleton />
        ) : services && services.length > 0 ? (
          services
            .filter((s) => s.isActive)
            .map((service) => (
              <CatalogRow
                key={service.id}
                name={service.name}
                price={service.price}
                onAdd={() =>
                  onPick({
                    itemType: TicketItemType.SERVICE,
                    itemId: service.id,
                    name: service.name,
                    unitPrice: service.price,
                  })
                }
              />
            ))
        ) : (
          <EmptyState message="No tienes servicios registrados." />
        )}
      </TabsContent>

      <TabsContent value="products" className="space-y-2">
        {loadingProducts ? (
          <CatalogSkeleton />
        ) : products && products.length > 0 ? (
          products
            .filter((p: Product) => p.isActive)
            .map((product) => (
              <CatalogRow
                key={product.id}
                name={product.name}
                price={product.price}
                stock={product.stock}
                onAdd={() =>
                  onPick({
                    itemType: TicketItemType.PRODUCT,
                    itemId: product.id,
                    name: product.name,
                    unitPrice: product.price,
                    maxStock: product.stock,
                  })
                }
              />
            ))
        ) : (
          <EmptyState message="No tienes productos registrados." />
        )}
      </TabsContent>
    </Tabs>
  );
}

function CatalogRow({
  name,
  price,
  stock,
  onAdd,
}: {
  name: string;
  price: string;
  stock?: number;
  onAdd: () => void;
}) {
  const outOfStock = stock === 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatCurrency(price)}</span>
          {stock !== undefined && (
            <span className={outOfStock ? 'flex items-center gap-1 text-destructive' : ''}>
              {outOfStock && <AlertTriangle className="size-3" />}
              {stock} en stock
            </span>
          )}
        </div>
      </div>
      <Button
        size="icon"
        variant="outline"
        onClick={onAdd}
        disabled={outOfStock}
        aria-label={`Agregar ${name}`}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{message}</p>;
}

function CatalogSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
