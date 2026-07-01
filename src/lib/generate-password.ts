const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%&';

export function generatePassword(length = 12): string {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => CHARSET[value % CHARSET.length]).join('');
}
