import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PrinterSettingsForm } from '@/components/settings/printer-settings-form';

export function PrinterSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración de impresora</DialogTitle>
          <DialogDescription>
            Conecta la impresora térmica Bluetooth y ajusta el formato del ticket.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <PrinterSettingsForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
