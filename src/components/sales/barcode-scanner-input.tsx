import { useRef, useState, type FormEvent } from 'react';
import { Barcode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { fetchProductByBarcode } from '@/lib/catalog-api';
import { getApiErrorMessage } from '@/lib/errors';
import { TicketItemType } from '@/types/ticket';
import type { CatalogPickEvent } from '@/components/sales/catalog-picker';

export function BarcodeScannerInput({
  onPick,
}: {
  onPick: (item: CatalogPickEvent) => void;
}) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const code = value.trim();
    if (!code || loading) return;

    setLoading(true);
    try {
      const product = await fetchProductByBarcode(code);
      if (product.stock <= 0) {
        toast.error(`${product.name} está sin stock.`);
        return;
      }
      onPick({
        itemType: TicketItemType.PRODUCT,
        itemId: product.id,
        name: product.name,
        unitPrice: product.price,
        maxStock: product.stock,
      });
      toast.success(`${product.name} agregado`);
      setValue('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Código no encontrado'));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {loading ? (
        <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <Barcode className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        ref={inputRef}
        placeholder="Escanear código de barras..."
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        disabled={loading}
      />
    </form>
  );
}
