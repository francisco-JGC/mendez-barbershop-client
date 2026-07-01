import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden shadow-sm',
        accent && 'ring-primary/25',
      )}
    >
      {accent && (
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
      )}
      <CardContent className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-3xl leading-none tracking-tight">
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            accent
              ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
