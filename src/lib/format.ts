const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export function formatCurrency(value: string | number): string {
  return currencyFormatter.format(Number(value));
}
