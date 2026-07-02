// Formatting NIO with Intl "currency" style falls back to the ISO code
// ("NIO 1,234.56") in browsers/runtimes with reduced ICU data instead of the
// córdoba's actual sign. We format the number ourselves and prepend "C$" so
// the receipt looks right regardless of environment.
const numberFormatter = new Intl.NumberFormat('es-NI', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: string | number): string {
  return `C$${numberFormatter.format(Number(value))}`;
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
