import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { roleHomePath } from '@/lib/routes';

export function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomePath(user.role)} replace />;
}
