import { Bluetooth, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePrinterStore } from '@/stores/printer-store';

const STATUS_LABEL: Record<string, string> = {
  connected: 'Impresora conectada',
  connecting: 'Conectando...',
  disconnected: 'Impresora desconectada',
  error: 'Error de conexión',
};

export function PrinterStatus() {
  const status = usePrinterStore((s) => s.status);
  const errorMessage = usePrinterStore((s) => s.errorMessage);
  const connect = usePrinterStore((s) => s.connect);
  const disconnect = usePrinterStore((s) => s.disconnect);

  if (status === 'unsupported') {
    return (
      <p className="text-xs text-muted-foreground">
        La impresión Bluetooth solo funciona en Chrome o Edge de escritorio.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span
          className={cn(
            'size-2 rounded-full',
            status === 'connected' && 'bg-green-500',
            status === 'connecting' && 'bg-amber-500',
            (status === 'disconnected' || status === 'error') && 'bg-muted-foreground/40',
          )}
        />
        <span className="text-muted-foreground">
          {status === 'error' && errorMessage ? errorMessage : STATUS_LABEL[status]}
        </span>
      </div>

      {status === 'connected' ? (
        <Button size="sm" variant="ghost" onClick={disconnect}>
          Desconectar
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => void connect()}
          disabled={status === 'connecting'}
        >
          {status === 'connecting' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Bluetooth className="size-3.5" />
          )}
          Conectar
        </Button>
      )}
    </div>
  );
}
