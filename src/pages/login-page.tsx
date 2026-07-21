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
import { getApiErrorMessage, getLoginErrorMessage } from '@/lib/errors';
import { lookupBarbershop } from '@/lib/lookup-api';
import { tenantStorage } from '@/lib/tenant-storage';
import { roleHomePath } from '@/lib/routes';

// Single form. The seller/barber fills in the branch code + credentials; the
// admin leaves the code blank because their account isn't tied to any one
// branch (Escenario A: single admin role, branch-agnostic).
export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [tenantCode, setTenantCode] = useState(tenantStorage.get() ?? '');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidatingTenant, setIsValidatingTenant] = useState(false);

  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setValidationError(null);
    const trimmedCode = tenantCode.trim().toLowerCase();

    // If a code was provided, validate the branch exists and is active before
    // attempting login — gives the user a clearer error than a generic 401
    // when they mistype the code.
    if (trimmedCode) {
      setIsValidatingTenant(true);
      try {
        const branch = await lookupBarbershop(trimmedCode);
        if (!branch.isActive) {
          setValidationError('Esta sucursal está inactiva. Contacta al administrador.');
          return;
        }
      } catch (err) {
        setValidationError(
          getApiErrorMessage(err, 'No encontramos esa sucursal. Verifica el código.'),
        );
        return;
      } finally {
        setIsValidatingTenant(false);
      }
    }

    loginMutation.mutate(
      {
        tenantCode: trimmedCode || undefined,
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

  const isSubmitting = loginMutation.isPending || isValidatingTenant;

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
              Ingresa tus credenciales para acceder al panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-code">
                  Código de sucursal{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="tenant-code"
                  autoComplete="organization"
                  placeholder="mendez"
                  value={tenantCode}
                  onChange={(e) => setTenantCode(e.target.value.toLowerCase())}
                  pattern="[a-z0-9\-]*"
                  maxLength={63}
                />
                <p className="text-xs text-muted-foreground">
                  Barberos y vendedores deben ingresarlo. Los administradores
                  pueden dejarlo vacío.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">Correo o usuario</Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="tu@barberia.com o usuario"
                  value={identifier}
                  // Normalize to lowercase live: identifiers are stored and
                  // looked up in lowercase, so what you see is what gets
                  // sent — no more mystery "credentials incorrect" errors.
                  onChange={(e) => setIdentifier(e.target.value.toLowerCase())}
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

              {validationError && (
                <Alert variant="destructive">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {loginMutation.isError && !validationError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {getLoginErrorMessage(loginMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
