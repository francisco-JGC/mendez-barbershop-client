import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DashboardPeriod } from '@/types/dashboard';

const PERIOD_LABEL: Record<DashboardPeriod, string> = {
  day: 'Hoy',
  yesterday: 'Ayer',
  week: 'Esta semana',
  month: 'Este mes',
};

export function PeriodTabs({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as DashboardPeriod)}>
      <TabsList>
        {Object.entries(PERIOD_LABEL).map(([period, label]) => (
          <TabsTrigger key={period} value={period}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
