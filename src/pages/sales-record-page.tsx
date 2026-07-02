import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/layout/page-header';
import { PaginationBar } from '@/components/layout/pagination-bar';
import { TicketDetailDialog } from '@/components/sales/ticket-detail-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useTickets } from '@/hooks/use-tickets';
import { useUsers } from '@/hooks/use-users';
import { useStations } from '@/hooks/use-stations';
import { useServices } from '@/hooks/use-services';
import { useProducts } from '@/hooks/use-products';
import { useSettings } from '@/hooks/use-settings';
import { useCurrentBarbershop } from '@/hooks/use-current-barbershop';
import { charsPerLine, usePrinterStore } from '@/stores/printer-store';
import { buildReceipt } from '@/lib/receipt';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { Role } from '@/types/auth';
import { TicketItemType, type Ticket } from '@/types/ticket';

const PAGE_SIZE = 20;
const ALL_BARBERS = 'all';

export function SalesRecordPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const [searchParams, setSearchParams] = useSearchParams();
  const barberIdParam = searchParams.get('barberId') ?? '';

  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reprintingId, setReprintingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useTickets(
    page,
    PAGE_SIZE,
    barberIdParam || undefined,
  );
  const { data: users } = useUsers(isAdmin);
  const { data: stations } = useStations();
  const { data: services } = useServices();
  const { data: products } = useProducts();
  const { data: settings } = useSettings();
  const { data: currentBarbershop } = useCurrentBarbershop();
  const printReceipt = usePrinterStore((s) => s.print);

  const barbers = (users ?? []).filter((u) => u.role === Role.BARBER);
  const filteredBarberName = barberIdParam
    ? barbers.find((b) => b.id === barberIdParam)?.name
    : null;
  const totalPages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1;

  function handleBarberChange(value: string) {
    setPage(1);
    if (value === ALL_BARBERS) {
      searchParams.delete('barberId');
    } else {
      searchParams.set('barberId', value);
    }
    setSearchParams(searchParams, { replace: true });
  }

  function barberName(barberId: string | null): string {
    if (!barberId) return 'Sin barbero';
    const found = (users ?? []).find((u) => u.id === barberId);
    if (found) return found.name;
    if (user?.userId === barberId) return user.email ?? user.username ?? 'Barbero';
    return 'Barbero';
  }

  function stationLabel(stationId: string | null): string | null {
    if (!stationId) return null;
    const found = (stations ?? []).find((s) => s.id === stationId);
    return found ? `Silla ${found.number}` : null;
  }

  function resolveItemName(itemType: Ticket['items'][number]['itemType'], itemId: string): string {
    const source = itemType === TicketItemType.SERVICE ? services : products;
    return (source ?? []).find((item) => item.id === itemId)?.name ?? 'Artículo';
  }

  async function reprint(ticket: Ticket) {
    setReprintingId(ticket.id);
    try {
      const receipt = buildReceipt({
        barbershopName:
          currentBarbershop?.name ?? user?.barbershopName ?? 'Barbería',
        ticketId: ticket.id,
        createdAt: ticket.createdAt,
        barberName: ticket.barberId ? barberName(ticket.barberId) : null,
        stationLabel: stationLabel(ticket.stationId),
        lines: ticket.items.map((item) => ({
          name: resolveItemName(item.itemType, item.itemId),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        total: ticket.total,
        footer: settings?.receiptFooter,
        width: charsPerLine(usePrinterStore.getState().paperWidth),
      });

      if (usePrinterStore.getState().status !== 'connected') {
        toast.error('Conecta la impresora antes de reimprimir.');
        return;
      }

      await printReceipt(receipt);
      toast.success('Ticket enviado a la impresora');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo reimprimir el ticket');
    } finally {
      setReprintingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de ventas"
        description={
          filteredBarberName
            ? `Historial de tickets de ${filteredBarberName}.`
            : 'Historial de tickets con la posibilidad de reimprimirlos.'
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el registro de ventas</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      {isAdmin && barbers.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Label htmlFor="barber-filter" className="text-sm text-muted-foreground">
            Barbero:
          </Label>
          <Select value={barberIdParam || ALL_BARBERS} onValueChange={handleBarberChange}>
            <SelectTrigger id="barber-filter" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_BARBERS}>Todos los barberos</SelectItem>
              {barbers.map((barber) => (
                <SelectItem key={barber.id} value={barber.id}>
                  {barber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Barbero</TableHead>
                    <TableHead>Silla</TableHead>
                    <TableHead>Artículos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        {ticket.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(ticket.createdAt)}
                      </TableCell>
                      <TableCell>{barberName(ticket.barberId)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {stationLabel(ticket.stationId) ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.items.length}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(ticket.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Reimprimir ticket"
                            disabled={reprintingId === ticket.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              void reprint(ticket);
                            }}
                          >
                            <Printer className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationBar
                page={page}
                totalPages={totalPages}
                total={data.total}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Receipt className="size-6" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  {filteredBarberName
                    ? `${filteredBarberName} todavía no tiene ventas registradas`
                    : 'Todavía no hay ventas registradas'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Los tickets aparecerán aquí conforme se registren ventas.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        barberName={selectedTicket ? barberName(selectedTicket.barberId) : ''}
        stationLabel={selectedTicket ? stationLabel(selectedTicket.stationId) : null}
        resolveItemName={resolveItemName}
        onReprint={() => selectedTicket && void reprint(selectedTicket)}
        isReprinting={!!selectedTicket && reprintingId === selectedTicket.id}
      />
    </div>
  );
}
