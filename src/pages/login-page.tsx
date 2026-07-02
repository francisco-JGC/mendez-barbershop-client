import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useLogin } from '@/hooks/use-login';
import { getLoginErrorMessage } from '@/lib/errors';
import { tenantStorage } from '@/lib/tenant-storage';
import { roleHomePath } from '@/lib/routes';

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [asPlatform, setAsPlatform] = useState(false);
  const [tenantCode, setTenantCode] = useState(tenantStorage.get() ?? '');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    loginMutation.mutate(
      {
        tenantCode: asPlatform ? undefined : tenantCode.trim().toLowerCase(),
        identifier: identifier.trim(),
        password,
      },
      {
        onSuccess: (loggedInUser) => {
          navigate(roleHomePath(loggedInUser.role), { replace: true });
        },
      },
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Scissors className="size-5" />
          </span>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              {asPlatform
                ? 'Accede al panel de plataforma.'
                : 'Ingresa a tu sucursal para gestionar el día a día.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!asPlatform && (
                <div className="space-y-2">
                  <Label htmlFor="tenant-code">Código de sucursal</Label>
                  <Input
                    id="tenant-code"
                    autoComplete="organization"
                    placeholder="mendez"
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value.toLowerCase())}
                    required
                    pattern="[a-z0-9\-]+"
                    maxLength={63}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {asPlatform ? 'Correo' : 'Correo o usuario'}
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder={asPlatform ? 'admin@plataforma.com' : 'tu@barberia.com o usuario'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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

        <div className="text-center">
          <button
            type="button"
            onClick={() => setAsPlatform((v) => !v)}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {asPlatform
              ? 'Volver a iniciar sesión en una sucursal'
              : 'Iniciar como super admin de plataforma'}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
