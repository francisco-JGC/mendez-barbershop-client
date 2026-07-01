import { useQuery } from '@tanstack/react-query';
import { listTickets } from '@/lib/tickets-api';

export function useTickets(page: number, limit = 20) {
  return useQuery({
    queryKey: ['tickets', page, limit],
    queryFn: () => listTickets(page, limit),
    placeholderData: (previousData) => previousData,
  });
}
