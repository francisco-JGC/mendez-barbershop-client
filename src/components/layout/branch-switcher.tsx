import { useEffect, useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBranches } from '@/hooks/use-branches';
import { tenantStorage } from '@/lib/tenant-storage';

/// Header-mounted select that lets the admin switch which branch the entire
/// admin panel is scoped to (Escenario A: single admin role, multi-branch).
///
/// When the admin picks a branch we persist it in localStorage (so the axios
/// interceptor picks it up as the X-Tenant-Code header) and then do a full
/// window reload. It's less elegant than invalidating query cache but it's
/// bulletproof: every hook, every socket, every in-memory cache starts fresh
/// against the new tenant with zero risk of stale bits leaking through.
export function BranchSwitcher() {
  const { data: branches, isLoading, isError } = useBranches();
  const [current, setCurrent] = useState<string>(() => tenantStorage.get() ?? '');

  const activeBranches = (branches ?? []).filter((b) => b.isActive);

  // Auto-select the first active branch if no tenant is stored yet. This
  // silent bootstrap doesn't reload — it happens on the first render, before
  // any /admin/* page has fetched, so there's nothing stale to wipe.
  useEffect(() => {
    if (current || activeBranches.length === 0) return;
    const first = activeBranches[0].code;
    tenantStorage.set(first);
    setCurrent(first);
  }, [current, activeBranches]);

  function handleChange(code: string) {
    if (code === current) return;
    tenantStorage.set(code);
    // Full reload — see comment on the class docstring.
    window.location.reload();
  }

  if (isLoading) {
    return (
      <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        <Loader2 className="size-3 animate-spin" />
        Cargando sucursales…
      </div>
    );
  }
  if (isError || activeBranches.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Building2 className="hidden size-4 text-muted-foreground sm:block" />
      <Select value={current} onValueChange={handleChange}>
        <SelectTrigger size="sm" className="min-w-[180px]">
          <SelectValue placeholder="Selecciona sucursal" />
        </SelectTrigger>
        <SelectContent>
          {activeBranches.map((branch) => (
            <SelectItem key={branch.id} value={branch.code}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
