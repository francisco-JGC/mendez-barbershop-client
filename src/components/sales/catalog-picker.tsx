import { useState, type ReactNode } from 'react';
import { Package, Scissors, Search, type LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/hooks/use-services';
import { useProducts } from '@/hooks/use-products';
import { formatCurrency } from '@/lib/format';
import { lineKey } from '@/lib/ticket-cart';
import { cn } from '@/lib/utils';
import { TicketItemType } from '@/types/ticket';
import type { CartLine } from '@/types/ticket';

export type CatalogPickEvent = Omit<CartLine, 'quantity'>;

export function CatalogPicker({
  onPick,
  cartQuantities,
}: {
  onPick: (item: CatalogPickEvent) => void;
  cartQuantities: Map<string, number>;
}) {
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const matches = (name: string) => !query || name.toLowerCase().includes(query);

  const activeServices = (services ?? []).filter((s) => s.isActive && matches(s.name));
  const activeProducts = (products ?? []).filter((p) => p.isActive && matches(p.name));

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar servicio o producto..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loadingServices || loadingProducts ? (
        <CatalogSkeleton />
      ) : (
        <>
          <CatalogSection
            title="Servicios"
            icon={Scissors}
            emptyMessage={
              query ? 'No hay servicios que coincidan.' : 'No tienes servicios registrados.'
            }
          >
            {activeServices.map((service) => {
              const key = lineKey({ itemType: TicketItemType.SERVICE, itemId: service.id });
              return (
                <CatalogCard
                  key={service.id}
                  name={service.name}
                  price={service.price}
                  quantityInCart={cartQuantities.get(key) ?? 0}
                  onAdd={() =>
                    onPick({
                      itemType: TicketItemType.SERVICE,
                      itemId: service.id,
                      name: service.name,
                      unitPrice: service.price,
                    })
                  }
                />
              );
            })}
          </CatalogSection>

          <CatalogSection
            title="Productos"
            icon={Package}
            emptyMessage={
              query ? 'No hay productos que coincidan.' : 'No tienes productos registrados.'
            }
          >
            {activeProducts.map((product) => {
              const key = lineKey({ itemType: TicketItemType.PRODUCT, itemId: product.id });
              const quantityInCart = cartQuantities.get(key) ?? 0;
              return (
                <CatalogCard
                  key={product.id}
                  name={product.name}
                  price={product.price}
                  stock={product.stock}
                  quantityInCart={quantityInCart}
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
              );
            })}
          </CatalogSection>
        </>
      )}
    </div>
  );
}

function CatalogSection({
  title,
  icon: Icon,
  emptyMessage,
  children,
}: {
  title: string;
  icon: LucideIcon;
  emptyMessage: string;
  children: ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <div className="space-y-2.5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="size-4" />
        {title}
      </h2>
      {hasItems ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  );
}

function CatalogCard({
  name,
  price,
  stock,
  quantityInCart,
  onAdd,
}: {
  name: string;
  price: string;
  stock?: number;
  quantityInCart: number;
  onAdd: () => void;
}) {
  const atStockLimit = stock !== undefined && stock - quantityInCart <= 0;

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={atStockLimit}
      className={cn(
        'relative flex flex-col items-start gap-1 rounded-lg border px-3 py-3 text-left transition-all',
        'hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97]',
        quantityInCart > 0 && 'border-primary/50 bg-primary/5',
        atStockLimit && 'cursor-not-allowed opacity-50 hover:border-border hover:bg-transparent',
      )}
    >
      {quantityInCart > 0 && (
        <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
          {quantityInCart}
        </span>
      )}
      <span className="text-sm font-medium">{name}</span>
      <span className="font-heading text-base text-primary">{formatCurrency(price)}</span>
      {stock !== undefined && (
        <span
          className={cn(
            'text-xs text-muted-foreground',
            atStockLimit && 'font-medium text-destructive',
          )}
        >
          {atStockLimit ? 'Sin stock disponible' : `${stock - quantityInCart} disponibles`}
        </span>
      )}
    </button>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
