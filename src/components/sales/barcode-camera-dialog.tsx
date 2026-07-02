import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function BarcodeCameraDialog({
  open,
  onOpenChange,
  onDetected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (code: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let stopScanner: (() => void) | null = null;

    async function start() {
      setStatus('loading');
      setErrorMessage(null);
      try {
        // Load lazily so scanning-only sessions don't pay the bundle cost.
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (cancelled) return;

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, _err) => {
            if (result) {
              onDetected(result.getText());
              onOpenChange(false);
            }
          },
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        stopScanner = () => controls.stop();
        setStatus('scanning');
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo iniciar la cámara';
        setErrorMessage(message);
        setStatus('error');
        toast.error(message);
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopScanner?.();
    };
  }, [open, onDetected, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear con la cámara</DialogTitle>
          <DialogDescription>
            Apunta la cámara al código de barras del producto.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-primary-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/70 text-center text-sm text-primary-foreground">
              {errorMessage}
            </div>
          )}
          {status === 'scanning' && (
            <div className="pointer-events-none absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 bg-primary/70 shadow-[0_0_16px_theme(colors.primary.DEFAULT)]" />
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Requiere permiso de cámara y conexión segura (HTTPS o localhost).
        </p>
      </DialogContent>
    </Dialog>
  );
}
