import { Align, ReceiptBuilder, twoColumns } from '@/lib/escpos';
import { formatCurrency, formatDateTime } from '@/lib/format';

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
  barberName?: string | null;
  stationLabel?: string | null;
  lines: ReceiptLineItem[];
  total: string;
  footer?: string;
  width?: number;
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
    .line(`Fecha: ${formatDateTime(input.createdAt)}`);

  if (input.barberName) {
    receipt.line(`Barbero: ${input.barberName}`);
  }

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
    .align(Align.CENTER);

  const footer = input.footer?.trim();
  if (footer) {
    for (const footerLine of footer.split('\n')) {
      receipt.line(footerLine);
    }
  }

  receipt.newline(3).cut();

  return receipt.build();
}
