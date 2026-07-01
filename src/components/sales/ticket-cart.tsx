import { Armchair, Loader2, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/format';
import { lineKey } from '@/lib/ticket-cart';
import { TicketItemType, type CartLine } from '@/types/ticket';
import type { UserSummary } from '@/types/user';

export function TicketCart({
  lines,
  onIncrement,
  onDecrement,
  onRemove,
  showBarberSelect,
  barbers,
  barberId,
  onBarberChange,
  stationHint,
  onSubmit,
  isSubmitting,
}: {
  lines: CartLine[];
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
  showBarberSelect: boolean;
  barbers: UserSummary[];
  barberId: string;
  onBarberChange: (value: string) => void;
  stationHint: string | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const total = lines.reduce((sum, line) => sum + Number(line.unitPrice) * line.quantity, 0);
  const hasService = lines.some((line) => line.itemType === TicketItemType.SERVICE);
  const barberRequired = showBarberSelect && hasService;
  const canSubmit = lines.length > 0 && (!barberRequired || !!barberId);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-2 overflow-y-auto">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <ShoppingCart className="size-8" />
            <p className="text-sm">Agrega servicios o productos del catálogo.</p>
          </div>
        ) : (
          lines.map((line) => {
            const key = lineKey(line);
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(line.unitPrice)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7"
                    onClick={() => onDecrement(key)}
                    aria-label={`Quitar uno de ${line.name}`}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">
                    {line.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7"
                    onClick={() => onIncrement(key)}
                    aria-label={`Agregar uno de ${line.name}`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <p className="w-20 text-right text-sm font-semibold">
                  {formatCurrency(Number(line.unitPrice) * line.quantity)}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(key)}
                  aria-label={`Quitar ${line.name} del ticket`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        {showBarberSelect && (
          <div className="space-y-1.5">
            <Label htmlFor="ticket-barber">
              Barbero{!barberRequired && ' (opcional)'}
            </Label>
            <Select value={barberId} onValueChange={onBarberChange}>
              <SelectTrigger id="ticket-barber" className="w-full">
                <SelectValue
                  placeholder={
                    barberRequired
                      ? 'Selecciona un barbero'
                      : 'Sin barbero (venta de producto)'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {stationHint && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Armchair className="size-4" />
            {stationHint}
          </div>
        )}

        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <Button className="w-full" disabled={!canSubmit || isSubmitting} onClick={onSubmit}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Cobrar
        </Button>
      </div>
    </div>
  );
}
