import { useState, type ComponentType } from 'react';
import {
  HandCoins,
  Printer,
  Receipt,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { GeneralSettings } from '@/components/settings/general-settings';
import { CommissionSettings } from '@/components/settings/commission-settings';
import { ReceiptSettings } from '@/components/settings/receipt-settings';
import { PrinterSettingsForm } from '@/components/settings/printer-settings-form';
import { cn } from '@/lib/utils';

interface SettingsSection {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  title: string;
  Component: ComponentType;
}

const SECTIONS: SettingsSection[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Nombre y datos del comercio',
    icon: Store,
    title: 'Información del comercio',
    Component: GeneralSettings,
  },
  {
    id: 'commission',
    label: 'Comisiones',
    description: 'Porcentaje de los barberos',
    icon: HandCoins,
    title: 'Comisión de barberos',
    Component: CommissionSettings,
  },
  {
    id: 'receipt',
    label: 'Ticket',
    description: 'Formato del ticket impreso',
    icon: Receipt,
    title: 'Formato del ticket',
    Component: ReceiptSettings,
  },
  {
    id: 'printer',
    label: 'Impresora',
    description: 'Bluetooth y ancho del papel',
    icon: Printer,
    title: 'Impresora Bluetooth',
    Component: PrinterSettingsForm,
  },
];

export function SettingsPage() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Ajusta los parámetros de tu barbería."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveId(section.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors',
                  isActive
                    ? 'border-border bg-muted/60'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight',
                      isActive ? 'text-foreground' : 'text-inherit',
                    )}
                  >
                    {section.label}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{active.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveComponent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
