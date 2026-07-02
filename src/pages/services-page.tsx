import { Pencil, Plus, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useServices, useUpdateService } from '@/hooks/use-services';
import { getApiErrorMessage } from '@/lib/errors';
import { formatCurrency } from '@/lib/format';
import { ServiceFormDialog } from '@/components/catalog/service-form-dialog';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';

export function ServicesPage() {
  const { data, isLoading, isError } = useServices();
  const updateMutation = useUpdateService();

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await updateMutation.mutateAsync({ id, input: { isActive } });
      toast.success(isActive ? 'Servicio activado' : 'Servicio desactivado');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el servicio'));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servicios"
        description="Cortes y servicios que ofrece tu barbería."
        action={
          <ServiceFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nuevo servicio
              </Button>
            }
          />
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar los servicios</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scissors className="size-4 text-primary" />
            Catálogo de servicios
          </CardTitle>
          <CardDescription>
            {data ? `${data.length} servicio(s) registrados.` : 'Cargando...'}
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
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((service) => (
                  <TableRow
                    key={service.id}
                    className={cn(!service.isActive && 'opacity-60')}
                  >
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={service.isActive}
                        disabled={updateMutation.isPending}
                        onCheckedChange={(checked) =>
                          handleToggleActive(service.id, checked)
                        }
                        aria-label={
                          service.isActive
                            ? 'Desactivar servicio'
                            : 'Activar servicio'
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <ServiceFormDialog
                        service={service}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Editar servicio">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todavía no tienes servicios. Crea el primero con el botón de
              arriba.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
