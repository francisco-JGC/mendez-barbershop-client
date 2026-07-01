# Mendez Barbershop — Frontend

Cliente web (React + Vite + Tailwind v4 + shadcn/ui) para el backend multitenant de Mendez Barbershop. Incluye login, dashboards, catálogo (servicios/productos), sillas, punto de venta e impresión de tickets por Bluetooth.

## Stack

- React 19 + TypeScript, Vite.
- Tailwind v4 (vía `@tailwindcss/vite`) + shadcn/ui (estilo "Nova", iconos Lucide).
- React Router para rutas protegidas por rol.
- TanStack Query para todo el data fetching contra la API (server state).
- Zustand para estado global de cliente que no es server state (por ahora: la conexión de la impresora Bluetooth, que debe sobrevivir aunque cambies de página).
- Axios con interceptores de access/refresh token y del código de tenant.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`.

### Cómo funciona el multitenant

El backend identifica la barbería por un código único (`code`, ej. `mendez`) que el cliente envía en el header `X-Tenant-Code`. Como por ahora solo existe una barbería, el login no le pide el código al usuario — `LoginPage` siempre manda `DEFAULT_TENANT_CODE` (definido en `lib/constants.ts`). El login de `super_admin` (que no pertenece a ningún tenant) ya no tiene UI; se hace directo contra la API (ver README del backend). Una vez logueado, el código queda guardado en `localStorage` y `api.ts` lo adjunta automáticamente en cada request — si en el futuro hay más de una barbería, basta con volver a mostrar un selector en el login.

## Estructura

```
src/
  lib/            api.ts, *-api.ts (axios por recurso), errors.ts, escpos.ts, receipt.ts, bluetooth-printer.ts
  stores/         printer-store.ts (Zustand)
  context/        AuthProvider (sesión, login/logout)
  hooks/          un hook por operación de datos (useServices, useCreateTicket, useTicketCart, ...)
  components/
    layout/       AppLayout (sidebar + topbar + drawer mobile), ProtectedRoute
    dashboard/    StatCard
    catalog/      diálogos de servicios/productos
    stations/     tarjetas de silla, diálogos de asignar/crear
    sales/        catálogo del POS, carrito, estado de impresora
    ui/           componentes shadcn
  pages/          una página por ruta
```

## Rutas

| Ruta | Acceso | Contenido |
|---|---|---|
| `/login` | pública | Formulario de inicio de sesión |
| `/admin` | rol `admin` | Dashboard: revenue, ranking de barberos, top servicio, alertas de stock |
| `/admin/services`, `/admin/products`, `/admin/stations` | rol `admin` | Catálogo e inventario, sillas |
| `/admin/sales`, `/barber/sales` | `admin` / `barbero` | Punto de venta (crear tickets) |
| `/barber` | rol `barber` | Cortes del día/mes, total generado, silla asignada |
| `/super-admin` | rol `super_admin` | Placeholder (la gestión de barberías aún no tiene UI) |

## Impresión de tickets (Bluetooth)

La impresión usa **Web Bluetooth**, así que solo funciona en **Chrome o Edge de escritorio** (no en Safari/iOS ni Firefox) y requiere que la impresora soporte **BLE** (no Bluetooth clásico/SPP).

- `src/lib/escpos.ts` — construye los bytes ESC/POS (alineación, negrita, corte de papel). El texto se pasa a ASCII quitando acentos (los térmicos genéricos no manejan UTF-8).
- `src/lib/receipt.ts` — arma el ticket completo (encabezado, items, total) a 32 caracteres por línea (papel de 58mm; ajusta `width` si la tuya es de 80mm).
- `src/lib/bluetooth-printer.ts` — conecta por Web Bluetooth y **auto-detecta** el canal de escritura probando varios perfiles BLE comunes de impresoras térmicas genéricas chinas (ISSC BLE-SPP, HM-10/HM-19, Zjiang/Xprinter). No necesitas saber el UUID exacto de tu impresora de antemano.
- `src/stores/printer-store.ts` — estado global (Zustand) de la conexión: se conecta una vez y sigue disponible aunque navegues a otra pantalla.

### Si tu impresora no conecta

El botón "Conectar" en la pantalla de Nueva venta abre el selector nativo de Bluetooth de Chrome. Si tu impresora aparece en la lista pero falla con "no se encontró un canal de impresión compatible", su firmware usa un UUID de servicio distinto a los tres que probamos por defecto. Para encontrarlo:

1. Instala una app como **nRF Connect** (Android/iOS) o usa `chrome://bluetooth-internals` en Chrome desktop.
2. Conéctate a la impresora y anota el UUID del servicio que tiene una característica con permiso de escritura (`write` o `write without response`).
3. Agrega ese UUID al arreglo `PRINTER_SERVICE_CANDIDATES` en `src/lib/bluetooth-printer.ts`.

## Pendiente / próximos pasos sugeridos

- Panel de super-admin para alta de barberías (fuera de alcance por ahora: solo hay una barbería).
- Selección de papel 58mm/80mm desde la UI en vez de solo por código.
