import { NavLink } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentBarbershop } from '@/hooks/use-current-barbershop';
import { tenantStorage } from '@/lib/tenant-storage';
import type { NavItem } from '@/components/layout/nav-items';

export function SidebarNav({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  // The jefe now works branch-by-branch via the header switcher, so
  // /tenants/current is available (returns the branch matching the current
  // X-Tenant-Code). Only skip the fetch if no branch is selected yet — the
  // switcher auto-selects the first active one on mount, so this window is
  // small.
  const hasTenant = Boolean(tenantStorage.get());
  const { data: currentBarbershop } = useCurrentBarbershop({
    enabled: hasTenant,
  });
  const brandName =
    currentBarbershop?.name ?? user?.barbershopName ?? 'Selecciona sucursal';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-6 py-6">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Scissors className="size-5" />
        </span>
        <span className="font-heading text-base tracking-tight truncate">
          {brandName}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/65 transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sidebar-primary" />
                )}
                <item.icon className="size-4" />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
