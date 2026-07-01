import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  connectPrinter,
  disconnectPrinter,
  isBluetoothSupported,
  writeReceipt,
  type PrinterConnection,
} from '@/lib/bluetooth-printer';

export type PrinterStatus =
  | 'unsupported'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export type PaperWidth = 58 | 80;

// Characters per line depends on the printer model, not just paper width, but
// these defaults match the standard 8-dot/mm density used by nearly every
// generic ESC/POS 58mm/80mm printer sold as a PT-210 / Zjiang / Xprinter clone.
const CHARS_PER_LINE: Record<PaperWidth, number> = {
  58: 32,
  80: 48,
};

interface PrinterStore {
  status: PrinterStatus;
  errorMessage: string | null;
  paperWidth: PaperWidth;
  autoPrint: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  print: (bytes: Uint8Array) => Promise<void>;
  setPaperWidth: (width: PaperWidth) => void;
  setAutoPrint: (enabled: boolean) => void;
}

// The GATT handle is an imperative resource, not UI state — it lives outside
// the reactive store and is only ever touched by the actions below.
let connection: PrinterConnection | null = null;

export const usePrinterStore = create<PrinterStore>()(
  persist(
    (set) => ({
      status: isBluetoothSupported() ? 'disconnected' : 'unsupported',
      errorMessage: null,
      paperWidth: 58,
      autoPrint: true,

      connect: async () => {
        set({ status: 'connecting', errorMessage: null });

        try {
          connection = await connectPrinter(() => {
            connection = null;
            set({ status: 'disconnected' });
          });
          set({ status: 'connected' });
        } catch (error) {
          connection = null;
          set({
            status: 'error',
            errorMessage:
              error instanceof Error
                ? error.message
                : 'No se pudo conectar la impresora.',
          });
        }
      },

      disconnect: () => {
        if (connection) {
          disconnectPrinter(connection);
          connection = null;
        }
        set({ status: 'disconnected' });
      },

      print: async (bytes) => {
        if (!connection) {
          throw new Error('Conecta la impresora antes de imprimir.');
        }
        await writeReceipt(connection, bytes);
      },

      setPaperWidth: (paperWidth) => set({ paperWidth }),
      setAutoPrint: (autoPrint) => set({ autoPrint }),
    }),
    {
      name: 'printer-settings',
      partialize: (state) => ({
        paperWidth: state.paperWidth,
        autoPrint: state.autoPrint,
      }),
    },
  ),
);

export function charsPerLine(width: PaperWidth): number {
  return CHARS_PER_LINE[width];
}
