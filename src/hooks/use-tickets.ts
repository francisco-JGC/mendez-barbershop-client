import { useQuery } from '@tanstack/react-query';
import { listTickets } from '@/lib/tickets-api';

export function useTickets(page: number, limit = 20, barberId?: string) {
  return useQuery({
    queryKey: ['tickets', page, limit, barberId ?? null],
    queryFn: () => listTickets(page, limit, barberId),
    placeholderData: (previousData) => previousData,
  });
}
