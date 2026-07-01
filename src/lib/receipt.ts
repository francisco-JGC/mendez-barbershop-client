import { Align, ReceiptBuilder, twoColumns } from '@/lib/escpos';
import { formatCurrency } from '@/lib/format';

const DEFAULT_WIDTH = 32; // characters per line on a standard 58mm thermal printer

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  unitPrice: string;
}

export interface ReceiptInput {
  barbershopName: string;
  ticketId: string;
  createdAt: string;
  barberName: string;
  stationLabel?: string | null;
  lines: ReceiptLineItem[];
  total: string;
  width?: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function buildReceipt(input: ReceiptInput): Uint8Array {
  const width = input.width ?? DEFAULT_WIDTH;

  const receipt = new ReceiptBuilder()
    .align(Align.CENTER)
    .bold(true)
    .doubleHeight(true)
    .line(input.barbershopName)
    .doubleHeight(false)
    .bold(false)
    .newline()
    .align(Align.LEFT)
    .line(`Ticket: ${input.ticketId.slice(0, 8).toUpperCase()}`)
    .line(`Fecha: ${formatDate(input.createdAt)}`)
    .line(`Barbero: ${input.barberName}`);

  if (input.stationLabel) {
    receipt.line(`Silla: ${input.stationLabel}`);
  }

  receipt.divider(width);

  for (const item of input.lines) {
    const subtotal = formatCurrency(Number(item.unitPrice) * item.quantity);
    receipt.line(twoColumns(`${item.quantity}x ${item.name}`, subtotal, width));
  }

  receipt
    .divider(width)
    .bold(true)
    .line(twoColumns('TOTAL', formatCurrency(input.total), width))
    .bold(false)
    .newline()
    .align(Align.CENTER)
    .line('Gracias por su visita')
    .newline(3)
    .cut();

  return receipt.build();
}
