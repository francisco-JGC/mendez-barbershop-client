import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { getApiErrorMessage } from '@/lib/errors';

// Keep the upload comfortably below the DTO's 200KB base64 cap.
const MAX_LOGO_SIZE_BYTES = 100 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export function ReceiptSettings() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [footer, setFooter] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
      setFooter(data.receiptFooter);
      setLogo(data.logo);
    }
  }, [data]);

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // Allow re-selecting the same file after removing.
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      toast.error('Solo se aceptan imágenes PNG o JPEG.');
      return;
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error('La imagen debe pesar menos de 100 KB.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setLogo(dataUrl);
    } catch {
      toast.error('No se pudo leer la imagen.');
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await updateMutation.mutateAsync({
        receiptFooter: footer,
        logo: logo,
      });
      toast.success('Ticket actualizado');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar el ticket'));
    }
  }

  const hasChanges = footer !== data?.receiptFooter || logo !== (data?.logo ?? null);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Logo del ticket</Label>
        <div className="flex items-start gap-4">
          <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
            {logo ? (
              <img
                src={logo}
                alt="Logo del comercio"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-muted-foreground">Sin logo</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleLogoChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              {logo ? 'Cambiar logo' : 'Subir logo'}
            </Button>
            {logo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => setLogo(null)}
              >
                <Trash2 className="size-4" />
                Quitar logo
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              PNG o JPEG. Se imprime en la parte superior del ticket. Blanco y
              negro puro da mejor resultado. Máximo 100 KB.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt-footer">Mensaje al pie del ticket</Label>
        <Textarea
          id="receipt-footer"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          maxLength={200}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Aparece centrado al final de cada ticket impreso. Se aplica también a
          reimpresiones.
        </p>
      </div>

      <Button type="submit" disabled={updateMutation.isPending || !hasChanges}>
        {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
