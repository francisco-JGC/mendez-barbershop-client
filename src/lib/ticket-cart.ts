import type { CartLine } from '@/types/ticket';

export function lineKey(line: Pick<CartLine, 'itemType' | 'itemId'>): string {
  return `${line.itemType}-${line.itemId}`;
}
