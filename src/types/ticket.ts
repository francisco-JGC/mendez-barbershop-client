export const TicketItemType = {
  SERVICE: 'service',
  PRODUCT: 'product',
} as const;

export type TicketItemType = (typeof TicketItemType)[keyof typeof TicketItemType];

export interface TicketItem {
  id: string;
  ticketId: string;
  itemType: TicketItemType;
  itemId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface Ticket {
  id: string;
  barbershopId: string;
  barberId: string | null;
  stationId: string | null;
  total: string;
  items: TicketItem[];
  createdAt: string;
}

export interface CreateTicketItemInput {
  itemType: TicketItemType;
  itemId: string;
  quantity: number;
}

export interface CreateTicketInput {
  barberId?: string;
  items: CreateTicketItemInput[];
}

export interface PaginatedTickets {
  items: Ticket[];
  total: number;
}

export interface CartLine {
  itemType: TicketItemType;
  itemId: string;
  name: string;
  unitPrice: string;
  quantity: number;
}
