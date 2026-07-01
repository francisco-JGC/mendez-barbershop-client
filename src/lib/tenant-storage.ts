const TENANT_CODE_KEY = 'mendez.tenantCode';

export const tenantStorage = {
  get(): string | null {
    return localStorage.getItem(TENANT_CODE_KEY);
  },
  set(code: string): void {
    localStorage.setItem(TENANT_CODE_KEY, code);
  },
  clear(): void {
    localStorage.removeItem(TENANT_CODE_KEY);
  },
};
