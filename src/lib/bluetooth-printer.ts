// Generic BLE GATT service UUIDs used by common cheap thermal printer
// boards (58mm/80mm ESC/POS printers sold under many different brand
// names). We don't know in advance which one a given printer exposes, so
// on connect we try each candidate service and use whichever one exposes
// a writable characteristic.
const PRINTER_SERVICE_CANDIDATES = [
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC BLE-SPP (very common on generic thermal printer boards)
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10/HM-19 UART clones
  '0000ff00-0000-1000-8000-00805f9b34fb', // Zjiang / Xprinter-style clones
];

const CHUNK_SIZE = 100;
const CHUNK_DELAY_MS = 20;

export interface PrinterConnection {
  device: BluetoothDevice;
  characteristic: BluetoothRemoteGATTCharacteristic;
  useWriteWithoutResponse: boolean;
}

export function isBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.bluetooth;
}

async function findWritableCharacteristic(
  server: BluetoothRemoteGATTServer,
): Promise<BluetoothRemoteGATTCharacteristic | null> {
  for (const serviceUuid of PRINTER_SERVICE_CANDIDATES) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      const characteristics = await service.getCharacteristics();
      const writable = characteristics.find(
        (c) => c.properties.write || c.properties.writeWithoutResponse,
      );
      if (writable) return writable;
    } catch {
      // This candidate service isn't present on this device — try the next one.
    }
  }
  return null;
}

async function bindToDevice(
  device: BluetoothDevice,
  onDisconnected: () => void,
): Promise<PrinterConnection> {
  device.addEventListener('gattserverdisconnected', onDisconnected);

  const server = await device.gatt?.connect();
  if (!server) {
    throw new Error('No se pudo conectar con la impresora.');
  }

  const characteristic = await findWritableCharacteristic(server);
  if (!characteristic) {
    server.disconnect();
    throw new Error(
      'Se conectó al dispositivo pero no se encontró un canal de impresión compatible con esta impresora.',
    );
  }

  return {
    device,
    characteristic,
    useWriteWithoutResponse:
      !characteristic.properties.write && characteristic.properties.writeWithoutResponse,
  };
}

export async function connectPrinter(
  onDisconnected: () => void,
  preferredName?: string | null,
): Promise<PrinterConnection> {
  if (!isBluetoothSupported()) {
    throw new Error(
      'Este navegador no soporta Web Bluetooth. Usa Chrome en Android.',
    );
  }

  // If we already know which printer the user paired last, filter the picker
  // by exact name so the dialog opens with just that device (one tap to
  // reconnect). First-time connects fall back to showing everything.
  const options: RequestDeviceOptions = preferredName
    ? {
        filters: [{ name: preferredName }],
        optionalServices: PRINTER_SERVICE_CANDIDATES,
      }
    : {
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICE_CANDIDATES,
      };

  const device = await navigator.bluetooth.requestDevice(options);
  return bindToDevice(device, onDisconnected);
}

/**
 * Attempts to reconnect to a previously-authorized printer without any user
 * gesture, using `navigator.bluetooth.getDevices()`. Returns null if the
 * device is no longer authorized, out of range, or the browser doesn't
 * support the API — the caller falls back to a manual connect.
 */
export async function reconnectPrinter(
  deviceId: string,
  onDisconnected: () => void,
): Promise<PrinterConnection | null> {
  if (!isBluetoothSupported()) return null;
  // `getDevices` isn't in every Chrome version — feature-detect before using.
  const getDevices = (
    navigator.bluetooth as unknown as {
      getDevices?: () => Promise<BluetoothDevice[]>;
    }
  ).getDevices;
  if (typeof getDevices !== 'function') return null;

  try {
    const devices = await getDevices.call(navigator.bluetooth);
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return null;
    return await bindToDevice(device, onDisconnected);
  } catch {
    return null;
  }
}

export function disconnectPrinter(connection: PrinterConnection): void {
  connection.device.gatt?.disconnect();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function writeReceipt(
  connection: PrinterConnection,
  bytes: Uint8Array,
): Promise<void> {
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    const chunk = bytes.slice(offset, offset + CHUNK_SIZE);
    if (connection.useWriteWithoutResponse) {
      await connection.characteristic.writeValueWithoutResponse(chunk);
    } else {
      await connection.characteristic.writeValueWithResponse(chunk);
    }
    await sleep(CHUNK_DELAY_MS);
  }
}
