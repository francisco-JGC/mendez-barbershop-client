import { Pencil, Plus, Scissors } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useServices } from '@/hooks/use-services';
import { formatCurrency } from '@/lib/format';
import { ServiceFormDialog } from '@/components/catalog/service-form-dialog';
import { PageHeader } from '@/components/layout/page-header';

export function ServicesPage() {
  const { data, isLoading, isError } = useServices();

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
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    <TableCell>
                      <Badge variant={service.isActive ? 'secondary' : 'outline'}>
                        {service.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ServiceFormDialog
                        service={service}
                        trigger={
                          <Button variant="ghost" size="icon">
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
