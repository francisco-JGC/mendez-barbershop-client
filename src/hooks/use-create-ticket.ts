import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '@/lib/tickets-api';
import type { CreateTicketInput } from '@/types/ticket';

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
