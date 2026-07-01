import { Loader2, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { Ticket } from '@/types/ticket';

export function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  barberName,
  stationLabel,
  resolveItemName,
  onReprint,
  isReprinting,
}: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barberName: string;
  stationLabel: string | null;
  resolveItemName: (itemType: Ticket['items'][number]['itemType'], itemId: string) => string;
  onReprint: () => void;
  isReprinting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Ticket {ticket ? ticket.id.slice(0, 8).toUpperCase() : ''}
          </DialogTitle>
          <DialogDescription>
            {ticket && formatDateTime(ticket.createdAt)} &middot; {barberName}
            {stationLabel ? ` · ${stationLabel}` : ''}
          </DialogDescription>
        </DialogHeader>

        {ticket && (
          <div className="space-y-4 py-2">
            <div className="divide-y rounded-lg border">
              {ticket.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {resolveItemName(item.itemType, item.itemId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-sm font-medium">Total</p>
              <p className="font-heading text-lg">{formatCurrency(ticket.total)}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onReprint} disabled={isReprinting}>
            {isReprinting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Printer className="size-4" />
            )}
            Reimprimir ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
