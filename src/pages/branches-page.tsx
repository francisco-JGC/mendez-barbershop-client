import { Building2, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useBranches, useSetBranchActive } from '@/hooks/use-branches';
import { getApiErrorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { PageHeader } from '@/components/layout/page-header';
import { BranchFormDialog } from '@/components/branches/branch-form-dialog';

export function BranchesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useBranches();
  const setActiveMutation = useSetBranchActive();

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await setActiveMutation.mutateAsync({ id, isActive });
      toast.success(isActive ? 'Sucursal activada' : 'Sucursal desactivada');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar la sucursal'));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sucursales"
        description="Barberías registradas en el sistema."
        action={
          <BranchFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nueva sucursal
              </Button>
            }
          />
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar las sucursales</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-4 text-primary" />
            Barberías
          </CardTitle>
          <CardDescription>
            {data ? `${data.length} sucursal(es) registradas.` : 'Cargando...'}
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
                  <TableHead>Código</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Activa</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((branch) => (
                  <TableRow
                    key={branch.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/super-admin/branches/${branch.id}`)}
                  >
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {branch.code}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(branch.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? 'secondary' : 'outline'}>
                        {branch.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={branch.isActive}
                        disabled={setActiveMutation.isPending}
                        onCheckedChange={(checked) =>
                          handleToggleActive(branch.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="ml-auto size-4 text-muted-foreground/60" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todavía no hay sucursales registradas. Crea la primera con el
              botón de arriba.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
