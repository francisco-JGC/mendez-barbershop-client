import { api } from '@/lib/api';
import type {
  CreateProductInput,
  CreateServiceInput,
  Product,
  Service,
  UpdateProductInput,
  UpdateServiceInput,
} from '@/types/catalog';

export async function fetchServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>('/services');
  return data;
}

export async function createService(input: CreateServiceInput): Promise<Service> {
  const { data } = await api.post<Service>('/services', input);
  return data;
}

export async function updateService(
  id: string,
  input: UpdateServiceInput,
): Promise<Service> {
  const { data } = await api.patch<Service>(`/services/${id}`, input);
  return data;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products');
  return data;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await api.post<Product>('/products', input);
  return data;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, input);
  return data;
}

export async function fetchProductByBarcode(barcode: string): Promise<Product> {
  const { data } = await api.get<Product>(
    `/products/by-barcode/${encodeURIComponent(barcode)}`,
  );
  return data;
}
