import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { HomeRedirect } from '@/components/layout/home-redirect';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login-page';
import { AdminDashboardPage } from '@/pages/admin-dashboard-page';
import { ServicesPage } from '@/pages/services-page';
import { ProductsPage } from '@/pages/products-page';
import { StationsPage } from '@/pages/stations-page';
import { SalesPage } from '@/pages/sales-page';
import { SalesRecordPage } from '@/pages/sales-record-page';
import { UsersPage } from '@/pages/users-page';
import { SettingsPage } from '@/pages/settings-page';
import { BarberDashboardPage } from '@/pages/barber-dashboard-page';
import { BranchesPage } from '@/pages/branches-page';
import { BranchDetailPage } from '@/pages/branch-detail-page';
import { Role } from '@/types/auth';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Branch panel — admins (multi-branch via header switcher) and
          supervisors (single-branch) share the same routes. Supervisors are
          additionally restricted at the endpoint level from crossing into
          other branches or promoting users. */}
      <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERVISOR]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/services" element={<ServicesPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/stations" element={<StationsPage />} />
          <Route path="/admin/sales" element={<SalesPage />} />
          <Route path="/admin/sales-record" element={<SalesRecordPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Branch management (create / activate / assign supervisors) is
          admin-only. */}
      <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/branches" element={<BranchesPage />} />
          <Route path="/admin/branches/:id" element={<BranchDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Role.BARBER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/barber" element={<BarberDashboardPage />} />
        </Route>
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
