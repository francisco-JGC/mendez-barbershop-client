export interface Settings {
  barbershopId: string;
  commissionRate: string;
  receiptFooter: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  commissionRate?: number;
  receiptFooter?: string;
  logo?: string | null;
}
