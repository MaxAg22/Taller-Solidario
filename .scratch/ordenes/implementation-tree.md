# Órdenes — árbol de implementación

Arbol de tareas que lleva el diseño asentado en `design.md` y `program-design.md` al código, con la matriz de validación manual que lo prueba.

## Decisiones tomadas por el usuario

- La matriz de pruebas es manual: el proyecto no tiene suite de tests (sin vitest/jest, sin script `test`), así que no hay filas automatizadas.
- La migración queda solo como archivo `.sql`: **no** se aplica al proyecto remoto enlazado `Taller-Solidario-Pruebas` (`biedfvxlnwmapqiwlgtr`).
- Las dos RPC se declaran a mano en los tipos generados, porque sin la migración aplicada `public.Functions` está vacío y `supabase.rpc(...)` no compila. Es una desviación del programa de diseño, que decía que los tipos no se escriben a mano: cuando la migración se aplique y los tipos se regeneren, lo escrito a mano se reemplaza por lo generado.
- No se toca el CLI de Supabase: el devDependency `supabase@2.64.2` no parsea `supabase/config.toml` (clave `[local_smtp]`) y queda como está.
- La validación manual la corre el usuario con navegador, no el subagente de implementación.

## Árbol

```text
Órdenes — implementación
├─ T0  Rama feature/ordenes desde main
├─ T1  Persistencia: migración SQL + tipos de las RPC          (bloquea T2)
├─ T2  Contratos de aplicación: interfaces, estado, acciones, hooks
├─ T3  Tabla compartida y mudanzas de componentes
├─ T4  Lista y creación de órdenes
├─ T5  Detalle y gestión de una orden
├─ T6  Integración de órdenes en Inventario
├─ T7  Búsqueda del inventario sobre todos los registros
├─ T8  Rutas y navegación (después de que existan las páginas)
└─ T9  Verificación: npm run lint + npm run build
```

### T0 — Rama

`feature/ordenes` desde `main`. Los artefactos de `.scratch/ordenes/` y de `docs/` viajan con la rama.

### T1 — Persistencia

`supabase/migrations/<timestamp>_order_transactions.sql`:

- `save_order_changes(p_order_id, p_recipient, p_delivery_date, p_description, p_attach, p_detach)` — plpgsql, devuelve void. Lee la orden con `FOR UPDATE`; exige que exista y esté `En Preparación`; exige `recipient` no vacío y `delivery_date` no nula; valida cada equipo de `attach` (existe, `status = 'Listo para Donar'`, `order_id` nulo, no repetido en la lista) y cada equipo de `detach` (existe, `order_id = p_order_id`, el estado pedido es uno de los estados de equipo, no aparece también en `attach`); escribe `orders.recipient/deliveryDate/description`, `notebooks.order_id` de los que se asocian y `order_id = null` más `status` de los que se desvinculan.
- `change_order_status(p_order_id, p_status)` — plpgsql, devuelve void. Lee la orden con `FOR UPDATE`; exige que exista, que `p_status` sea `En Preparación` o `Donado` y que sea distinto del estado actual; escribe `orders.status` y el estado de los equipos asociados (`Donado` o `Listo para Donar` según `p_status`).

Postgres envuelve cada llamada a función en una transacción implícita: no hace falta `BEGIN`/`COMMIT` en el cuerpo.

- `ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('En Preparación','Donado'))`. La tabla estaba vacía al especificarse esto.
- Sin `GRANT`: Postgres concede `EXECUTE` sobre funciones a `PUBLIC` por defecto.
- Sin `CHECK` sobre `notebooks.status`: esa validación vive dentro de `save_order_changes`, en la lista de `detach`.

Los tipos de las dos RPC se declaran a mano en `src/supabase/supabase.ts` y en `supabase/supabase.ts` (hoy copias idénticas), en `public.Functions`. Se anotan como desviación.

### T2 — Contratos de aplicación

- `src/utils/orderStatus.ts` — `ORDER_STATUSES` con valor, etiqueta y color, como `src/utils/notebookStatus.ts`.
- `src/interfaces/order.interface.ts` — payloads de `updateOrder` (id, recipient, deliveryDate, description, attach, detach) y `changeOrderStatus` (id, status), `OrderDraft`, estado de orden y props de modales. Exportado desde `src/interfaces/index.ts`.
- `src/actions/orders.ts` — `getOrders`, `getOrder`, `createOrder`, `updateOrder`, `changeOrderStatus`, `deleteOrder`. Exportado desde `src/actions/index.ts`.
- `src/hooks/orders/` — `useOrders.ts`, `useOrder.ts`, `useCreateOrder.ts`, `useUpdateOrder.ts`, `useChangeOrderStatus.ts`, `useDeleteOrder.ts`. Solo `useOrders` entra al barrel `src/hooks/index.ts`; las mutaciones se importan por ruta directa, como las de equipos.

Los contratos exactos de cada operación están en `program-design.md`: `getOrders`, `getOrder`, `getAvailableNotebooks`, `updateOrder`, `changeOrderStatus`, `OrderDraft`, `ConfirmModal`, `OrderRemoveTeamModal`, `NotebookOrderBlock`, `useOrder`, `Notebook`.

### T3 — Compartir y mudar

- `src/components/notebooks/table/DataTable.tsx` y `data-table-features.ts` pasan a `src/components/shared/table/`.
- `pagination` y `setPagination` pasan a ser opcionales en `DataTable`; el bloque «Anterior»/«Siguiente» se dibuja solo cuando se los pasan.
- `src/components/forms/NotebookForm/NotebookFormModal.tsx` pasa a `src/components/notebooks/NotebookFormModal.tsx`; `src/components/forms/` desaparece.
- Importadores a actualizar: `src/pages/AttendancePage.tsx`, `src/pages/NotebookInventoryPage.tsx`, `src/components/attendance/AttendanceColumns.tsx`, `src/components/notebooks/table/NotebookColumns.tsx`.

### T4 — Lista y creación

- `src/pages/OrdersPage.tsx` — encabezado con «Crear orden»; barra de herramientas con búsqueda por destinatario, «Fecha desde» y «Fecha hasta»; paginación de 14 filas con reset a la primera página ante cualquier cambio de filtro; conteo de resultados, estado de carga y error con reintento; `emptyMessage` según haya filtros o no.
- `src/components/orders/table/OrderColumns.tsx` — Destinatario, Fecha de entrega, Estado, con `createColumnHelper` sobre el tipo de fila.
- `src/components/orders/OrderFormModal.tsx` — `Dialog` con react-hook-form y zod, `Card` para cabecera, cuerpo y pie, `Spinner` en el botón mientras guarda.
- `src/validators/orderFormModal.validator.ts` — esquema zod con el tipo inferido al lado.
- `src/index.css` — color de la etiqueta «En Preparación`: `#b45309`, el mismo de «En Reparación».

Los filtros van al servidor: la lista no filtra en el cliente.

### T5 — Detalle y gestión de una orden

- `src/pages/OrderDetailPage.tsx` — encabezado con «← Órdenes», destinatario como título, número de orden y estado; acciones a la derecha según estado y modo (consulta, editando, Donado); grilla de campos; lista de equipos con «Quitar»; modal «Se perderán los cambios» al salir con cambios pendientes.
- El borrador guarda solo lo que cambió: `recipient`, `deliveryDate`, `description`, `attach` (ids) y `detach` (id + estado de retorno). Las filas se arman con `orderNotebooks + attach − detach`, marcadas «Pendiente» y «Se quitará».
- `hasChanges` compara el borrador contra la orden; sin cambios, «Guardar Cambios» queda deshabilitado.
- `src/components/orders/table/OrderNotebookColumns.tsx` — Nombre de equipo, N.° de Serie, Estado, Especificaciones, Acciones.
- `src/components/orders/OrderRemoveTeamModal.tsx` — `Select` con el estado de retorno del equipo.
- `src/components/modals/ConfirmModal.tsx` — props generalizadas: `id`, `onConfirm`, `onClose`, `confirmLabel`, `destructive`, más `title`, `description` e `isPending`. `src/interfaces/utils.interface.ts` pasa `ConfirmModalType` a genérica. Se ajustan `src/components/attendance/UserActions.tsx` y `src/components/notebooks/NotebookActions.tsx`.
- `src/actions/notebooks.ts` — `getAvailableNotebooks`: estado `Listo para Donar` y `order_id` nulo.
- `src/hooks/notebooks/useAvailableNotebooks.ts`.
- `src/hooks/orders/useOrder.ts` — acepta id indefinido; sin id no consulta.

### T6 — Integración en Inventario

- `src/interfaces/notebook.interface.ts` — `Notebook` suma `orderId`.
- `src/utils/notebook.ts` — `mapNotebook` mapea `order_id` a `orderId`.
- `src/components/notebooks/NotebookOrderBlock.tsx` — «Orden de donación», `Link` a `/ordenes/:id` con el destinatario y la fecha de entrega con date-fns y locale `es`. Se dibuja solo si el equipo tiene orden.
- `src/components/notebooks/NotebookFormModal.tsx` — el bloque va al final del formulario; el `Select` de estado queda deshabilitado mientras el equipo tenga orden.

### T7 — Búsqueda del inventario sobre todos los registros

`src/pages/NotebookInventoryPage.tsx`: se saca el segundo filtrado en el navegador (la búsqueda queda solo en el servidor) y la paginación se resetea al cambiar el texto de búsqueda.

### T8 — Rutas y navegación

- `src/router/index.tsx` — `ordenes` y `ordenes/:id` como rutas hijas de `RootLayout`.
- `src/components/shared/Nav.tsx` — `NavLink` a `/ordenes`, sin `end`, activo también en `/ordenes/:id`.

La app usa `createHashRouter`: las URLs quedan `/#/ordenes` y `/#/ordenes/:id`.

### T9 — Verificación

`npm run lint` y `npm run build` (que corre `tsc -b`) pasan sin errores.

## Matriz de validación manual

| # | Escenario | Resultado esperado | Depende de la RPC |
| --- | --- | --- | --- |
| V1 | Crear orden sin destinatario o sin fecha | Envío bloqueado, no se crea orden | no |
| V2 | Crear orden válida | Orden creada En Preparación, sin equipos, se abre su detalle | no |
| V3 | Detalle de orden sin equipos | «Aún no hay equipos asociados, edite la orden para vincularlos» | no |
| V4 | Editar campos, agregar y quitar un equipo, luego Guardar Cambios | Todo se aplica junto en una sola operación | sí |
| V5 | Editar dejando destinatario o fecha vacíos | Guardado bloqueado | no |
| V6 | Selector de equipos | Solo ofrece Listo para Donar y sin orden; vacío muestra el mensaje del diseño | no |
| V7 | Quitar un equipo eligiendo estado de retorno | Al guardar, el equipo queda sin orden y con ese estado | sí |
| V8 | Marcar como Donado | Orden y equipos pasan a Donado y Donados | sí |
| V9 | Volver a En Preparación | El modal de aviso aparece; cerrar cancela; confirmar cambia orden y equipos | sí |
| V10 | Orden Donado | No se edita, no se agregan ni quitan equipos | no |
| V11 | Eliminar orden | Permitido solo si está vacía y no Donado; con equipos, bloqueado | no |
| V12 | Falla la operación | No cambia nada en la base, se notifica, el formulario conserva los cambios | sí |
| V13 | Tabla: buscar por destinatario y filtrar por fechas | Filtros en el servidor, rango inclusivo | no |
| V14 | Tabla vacía y tabla sin coincidencias | «No hay órdenes disponibles» y «No se encontraron resultados» | no |
| V15 | Equipo con orden en Inventario | Bloque con destinatario enlazado y fecha; estado deshabilitado | no |
| V16 | Navegación | `/#/ordenes`, `/#/ordenes/:id`, enlace de menú activo en ambas | no |

Las filas que dependen de la RPC quedan bloqueadas mientras la migración no esté aplicada en la base.

## Base para la validación

- `orders` está vacía.
- Hay 18 equipos en estado «Listo para Donar» sin orden, disponibles para asociar.
- Credenciales de Supabase en `.env` (`VITE_PROJECT_URL_SUPABASE`, `VITE_SUPABASE_API_KEY`).
