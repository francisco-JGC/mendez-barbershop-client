import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { GeneralSettings } from '@/components/settings/general-settings';
import { CommissionSettings } from '@/components/settings/commission-settings';
import { ReceiptSettings } from '@/components/settings/receipt-settings';
import { PrinterSettingsForm } from '@/components/settings/printer-settings-form';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Ajusta los parámetros de tu barbería."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="commission">Comisiones</TabsTrigger>
          <TabsTrigger value="receipt">Ticket</TabsTrigger>
          <TabsTrigger value="printer">Impresora</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del comercio</CardTitle>
              <CardDescription>
                Nombre visible en el sistema y en los tickets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comisión de barberos</CardTitle>
              <CardDescription>
                Porcentaje que le corresponde al barbero por cada servicio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Formato del ticket</CardTitle>
              <CardDescription>
                Personaliza el mensaje final del ticket impreso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReceiptSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printer" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Impresora Bluetooth</CardTitle>
              <CardDescription>
                Configuración por dispositivo — se guarda en este navegador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrinterSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
