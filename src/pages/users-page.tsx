import { KeyRound, Pencil, Plus, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsers, useSetUserActive } from '@/hooks/use-users';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/errors';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { ResetPasswordDialog } from '@/components/users/reset-password-dialog';
import { PageHeader } from '@/components/layout/page-header';
import { Role } from '@/types/auth';

const ROLE_LABEL: Record<string, string> = {
  [Role.ADMIN]: 'Administrador',
  [Role.BARBER]: 'Barbero',
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError } = useUsers();
  const setActiveMutation = useSetUserActive();

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await setActiveMutation.mutateAsync({ id, isActive });
      toast.success(isActive ? 'Usuario activado' : 'Usuario desactivado');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el usuario'));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Administradores y barberos de tu barbería."
        action={
          <UserFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nuevo usuario
              </Button>
            }
          />
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar los usuarios</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UsersIcon className="size-4 text-primary" />
            Equipo
          </CardTitle>
          <CardDescription>
            {data ? `${data.length} usuario(s) registrados.` : 'Cargando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email ?? user.username ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ROLE_LABEL[user.role] ?? user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={user.isActive}
                        disabled={
                          user.id === currentUser?.userId || setActiveMutation.isPending
                        }
                        onCheckedChange={(checked) => handleToggleActive(user.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <UserFormDialog
                          user={user}
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Editar usuario">
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <ResetPasswordDialog
                          user={user}
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Restablecer contraseña">
                              <KeyRound className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todavía no tienes usuarios. Crea el primero con el botón de
              arriba.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
