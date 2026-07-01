import { useState } from 'react';
import { Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { charsPerLine, usePrinterStore } from '@/stores/printer-store';
import { buildReceipt } from '@/lib/receipt';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { BARBERSHOP_DISPLAY_NAME } from '@/lib/constants';
import { Role } from '@/types/auth';
import { TicketItemType, type Ticket } from '@/types/ticket';

const PAGE_SIZE = 20;

export function SalesRecordPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reprintingId, setReprintingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useTickets(page, PAGE_SIZE);
  const { data: users } = useUsers(isAdmin);
  const { data: stations } = useStations();
  const { data: services } = useServices();
  const { data: products } = useProducts();
  const printReceipt = usePrinterStore((s) => s.print);

  const totalPages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1;

  function barberName(barberId: string | null): string {
    if (!barberId) return 'Sin barbero';
    const found = (users ?? []).find((u) => u.id === barberId);
    if (found) return found.name;
    if (user?.userId === barberId) return user.email;
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
        barbershopName: BARBERSHOP_DISPLAY_NAME,
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
        description="Historial de tickets con la posibilidad de reimprimirlos."
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el registro de ventas</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
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
                <p className="text-sm font-medium">Todavía no hay ventas registradas</p>
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
