import { Bluetooth, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePrinterStore, type PaperWidth } from '@/stores/printer-store';

const STATUS_LABEL: Record<string, string> = {
  connected: 'Impresora conectada',
  connecting: 'Conectando...',
  disconnected: 'Impresora desconectada',
  error: 'Error de conexión',
};

export function PrinterSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const status = usePrinterStore((s) => s.status);
  const errorMessage = usePrinterStore((s) => s.errorMessage);
  const paperWidth = usePrinterStore((s) => s.paperWidth);
  const autoPrint = usePrinterStore((s) => s.autoPrint);
  const connect = usePrinterStore((s) => s.connect);
  const disconnect = usePrinterStore((s) => s.disconnect);
  const setPaperWidth = usePrinterStore((s) => s.setPaperWidth);
  const setAutoPrint = usePrinterStore((s) => s.setAutoPrint);

  const unsupported = status === 'unsupported';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración de impresora</DialogTitle>
          <DialogDescription>
            Conecta la impresora térmica Bluetooth y ajusta el formato del ticket.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {unsupported ? (
            <p className="rounded-lg border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
              Este navegador no soporta Web Bluetooth. Usa Chrome en Android para
              conectar la impresora.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
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
                  {status === 'error' && errorMessage
                    ? errorMessage
                    : STATUS_LABEL[status]}
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
          )}

          <div className="space-y-2">
            <Label htmlFor="paper-width">Ancho del papel</Label>
            <Select
              value={String(paperWidth)}
              onValueChange={(value) => setPaperWidth(Number(value) as PaperWidth)}
            >
              <SelectTrigger id="paper-width" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="58">58 mm (32 caracteres)</SelectItem>
                <SelectItem value="80">80 mm (48 caracteres)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="auto-print">Imprimir al cobrar</Label>
              <p className="text-xs text-muted-foreground">
                Envía el ticket a la impresora automáticamente al registrar una venta.
              </p>
            </div>
            <Switch
              id="auto-print"
              checked={autoPrint}
              onCheckedChange={setAutoPrint}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
