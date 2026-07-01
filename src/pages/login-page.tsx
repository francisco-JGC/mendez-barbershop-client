import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Scissors, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useLogin } from '@/hooks/use-login';
import { getLoginErrorMessage } from '@/lib/errors';
import { BARBERSHOP_DISPLAY_NAME, DEFAULT_TENANT_CODE } from '@/lib/constants';
import { Role } from '@/types/auth';

function roleHomePath(role: Role): string {
  if (role === Role.ADMIN) return '/admin';
  if (role === Role.BARBER) return '/barber';
  return '/super-admin';
}

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    loginMutation.mutate(
      { tenantCode: DEFAULT_TENANT_CODE, email, password },
      {
        onSuccess: (loggedInUser) => {
          navigate(roleHomePath(loggedInUser.role), { replace: true });
        },
      },
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_oklch(0.7_0.16_55_/_0.22),_transparent_55%)]" />
        <div className="barber-stripes absolute inset-0" />
        <Scissors className="pointer-events-none absolute -right-16 -bottom-16 size-96 rotate-12 text-sidebar-primary/[0.06]" />

        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
            <Scissors className="size-5" />
          </span>
          {BARBERSHOP_DISPLAY_NAME}
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-flex items-center rounded-full bg-sidebar-primary/15 px-3 py-1 text-xs font-medium text-sidebar-primary">
            Panel de gestión
          </span>
          <h1 className="text-4xl leading-[1.1] tracking-tight">
            Gestiona tu barbería con estilo.
          </h1>
          <p className="max-w-md text-sm text-sidebar-foreground/70">
            Ventas, inventario, sillas y el rendimiento de cada barbero, todo
            en un solo panel pensado para el día a día del negocio.
          </p>
        </div>
        <p className="relative z-10 text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} {BARBERSHOP_DISPLAY_NAME}
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Scissors className="size-6" />
            </span>
            <span className="text-lg font-semibold">{BARBERSHOP_DISPLAY_NAME}</span>
          </div>

          <Card className="relative overflow-hidden border-border/60 shadow-xl">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
            <CardHeader>
              <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para entrar a tu panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@barberia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {loginMutation.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {getLoginErrorMessage(loginMutation.error)}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
