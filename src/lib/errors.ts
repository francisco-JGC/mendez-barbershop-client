import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const backendMessage = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (backendMessage) return backendMessage;
  }
  return fallback;
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    switch (error.response?.status) {
      case 404:
        return 'No encontramos ese código de establecimiento.';
      case 401:
        return 'Correo o contraseña incorrectos.';
      case 429:
        return 'Demasiados intentos. Intenta de nuevo en un minuto.';
    }
  }
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
}
