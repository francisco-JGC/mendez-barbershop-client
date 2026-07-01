import { api } from '@/lib/api';
import type { CreateTicketInput, Ticket } from '@/types/ticket';

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const { data } = await api.post<Ticket>('/tickets', input);
  return data;
}
