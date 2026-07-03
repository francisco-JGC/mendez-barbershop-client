import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePrinterStore } from '@/stores/printer-store';
import { PrinterSettingsDialog } from '@/components/sales/printer-settings-dialog';

/**
 * Renders the printer settings dialog and auto-flushes any pending receipt
 * once the printer becomes connected. Mount once at the root of the app so
 * any page can call `queuePrint()` and have the connect-then-print flow work.
 */
export function PrinterAutoDialog() {
  const status = usePrinterStore((s) => s.status);
  const pendingReceipt = usePrinterStore((s) => s.pendingReceipt);
  const settingsDialogOpen = usePrinterStore((s) => s.settingsDialogOpen);
  const openSettingsDialog = usePrinterStore((s) => s.openSettingsDialog);
  const closeSettingsDialog = usePrinterStore((s) => s.closeSettingsDialog);
  const print = usePrinterStore((s) => s.print);
  const clearPending = usePrinterStore((s) => s.clearPending);

  useEffect(() => {
    if (status !== 'connected' || !pendingReceipt) return;
    let cancelled = false;
    (async () => {
      try {
        await print(pendingReceipt);
        if (!cancelled) {
          toast.success('Ticket enviado a la impresora');
          clearPending();
          closeSettingsDialog();
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : 'No se pudo imprimir el ticket',
          );
          clearPending();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, pendingReceipt, print, clearPending, closeSettingsDialog]);

  return (
    <PrinterSettingsDialog
      open={settingsDialogOpen}
      onOpenChange={(open) => (open ? openSettingsDialog() : closeSettingsDialog())}
    />
  );
}
