const currencyFormatter = new Intl.NumberFormat('es-NI', {
  style: 'currency',
  currency: 'NIO',
});

export function formatCurrency(value: string | number): string {
  return currencyFormatter.format(Number(value));
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-NI', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function userIdentifier(user: {
  email: string | null;
  username: string | null;
}): string {
  return user.email ?? user.username ?? '';
}
