import { useRef, useState, type FormEvent } from 'react';
import { Barcode, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchProductByBarcode } from '@/lib/catalog-api';
import { getApiErrorMessage } from '@/lib/errors';
import { TicketItemType } from '@/types/ticket';
import type { CatalogPickEvent } from '@/components/sales/catalog-picker';
import { BarcodeCameraDialog } from '@/components/sales/barcode-camera-dialog';

export function BarcodeScannerInput({
  onPick,
}: {
  onPick: (item: CatalogPickEvent) => void;
}) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processCode(code: string) {
    if (!code || loading) return;
    setLoading(true);
    try {
      const product = await fetchProductByBarcode(code);
      onPick({
        itemType: TicketItemType.PRODUCT,
        itemId: product.id,
        name: product.name,
        unitPrice: product.price,
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

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void processCode(value.trim());
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
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
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Escanear con cámara"
          onClick={() => setCameraOpen(true)}
          disabled={loading}
        >
          <Camera className="size-4" />
        </Button>
      </form>

      <BarcodeCameraDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onDetected={(code) => void processCode(code)}
      />
    </>
  );
}
