import { api } from '@/lib/api';
import type { CreateTicketInput, PaginatedTickets, Ticket } from '@/types/ticket';

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const { data } = await api.post<Ticket>('/tickets', input);
  return data;
}

export async function listTickets(
  page: number,
  limit: number,
  barberId?: string,
): Promise<PaginatedTickets> {
  const { data } = await api.get<PaginatedTickets>('/tickets', {
    params: {
      page,
      limit,
      ...(barberId ? { barberId } : {}),
    },
  });
  return data;
}
