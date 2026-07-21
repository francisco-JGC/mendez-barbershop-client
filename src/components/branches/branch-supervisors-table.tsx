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
  useBranchSupervisors,
  useSetBranchSupervisorActive,
} from '@/hooks/use-branches';
import { getApiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { BranchSupervisorFormDialog } from '@/components/branches/branch-supervisor-form-dialog';
import { BranchSupervisorResetPasswordDialog } from '@/components/branches/branch-supervisor-reset-password-dialog';

export function BranchSupervisorsTable({ branchId }: { branchId: string }) {
  const { data, isLoading } = useBranchSupervisors(branchId);
  const setActiveMutation = useSetBranchSupervisorActive(branchId);

  async function handleToggleActive(userId: string, isActive: boolean) {
    try {
      await setActiveMutation.mutateAsync({ userId, isActive });
      toast.success(
        isActive ? 'Supervisor activado' : 'Supervisor desactivado',
      );
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'No se pudo actualizar el supervisor'),
      );
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
        <BranchSupervisorFormDialog
          branchId={branchId}
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Nuevo supervisor
            </Button>
          }
        />
      </div>

      {data && data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((supervisor) => (
              <TableRow
                key={supervisor.id}
                className={cn(!supervisor.isActive && 'opacity-60')}
              >
                <TableCell className="font-medium">{supervisor.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {supervisor.username ?? '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={supervisor.isActive}
                    disabled={setActiveMutation.isPending}
                    onCheckedChange={(checked) =>
                      handleToggleActive(supervisor.id, checked)
                    }
                    aria-label={
                      supervisor.isActive
                        ? 'Desactivar supervisor'
                        : 'Activar supervisor'
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <BranchSupervisorFormDialog
                      branchId={branchId}
                      supervisor={supervisor}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar supervisor"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <BranchSupervisorResetPasswordDialog
                      branchId={branchId}
                      supervisor={supervisor}
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
            Esta sucursal no tiene supervisores. Crea el primero con el botón
            de arriba.
          </p>
        </div>
      )}
    </div>
  );
}
