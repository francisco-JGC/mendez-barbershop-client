import { create } from 'zustand';
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

interface PrinterStore {
  status: PrinterStatus;
  errorMessage: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  print: (bytes: Uint8Array) => Promise<void>;
}

// The GATT handle is an imperative resource, not UI state — it lives outside
// the reactive store and is only ever touched by the actions below.
let connection: PrinterConnection | null = null;

export const usePrinterStore = create<PrinterStore>((set) => ({
  status: isBluetoothSupported() ? 'disconnected' : 'unsupported',
  errorMessage: null,

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
}));
