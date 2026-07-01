import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login-page';
import { AdminDashboardPage } from '@/pages/admin-dashboard-page';
import { ServicesPage } from '@/pages/services-page';
import { ProductsPage } from '@/pages/products-page';
import { StationsPage } from '@/pages/stations-page';
import { SalesPage } from '@/pages/sales-page';
import { UsersPage } from '@/pages/users-page';
import { BarberDashboardPage } from '@/pages/barber-dashboard-page';
import { SuperAdminPlaceholderPage } from '@/pages/super-admin-placeholder-page';
import { Role } from '@/types/auth';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]} />}>
        <Route path="/super-admin" element={<SuperAdminPlaceholderPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/services" element={<ServicesPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/stations" element={<StationsPage />} />
          <Route path="/admin/sales" element={<SalesPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Role.BARBER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/barber" element={<BarberDashboardPage />} />
          <Route path="/barber/sales" element={<SalesPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
