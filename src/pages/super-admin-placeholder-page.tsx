import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function SuperAdminPlaceholderPage() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Crown className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Panel de super-admin</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          La gestión de barberías todavía no tiene interfaz en este cliente.
          Usa la API directamente o vuelve a iniciar sesión con una cuenta de
          administrador de una barbería.
        </p>
      </div>
      <Button variant="outline" onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
