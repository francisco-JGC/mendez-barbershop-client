import { KeyRound, Pencil, Plus, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useBranchAdmins,
  useSetBranchAdminActive,
} from '@/hooks/use-branches';
import { getApiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { BranchAdminFormDialog } from '@/components/branches/branch-admin-form-dialog';
import { BranchAdminResetPasswordDialog } from '@/components/branches/branch-admin-reset-password-dialog';

export function BranchAdminsTable({ branchId }: { branchId: string }) {
  const { data, isLoading } = useBranchAdmins(branchId);
  const setActiveMutation = useSetBranchAdminActive(branchId);

  async function handleToggleActive(userId: string, isActive: boolean) {
    try {
      await setActiveMutation.mutateAsync({ userId, isActive });
      toast.success(isActive ? 'Administrador activado' : 'Administrador desactivado');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el administrador'));
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <BranchAdminFormDialog
          branchId={branchId}
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Nuevo administrador
            </Button>
          }
        />
      </div>

      {data && data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead className="text-right">Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((admin) => (
              <TableRow
                key={admin.id}
                className={cn(!admin.isActive && 'opacity-60')}
              >
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {admin.email ?? '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={admin.isActive}
                    disabled={setActiveMutation.isPending}
                    onCheckedChange={(checked) =>
                      handleToggleActive(admin.id, checked)
                    }
                    aria-label={
                      admin.isActive
                        ? 'Desactivar administrador'
                        : 'Activar administrador'
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <BranchAdminFormDialog
                      branchId={branchId}
                      admin={admin}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Editar administrador">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <BranchAdminResetPasswordDialog
                      branchId={branchId}
                      admin={admin}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Restablecer contraseña"
                        >
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
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UsersIcon className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Esta sucursal no tiene administradores. Crea el primero con el botón de
            arriba.
          </p>
        </div>
      )}
    </div>
  );
}
