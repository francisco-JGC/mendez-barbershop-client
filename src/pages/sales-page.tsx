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
import { usePrinterStore } from '@/stores/printer-store';
import { getApiErrorMessage } from '@/lib/errors';
import { buildReceipt } from '@/lib/receipt';
import { BARBERSHOP_DISPLAY_NAME } from '@/lib/constants';
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
  const [stationId, setStationId] = useState('');
  const [lastReceipt, setLastReceipt] = useState<Uint8Array | null>(null);

  const barbers = (users ?? []).filter((u) => u.role === Role.BARBER && u.isActive);

  function resolveBarberName(id: string): string {
    const found = barbers.find((b) => b.id === id);
    if (found) return found.name;
    if (user?.userId === id) return user.email;
    return 'Barbero';
  }

  function resolveStationLabel(id: string | null): string | null {
    const found = (stations ?? []).find((s) => s.id === id);
    return found ? `Silla ${found.number}` : null;
  }

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
        barberId: isAdmin ? barberId : undefined,
        stationId: stationId || undefined,
        items: cart.lines.map((l) => ({
          itemType: l.itemType,
          itemId: l.itemId,
          quantity: l.quantity,
        })),
      });

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
      });
      setLastReceipt(receipt);

      toast.success(`Venta registrada por ${ticket.total}`);
      cart.clear();
      setStationId('');

      if (usePrinterStore.getState().status === 'connected') {
        await handlePrint(receipt);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo registrar la venta'));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva venta</h1>
        <p className="text-sm text-muted-foreground">
          Agrega los servicios y productos de esta venta.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catálogo</CardTitle>
          </CardHeader>
          <CardContent>
            <CatalogPicker onPick={cart.add} />
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
                stations={stations ?? []}
                stationId={stationId}
                onStationChange={setStationId}
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
