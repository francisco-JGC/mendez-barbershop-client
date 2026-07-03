import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  connectPrinter,
  disconnectPrinter,
  isBluetoothSupported,
  reconnectPrinter,
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

const CHARS_PER_LINE: Record<PaperWidth, number> = {
  58: 32,
  80: 48,
};

// Exponential backoff schedule used when the printer drops mid-session; the
// caller retries on each interval until it reconnects or the schedule ends.
const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 15_000];

interface PrinterStore {
  status: PrinterStatus;
  errorMessage: string | null;
  paperWidth: PaperWidth;
  autoPrint: boolean;
  /** Persisted so we can silently reconnect on page load / tab focus. */
  lastDeviceId: string | null;
  /** Human-readable name for the UI + name-filtered reconnect fallback. */
  lastDeviceName: string | null;
  /** Set when print() is called offline. Auto-flushes on reconnect. */
  pendingReceipt: Uint8Array | null;
  /** UI trigger: opens the settings dialog anywhere in the app. */
  settingsDialogOpen: boolean;
  connect: () => Promise<void>;
  tryReconnect: () => Promise<boolean>;
  disconnect: () => void;
  print: (bytes: Uint8Array) => Promise<void>;
  /**
   * Prints immediately if connected. Otherwise queues the ticket and opens
   * the settings dialog so the user can connect — the ticket is flushed
   * automatically once the connection is established.
   */
  queuePrint: (bytes: Uint8Array) => Promise<'printed' | 'queued'>;
  openSettingsDialog: () => void;
  closeSettingsDialog: () => void;
  clearPending: () => void;
  setPaperWidth: (width: PaperWidth) => void;
  setAutoPrint: (enabled: boolean) => void;
}

// The GATT handle is an imperative resource, not UI state — it lives outside
// the reactive store and is only ever touched by the actions below.
let connection: PrinterConnection | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export const usePrinterStore = create<PrinterStore>()(
  persist(
    (set, get) => {
      function handleUnexpectedDisconnect() {
        connection = null;
        set({ status: 'disconnected' });
        scheduleReconnect();
      }

      function scheduleReconnect() {
        clearReconnectTimer();
        // Silent reconnect only works when getDevices() is available. If it
        // isn't, retrying in the background is pointless — user has to click.
        if (!get().lastDeviceId) return;
        const delay =
          RECONNECT_DELAYS_MS[
            Math.min(reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)
          ];
        reconnectAttempt += 1;
        reconnectTimer = setTimeout(() => {
          if (connection || !get().lastDeviceId) return;
          void get().tryReconnect();
        }, delay);
      }

      return {
        status: isBluetoothSupported() ? 'disconnected' : 'unsupported',
        errorMessage: null,
        paperWidth: 58,
        autoPrint: true,
        lastDeviceId: null,
        lastDeviceName: null,
        pendingReceipt: null,
        settingsDialogOpen: false,

        connect: async () => {
          clearReconnectTimer();
          reconnectAttempt = 0;
          set({ status: 'connecting', errorMessage: null });
          try {
            const preferredName = get().lastDeviceName;
            connection = await connectPrinter(
              handleUnexpectedDisconnect,
              preferredName,
            );
            set({
              status: 'connected',
              lastDeviceId: connection.device.id,
              lastDeviceName: connection.device.name ?? get().lastDeviceName,
            });
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

        tryReconnect: async () => {
          const deviceId = get().lastDeviceId;
          if (!deviceId || connection || get().status === 'unsupported') {
            return false;
          }
          set({ status: 'connecting', errorMessage: null });
          try {
            const conn = await reconnectPrinter(
              deviceId,
              handleUnexpectedDisconnect,
            );
            if (!conn) {
              set({ status: 'disconnected' });
              scheduleReconnect();
              return false;
            }
            connection = conn;
            reconnectAttempt = 0;
            set({ status: 'connected' });
            return true;
          } catch {
            set({ status: 'disconnected' });
            scheduleReconnect();
            return false;
          }
        },

        disconnect: () => {
          clearReconnectTimer();
          reconnectAttempt = 0;
          if (connection) {
            disconnectPrinter(connection);
            connection = null;
          }
          set({
            status: 'disconnected',
            lastDeviceId: null,
            lastDeviceName: null,
            pendingReceipt: null,
          });
        },

        print: async (bytes) => {
          if (!connection) {
            throw new Error('Conecta la impresora antes de imprimir.');
          }
          await writeReceipt(connection, bytes);
        },

        queuePrint: async (bytes) => {
          if (connection && get().status === 'connected') {
            await writeReceipt(connection, bytes);
            return 'printed';
          }
          set({ pendingReceipt: bytes, settingsDialogOpen: true });
          return 'queued';
        },

        openSettingsDialog: () => set({ settingsDialogOpen: true }),
        closeSettingsDialog: () => set({ settingsDialogOpen: false }),
        clearPending: () => set({ pendingReceipt: null }),

        setPaperWidth: (paperWidth) => set({ paperWidth }),
        setAutoPrint: (autoPrint) => set({ autoPrint }),
      };
    },
    {
      name: 'printer-settings',
      partialize: (state) => ({
        paperWidth: state.paperWidth,
        autoPrint: state.autoPrint,
        lastDeviceId: state.lastDeviceId,
        lastDeviceName: state.lastDeviceName,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.lastDeviceId) {
          setTimeout(() => {
            void usePrinterStore.getState().tryReconnect();
          }, 0);
        }
      },
    },
  ),
);

export function charsPerLine(width: PaperWidth): number {
  return CHARS_PER_LINE[width];
}
