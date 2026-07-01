export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  price: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  barbershopId: string;
  name: string;
  barcode: string | null;
  price: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  price: string;
}

export interface UpdateServiceInput {
  name?: string;
  price?: string;
}

export interface CreateProductInput {
  name: string;
  barcode?: string;
  price: string;
  stock: number;
  lowStockThreshold?: number;
}

export interface UpdateProductInput {
  name?: string;
  barcode?: string | null;
  price?: string;
  stock?: number;
  lowStockThreshold?: number;
}
