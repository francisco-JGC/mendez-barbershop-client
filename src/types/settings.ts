export interface Settings {
  barbershopId: string;
  commissionRate: string;
  receiptFooter: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  commissionRate?: number;
  receiptFooter?: string;
}
