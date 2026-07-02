import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Scissors } from 'lucide-react';
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
import { getApiErrorMessage, getLoginErrorMessage } from '@/lib/errors';
import { lookupBarbershop, type BarbershopLookup } from '@/lib/lookup-api';
import { tenantStorage } from '@/lib/tenant-storage';
import { roleHomePath } from '@/lib/routes';

type LoginStep = 'code' | 'credentials';

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [asPlatform, setAsPlatform] = useState(false);
  const [step, setStep] = useState<LoginStep>('code');
  const [tenantCode, setTenantCode] = useState(tenantStorage.get() ?? '');
  const [tenant, setTenant] = useState<BarbershopLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    setLookupError(null);
    setLookupLoading(true);
    try {
      const result = await lookupBarbershop(tenantCode.trim().toLowerCase());
      if (!result.isActive) {
        setLookupError('Esta sucursal está inactiva. Contacta al administrador.');
        return;
      }
      setTenant(result);
      setStep('credentials');
    } catch (err) {
      setLookupError(
        getApiErrorMessage(err, 'No encontramos esa sucursal. Verifica el código.'),
      );
    } finally {
      setLookupLoading(false);
    }
  }

  function handleBack() {
    setStep('code');
    setTenant(null);
    setIdentifier('');
    setPassword('');
    loginMutation.reset();
  }

  function handleCredentialsSubmit(event: FormEvent) {
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

  function togglePlatformMode() {
    setAsPlatform((v) => !v);
    setStep('code');
    setTenant(null);
    setIdentifier('');
    setPassword('');
    loginMutation.reset();
    setLookupError(null);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        {step === 'credentials' && tenant?.logo ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl border bg-background shadow-sm">
              <img
                src={tenant.logo}
                alt={tenant.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Scissors className="size-5" />
            </span>
          </div>
        )}

        {asPlatform ? (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Panel de plataforma</CardTitle>
              <CardDescription>
                Ingresa con tu cuenta de super administrador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Correo</Label>
                  <Input
                    id="identifier"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@plataforma.com"
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
                  {loginMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : step === 'code' ? (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Buscar sucursal</CardTitle>
              <CardDescription>
                Ingresa el código de tu barbería para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCodeSubmit} className="space-y-4">
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
                    autoFocus
                  />
                </div>

                {lookupError && (
                  <Alert variant="destructive">
                    <AlertDescription>{lookupError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={lookupLoading}>
                  {lookupLoading && <Loader2 className="size-4 animate-spin" />}
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">
                Bienvenido a {tenant?.name}
              </CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Correo o usuario</Label>
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="tu@barberia.com o usuario"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
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
                  {loginMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Entrar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={handleBack}
                >
                  <ArrowLeft className="size-4" />
                  Cambiar sucursal
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={togglePlatformMode}
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
