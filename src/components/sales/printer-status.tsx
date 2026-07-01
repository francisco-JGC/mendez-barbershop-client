import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePrinterStore } from '@/stores/printer-store';
import { PrinterSettingsDialog } from '@/components/sales/printer-settings-dialog';

const STATUS_LABEL: Record<string, string> = {
  connected: 'Impresora conectada',
  connecting: 'Conectando...',
  disconnected: 'Impresora desconectada',
  error: 'Error de conexión',
};

export function PrinterStatus() {
  const status = usePrinterStore((s) => s.status);
  const errorMessage = usePrinterStore((s) => s.errorMessage);
  const [open, setOpen] = useState(false);

  if (status === 'unsupported') {
    return (
      <p className="text-xs text-muted-foreground">
        La impresión Bluetooth solo funciona en Chrome de Android.
      </p>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              'size-2 rounded-full',
              status === 'connected' && 'bg-green-500',
              status === 'connecting' && 'bg-amber-500',
              (status === 'disconnected' || status === 'error') &&
                'bg-muted-foreground/40',
            )}
          />
          <span className="text-muted-foreground">
            {status === 'error' && errorMessage ? errorMessage : STATUS_LABEL[status]}
          </span>
        </div>

        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Settings className="size-3.5" />
          Configurar
        </Button>
      </div>

      <PrinterSettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
