# Testing de Órdenes

## Stage

Paso 1 (unit) implementado y pasando (38 tests). Paso 2 (integración) propuesto, pendiente de validación del usuario. Paso 3 (E2E de RPCs) pendiente.

## Enfoque por nivel

| Nivel | Qué prueba | Herramienta | Mockea |
|---|---|---|---|
| Unit | Lógica aislada: utils, validators, actions | Vitest (node) | Cliente Supabase |
| Integración | Componentes React renderizados, interacción usuario | Vitest + jsdom + @testing-library/react | Hooks de datos (useQuery, useMutation) |
| E2E | Sistema completo: browser + servidor + base | Playwright (o similar) | Nada |

## Paso 1 — Unit (hecho)

**Dependencias instaladas:** `vitest` (devDependency).

**Archivos:**

| Archivo | Qué hace |
|---|---|
| `vitest.config.ts` | Config del runner: alias `@`, environment node, env vars de Supabase fake, include `tests/**/*.test.{ts,tsx}` |
| `tsconfig.test.json` | Config TS separada para tests (no afecta `tsc -b` del proyecto) |
| `tests/unit/supabase/mock.ts` | Mock del cliente Supabase con cola de resultados, registro de llamadas `from()` y `rpc()` |
| `tests/unit/utils/order.test.ts` | `formatDeliveryDate`, `ORDER_STATUSES`, `mapNotebook` |
| `tests/unit/validators/orderFormModal.test.ts` | `orderFormSchema`, `notebookFormSchema` |
| `tests/unit/actions/orders.test.ts` | `getOrders`, `getOrder`, `createOrder`, `updateOrder`, `changeOrderStatus`, `deleteOrder` |
| `tests/unit/actions/notebooks.test.ts` | `getAvailableNotebooks` |

**38 tests, todos pasando.** `tsc -b` y `lint` sin cambios (26 baseline).

### Cómo funciona el mock de Supabase

El mock reemplaza `@/supabase/client` con `vi.doMock`. Expone:

- **`from(table)`** — registra la llamada en `fromCalls` y devuelve un builder. El builder tiene un método por cada método de la cadena Supabase (`select`, `eq`, `order`, `range`, etc.). Cada método guarda sus argumentos en un `record` y devuelve el builder para seguir encadenando. El builder tiene `.then(resolve, reject)` para que `await` funcione: al ser llamado, saca el siguiente resultado de una cola (`resultQueue`) y lo resuelve.
- **`rpc(fn, args)`** — registra la llamada en `rpcCalls` y resuelve con el siguiente resultado de la cola.
- **`queueResult(...)`** — agrega un resultado a la cola. Cada `await` en el código bajo test consume el siguiente resultado. Esto permite simular múltiples llamadas secuenciales (ej: `deleteOrder` hace 3 consultas).
- **`fromCalls` / `rpcCalls`** — arreglos que el test inspecciona para verificar qué consulta se armó.

Ejemplo de flujo:

```
Código real:  await supabase.from("orders").select("*").eq("id", "o1").maybeSingle()
Mock:         from("orders") → builder
              .select("*")   → record.select = ["*"]
              .eq("id","o1") → record.eq = ["id","o1"]
              .maybeSingle() → record.maybeSingle = []
              await           → builder.then() → resultQueue.shift() → resolve({data, error})
```

## Paso 2 — Integración (propuesto)

**Dependencias a instalar:**
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `jsdom`

**Archivos a crear:**

### `tests/integration/setup.ts`
- Import de `@testing-library/jest-dom/vitest` (agrega matchers como `toBeInTheDocument`, `toBeDisabled`)
- Cleanup automático entre tests (desmonta el DOM de cada test)
- Se registra en `vitest.config.ts` como `setupFiles`

### `tests/integration/helpers/render.tsx`
- Wrapper `renderWithProviders` que envuelve el componente con `QueryClientProvider` + `MemoryRouter`
- `createQueryClientTest` que crea un `QueryClient` con `retry: false` (para que los errores sean inmediatos en tests)
- Evita repetir el wrapper de providers en cada test

### `tests/integration/components/orders/OrderFormModal.test.tsx`
- Mock: `useCreateOrder`
- Tests:
  - Renderiza título "Crear orden", descripción, campos (Destinatario, Fecha, Descripción), botones Cancelar/Crear orden
  - Con recipient vacío → error "El destinatario es requerido", no llama a `createOrder`
  - Con fecha vacía → error "La fecha de entrega es requerida", no llama a `createOrder`
  - Con datos válidos → llama a `createOrder` con `{ recipient, deliveryDate, description }`
  - `isPending: true` → botón submit deshabilitado, spinner visible
  - Click Cancelar → llama a `onClose`

### `tests/integration/components/orders/OrderRemoveTeamModal.test.tsx`
- Sin mocks (no usa hooks de datos)
- Tests:
  - Renderiza título "Quitar equipo", descripción con nombre del equipo
  - Muestra el Select con el estado por defecto "Listo para Donar"
  - Click "Quitar de la orden" → llama a `onConfirm` con el estado seleccionado
  - Click Cancelar → llama a `onClose`

### `tests/integration/components/orders/table/OrderColumns.test.tsx`
- Sin mocks
- Tests:
  - Tiene exactamente 3 columnas: "Destinatario", "Fecha de entrega", "Estado"
  - La columna de fecha formatea con `formatDeliveryDate`
  - La columna de destinatario renderiza el valor

### `tests/integration/components/orders/table/OrderNotebookColumns.test.tsx`
- Sin mocks
- Tests:
  - Tiene exactamente 5 columnas: Nombre, N.° de Serie, Estado, Especificaciones, Acciones
  - Fila normal → estado muestra `inventory-table-status`
  - Fila "Se quitará" con `removeStatus` → estado muestra el label del estado de retorno con clase `orders-removing-status`
  - Fila "Pendiente" → nombre incluye etiqueta "Pendiente" con clase `orders-pending-tag`
  - Sin `onRemove` → botón Acciones deshabilitado, title "solo disponible en modo edición"
  - Con `onRemove` → botón habilitado; click → llama a `onRemove` con la fila

### `tests/integration/components/shared/DataTable.test.tsx`
- Sin mocks
- Tests:
  - Con `rowState`: fila con estado → clase correcta en el `TableRow`; fila sin estado → sin clase
  - Sin `rowState`: ninguna fila tiene clase de estado (no afecta a Inventario/Asistencia)
  - `onRowClick` → click en fila llama al callback
  - `emptyMessage` → se muestra cuando no hay data
  - `isLoading` → muestra "Cargando…"
  - Con `pagination` → botones Anterior/Siguiente visibles; sin `pagination` → no visibles

### `tests/integration/components/shared/ConfirmModal.test.tsx`
- Sin mocks
- Tests:
  - `id` vacío → no renderiza nada
  - Renderiza título, descripción, botones Cancelar y confirm
  - `destructive: true` → botón confirm con clase `destructive`
  - `destructive: false` (default) → botón confirm con clase `default`
  - `isPending: true` → botones deshabilitados, texto "Procesando…"
  - Click confirm → llama a `onConfirm(id)`
  - Click Cancelar → llama a `onClose`
  - `confirmLabel` custom → se muestra en el botón

### `tests/integration/components/shared/FormModal.test.tsx`
- Sin mocks
- Tests:
  - Renderiza `title`, `description`, botón X, `children`, botones Cancelar y submit
  - `isPending: true` → botón submit deshabilitado + spinner
  - `submitLabel` → texto del botón submit
  - Click X → llama a `onClose`
  - Click Cancelar → llama a `onClose`
  - Submit del form → llama a `onSubmit`

### `tests/integration/pages/OrdersPage.test.tsx`
- Mocks: `useOrders`
- Tests:
  - Renderiza título "Órdenes", botón "Crear orden", campos de búsqueda/filtros
  - Con `isLoading: true` → "Cargando órdenes…"
  - Con `isError: true` → mensaje de error + botón "Reintentar"
  - Sin filtros, sin órdenes → "No hay órdenes disponibles"
  - Con filtros, sin resultados → "No se encontraron resultados"
  - Con datos → muestra filas y conteo "X de Y órdenes"
  - Click "Crear orden" → renderiza `OrderFormModal`

### `tests/integration/pages/OrderDetailPage.test.tsx`
- Mocks: `useOrder`, `useAvailableNotebooks`, `useUpdateOrder`, `useChangeOrderStatus`, `useDeleteOrder`
- Tests:
  - Consulta, En Preparación, sin equipos: muestra destinatario como título, "Aún no hay equipos asociados", botones Editar/Marcar como Donado/Eliminar
  - Consulta, En Preparación, con equipos: muestra filas de equipos en la tabla
  - Consulta, Donado: nota roja visible, "Eliminar orden" deshabilitado, solo "Volver a En Preparación"
  - Edición — hasChanges: Editar sin cambios → "Guardar Cambios" deshabilitado; cambiar campo → habilitado
  - Edición — quitar equipo Pendiente: click papelera en fila Pendiente → lo saca de la lista sin abrir modal
  - Edición — quitar equipo asociado: click papelera en fila normal → abre `OrderRemoveTeamModal`
  - Salir sin guardar: con cambios, click Cancelar → abre `ConfirmModal` "Se perderán los cambios"
  - Error de carga: `isError: true` → estado de error

**Total propuesto: ~60 tests en 11 archivos.**

## Paso 3 — E2E de RPCs (pendiente)

Dos tests E2E para las RPCs `save_order_changes` y `change_order_status`, corriendo contra la base de datos local de Supabase. Pendiente de definir el enfoque (Playwright, pgTAP, o similar).
