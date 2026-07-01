const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export function formatCurrency(value: string | number): string {
  return currencyFormatter.format(Number(value));
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
