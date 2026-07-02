import { Calendar, CalendarDays, Moon, Sun, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardPeriod } from '@/types/dashboard';

interface PeriodOption {
  id: DashboardPeriod;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

const OPTIONS: PeriodOption[] = [
  { id: 'day', label: 'Hoy', shortLabel: 'Hoy', icon: Sun },
  { id: 'yesterday', label: 'Ayer', shortLabel: 'Ayer', icon: Moon },
  { id: 'week', label: 'Esta semana', shortLabel: 'Semana', icon: CalendarDays },
  { id: 'month', label: 'Este mes', shortLabel: 'Mes', icon: Calendar },
];

export function PeriodTabs({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por período"
      className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-1"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
