import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, fetchProducts, updateProduct } from '@/lib/catalog-api';
import type { CreateProductInput, UpdateProductInput } from '@/types/catalog';

const PRODUCTS_KEY = ['products'];

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: fetchProducts,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      updateProduct(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
