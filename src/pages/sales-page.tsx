import { useState } from 'react';
import { toast } from 'sonner';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useStations } from '@/hooks/use-stations';
import { useUsers } from '@/hooks/use-users';
import { useCreateTicket } from '@/hooks/use-create-ticket';
import { useTicketCart } from '@/hooks/use-ticket-cart';
import { CatalogPicker } from '@/components/sales/catalog-picker';
import { TicketCart } from '@/components/sales/ticket-cart';
import { PrinterStatus } from '@/components/sales/printer-status';
import { charsPerLine, usePrinterStore } from '@/stores/printer-store';
import { getApiErrorMessage } from '@/lib/errors';
import { buildReceipt } from '@/lib/receipt';
import { lineKey } from '@/lib/ticket-cart';
import { BARBERSHOP_DISPLAY_NAME } from '@/lib/constants';
import { PageHeader } from '@/components/layout/page-header';
import { Role } from '@/types/auth';

export function SalesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const { data: stations } = useStations();
  const { data: users } = useUsers(isAdmin);
  const createTicketMutation = useCreateTicket();
  const cart = useTicketCart();
  const printReceipt = usePrinterStore((s) => s.print);

  const [barberId, setBarberId] = useState('');
  const [lastReceipt, setLastReceipt] = useState<Uint8Array | null>(null);

  const barbers = (users ?? []).filter((u) => u.role === Role.BARBER && u.isActive);
  const cartQuantities = new Map(cart.lines.map((l) => [lineKey(l), l.quantity]));

  function resolveBarberName(id: string | null): string | null {
    if (!id) return null;
    const found = barbers.find((b) => b.id === id);
    if (found) return found.name;
    if (user?.userId === id) return user.email;
    return 'Barbero';
  }

  function resolveStationLabel(id: string | null): string | null {
    const found = (stations ?? []).find((s) => s.id === id);
    return found ? `Silla ${found.number}` : null;
  }

  function stationLabelForBarber(id: string): string | null {
    const found = (stations ?? []).find((s) => s.currentBarberId === id);
    return found ? `Silla ${found.number}` : null;
  }

  const selectedBarberId = isAdmin ? barberId : user?.userId;
  const stationHint = selectedBarberId ? stationLabelForBarber(selectedBarberId) : null;

  async function handlePrint(bytes: Uint8Array) {
    try {
      await printReceipt(bytes);
      toast.success('Ticket enviado a la impresora');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo imprimir el ticket');
    }
  }

  async function handleSubmit() {
    try {
      const ticket = await createTicketMutation.mutateAsync({
        barberId: isAdmin && barberId ? barberId : undefined,
        items: cart.lines.map((l) => ({
          itemType: l.itemType,
          itemId: l.itemId,
          quantity: l.quantity,
        })),
      });

      const { paperWidth, autoPrint, status } = usePrinterStore.getState();
      const receipt = buildReceipt({
        barbershopName: BARBERSHOP_DISPLAY_NAME,
        ticketId: ticket.id,
        createdAt: ticket.createdAt,
        barberName: resolveBarberName(ticket.barberId),
        stationLabel: resolveStationLabel(ticket.stationId),
        lines: cart.lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
        total: ticket.total,
        width: charsPerLine(paperWidth),
      });
      setLastReceipt(receipt);

      toast.success(`Venta registrada por ${ticket.total}`);
      cart.clear();

      if (autoPrint && status === 'connected') {
        await handlePrint(receipt);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo registrar la venta'));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva venta"
        description="Agrega los servicios y productos de esta venta."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catálogo</CardTitle>
          </CardHeader>
          <CardContent>
            <CatalogPicker onPick={cart.add} cartQuantities={cartQuantities} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              <TicketCart
                lines={cart.lines}
                onIncrement={cart.increment}
                onDecrement={cart.decrement}
                onRemove={cart.remove}
                showBarberSelect={isAdmin}
                barbers={barbers}
                barberId={barberId}
                onBarberChange={setBarberId}
                stationHint={stationHint}
                onSubmit={handleSubmit}
                isSubmitting={createTicketMutation.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 px-4 py-4">
              <PrinterStatus />
              {lastReceipt && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => void handlePrint(lastReceipt)}
                >
                  <Printer className="size-4" />
                  Reimprimir último ticket
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
