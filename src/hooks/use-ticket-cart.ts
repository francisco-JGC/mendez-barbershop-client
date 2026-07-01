import { useState } from 'react';
import { lineKey } from '@/lib/ticket-cart';
import type { CartLine } from '@/types/ticket';
import type { CatalogPickEvent } from '@/components/sales/catalog-picker';

export function useTicketCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  function add(item: CatalogPickEvent) {
    const key = lineKey(item);
    setLines((prev) => {
      const existing = prev.find((l) => lineKey(l) === key);
      if (existing) {
        return prev.map((l) => (lineKey(l) === key ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function increment(key: string) {
    setLines((prev) =>
      prev.map((l) => (lineKey(l) === key ? { ...l, quantity: l.quantity + 1 } : l)),
    );
  }

  function decrement(key: string) {
    setLines((prev) =>
      prev
        .map((l) => (lineKey(l) === key ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function remove(key: string) {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }

  function clear() {
    setLines([]);
  }

  return { lines, add, increment, decrement, remove, clear };
}
