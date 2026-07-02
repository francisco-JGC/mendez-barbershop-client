import { ArrowLeft, Building2, Users as UsersIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useBranch } from '@/hooks/use-branches';
import { BranchInfoForm } from '@/components/branches/branch-info-form';
import { BranchAdminsTable } from '@/components/branches/branch-admins-table';

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: branch, isLoading, isError } = useBranch(id);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/super-admin/branches">
            <ArrowLeft className="size-4" />
            Volver a sucursales
          </Link>
        </Button>
      </div>

      <PageHeader
        title={branch?.name ?? 'Sucursal'}
        description={branch ? `Código: ${branch.code}` : 'Cargando...'}
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar la sucursal</AlertTitle>
          <AlertDescription>
            Intenta recargar la página en unos segundos.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : branch ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-primary" />
                Información general
              </CardTitle>
              <CardDescription>
                Datos básicos y estado de la sucursal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BranchInfoForm branch={branch} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersIcon className="size-4 text-primary" />
                Administradores
              </CardTitle>
              <CardDescription>
                Usuarios que gestionan el día a día de esta sucursal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BranchAdminsTable branchId={branch.id} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
