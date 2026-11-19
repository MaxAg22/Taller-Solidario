# Pre-human review — cambios de UI y bug de Órdenes

Rama: `feature/ordenes`. Cambios implementados tras la validación 16/16, listos para la
revisión humana. No se corrió validación en navegador: la validación es manual, por el
usuario, sobre el servidor de desarrollo.

**Estado: validado por el usuario.**

## Cambios

### 1. Fila de retiro: roja con baja opacidad, sin etiqueta «Se quitará»

- [[src/components/shared/table/DataTable.tsx#DataTable]]: el `TableRow` toma la clase
  `orders-row-removing` cuando `row.original.pending === "Se quitará"` (con un
  guard `"pending" in row.original` porque el componente es genérico sobre
  `RowData`).
- [[src/index.css]]: `.orders-row-removing td { opacity: 0.5; background: #fee2e2; }` —
  la fila entera queda roja con baja opacidad. El icono de retiro se resalta con
  `.orders-row-removing .orders-remove-icon { opacity: 1; }` para que siga visible.
- La etiqueta amarilla de texto «Se quitará» se retira del todo: no se pinta en el
  nombre de equipo ni en ningún otro lado.

### 2. Estado de retorno visible en la columna Estado

- [[src/pages/OrderDetailPage.tsx#OrderDetailPage]]: el `useMemo` de `rows` ahora
  mapea cada equipo desvinculado a `removeStatus` (el estado de retorno elegido en el
  modal) además de `pending: "Se quitará"`.
- [[src/interfaces/order.interface.ts#OrderTeam]]: `OrderTeam` gana
  `removeStatus: NotebookStatus | null`.
- [[src/components/orders/table/OrderNotebookColumns.tsx]]: la columna Estado muestra
  el estado de retorno elegido (con `.orders-removing-status`, rojo) en vez del estado
  original del equipo cuando la fila está marcada para retiro. El tooltip dice «El
  equipo volverá al Inventario con este estado al guardar».

### 3. Título del detalle: sin «Orden #xxxx», sin chip de estado, sin Destinatario

- [[src/pages/OrderDetailPage.tsx#OrderDetailPage]]: se eliminó el bloque
  `.orders-meta` (número de orden = primeros 8 caracteres del uuid, y el chip de
  estado repetido). El título queda solo con el destinatario.
- Se eliminó el campo «Destinatario» del bloque `.orders-fields`: la info ya se ve en
  el título, así que duplicarla era ruido. En modo edición no se puede cambiar el
  destinatario (no hay input); el destino se elige al crear la orden.
- [[src/index.css]]: se retira `.orders-meta` (ya no se usa). El bloque de datos pasa a
  una grilla de 3 áreas: `date`, `status`, `description` (la descripción ocupa el
  ancho completo de la fila).

### 4. Columna Acciones con icono de papelera (habilitado/deshabilitado)

- [[src/components/orders/table/OrderNotebookColumns.tsx#orderNotebookColumns]]: la
  columna Acciones siempre muestra un `Button` ghost con `size="icon-sm"` y el icono
  `Trash2` de `lucide-react` (el mismo componente de íconos que ya usa
  `NotebookActions` y `VideoActions`).
  - Fuera de Edición: `disabled`, con `title` «Quitar de la orden (solo disponible en
    modo edición)» y opacidad reducida.
  - En Edición, fila asociada: habilitado, hover rojo, abre el modal de retiro
    (elige el estado de retorno).
  - En Edición, fila ya marcada para retiro: habilitado y rojo, para poder revertir o
    cambiar el estado de retorno antes de guardar (el modal vuelve a abrirse;
    confirmar otra vez actualiza `removeStatus`).
  - En Edición, fila «Pendiente» (agregada en el borrador): habilitado, y **quita el
    equipo directamente de la lista sin abrir el modal** (ver punto 7).
- El botón texto «Quitar» desaparece; el acceso sigue siendo por fila.

### 5. Bloque de datos de la orden: más compacto

- [[src/index.css]]: `.orders-fields` pasa de una grilla de 3 columnas con la
  descripción ocupando toda la fila, a una grilla de 3 áreas (`date`, `status`,
  `description`) en una sola fila, con la descripción ocupando el ancho completo.
  El padding del contenedor baja de `20px 24px` a `14px 16px`, el gap de `16px` a
  `12px 16px`, y el padding de `.orders-value` de `8px 0` a `2px 0`. El label baja de
  13px a 12px. El bloque queda más plano y la tabla gana protagonismo.

### 6. Orden «Donado»: datos visibles pero bloqueados, con nota en rojo

- [[src/pages/OrderDetailPage.tsx#OrderDetailPage]]: el bloque `.orders-fields` toma
  la clase `orders-fields-locked` cuando `isDonated`. Los campos se ven igual (la
  información no se oculta) pero el contenedor queda con opacidad reducida y cursor
  `not-allowed` en inputs/textareas.
- **Dentro del mismo contenedor** (como última fila de la grilla, ocupando el ancho
  completo) aparece una nota en rojo (`.orders-locked-note`, `color: #b91c1c`):
  «Esta orden está donada: no se pueden editar sus datos ni sus equipos. Usá
  «Volver a En Preparación» para habilitarla otra vez.»
- Justificación: antes, una orden Donado mostraba el bloque vacío (los inputs del
  modo edición solo existen con `isEditing` y el botón Editar no aparece en Donado,
  así que el bloque quedaba en blanco). Ahora la información se lee y queda claro por
  qué no se puede editar.
- [[src/index.css]]: `.orders-fields-locked input, .orders-fields-locked textarea { opacity: 0.6; cursor: not-allowed; }` y `.orders-locked-note` como `grid-area: locked-note` dentro de `.orders-fields`.

### 7. Bug: «quitar un equipo pendiente de vincular abría el modal de estado y no cambiaba nada»

- **Síntoma**: Editar → Agregar equipo (queda «Pendiente») → Quitar el equipo
  agregado → se abría el modal de estado de retorno → elegir cualquier estado → el
  equipo seguía en la lista «Pendiente» y el estado no cambiaba.
- **Causa**: [[src/pages/OrderDetailPage.tsx#handleConfirmRemoveTeam]] empujaba el
  equipo a `detach` sin sacarlo de `attach`. La RPC rechazaba el guardado
  (`P0001 «El equipo … no puede asociarse y desvincularse en el mismo guardado»`),
  y el equipo «Pendiente» seguía en `attach` porque la lista visible no se actualizaba
  a partir de `detach`.
- **Comportamiento nuevo** (decisiones del usuario, en orden):
  1. [[src/pages/OrderDetailPage.tsx#handleRemoveTeam]]: si el equipo es
     `pending === "Pendiente"` (agregado en el borrador), se saca directamente de
     `draft.attach` **sin abrir el modal**. No tiene estado de retorno: nunca se
     asoció a la orden, así que no hay nada que devolver al inventario.
  2. [[src/pages/OrderDetailPage.tsx#handleConfirmRemoveTeam]]: si el equipo ya está
     asociado a la orden, se empuja a `detach` con el estado elegido. Si por alguna
     razón el equipo también estaba en `draft.attach` (no debería pasar con el punto 1,
     pero por robustez) se saca de `attach` para no armar un borrador inválido.

### 8. Filtro por estado en la lista de órdenes

- [[src/pages/OrdersPage.tsx]]: se agrega un `Select` «Estado» (Todos los estados /
  En Preparación / Donado) a la par de búsqueda y fecha. Los estados usan puntos de
  colores (`inventory-status-dot`) igual que el filtro de estado del inventario de
  equipos: `En Preparación` → `#b45309`, `Donado` → `#475569`.
- [[src/hooks/orders/useOrders.ts]]: gana el parámetro `status?: OrderStatus | null`.
- [[src/actions/orders.ts#getOrders]]: si `status` no es `null`, agrega
  `query.eq("status", status)`. No toca la API ni la RPC.
- La barra de filtros se reestructura: cada filtro (búsqueda, fecha desde, fecha
  hasta, estado) ahora es un `div` con un `Label` arriba y el control abajo, todos
  alineados al borde inferior con `align-items: flex-end` en `.inventory-toolbar`.

### 9. Fila «Pendiente»: verde con etiqueta

- [[src/components/shared/table/DataTable.tsx#DataTable]]: el `TableRow` toma la clase
  `orders-row-pending` cuando `row.original.pending === "Pendiente"`.
- [[src/index.css]]: `.orders-row-pending td { background: #f0fdf4; }` — fondo verde
  claro, el texto sigue siendo negro para que se lea bien.
- [[src/components/orders/table/OrderNotebookColumns.tsx]]: se agrega una etiqueta
  «Pendiente» (`.orders-pending-tag`, verde `#dcfce7` con texto `#166534`) al nombre
  del equipo cuando está en estado pendiente.

### 10. MultiSelect «Agregar equipo»: filtro contiguo y posición

- [[src/pages/OrderDetailPage.tsx#OrderDetailPage]]: el `MultiSelect` se mueve de la
  derecha a la izquierda de la fila «Equipos asociados», al lado del título.
- [[src/pages/OrderDetailPage.tsx#OrderDetailPage]]: el `MultiSelectContent` ahora
  pasa un `filter` custom a `Command` (cmdk) que hace búsqueda por substring contiguo
  en vez de la búsqueda por tokenización de cmdk. Ejemplo: buscar `30` solo trae
  equipos que tengan "30" contiguo en el nombre, modelo o número de serie; ya no
  coincide con "3190".
- [[src/index.css]]: `.orders-section-head-left` agrupa el título y el MultiSelect a
  la izquierda de la fila.

### 11. «Eliminar orden» deshabilitado en Donado (consistencia)

- [[src/pages/OrderDetailPage.tsx#OrderDetailPage]]: el botón «Eliminar orden» toma
  `disabled={isDonated}`. La acción `deleteOrder` ([[src/actions/orders.ts#deleteOrder]])
  ya revalida estado y equipos asociados en la acción y lanza el error correspondiente;
  el `disabled` solo evita que el usuario intente una acción que va a fallar. Es un
  cambio de consistencia con el resto de la UI (los campos bloqueados en Donado).

## Archivos tocados

- `src/pages/OrderDetailPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/components/orders/table/OrderNotebookColumns.tsx`
- `src/components/shared/table/DataTable.tsx`
- `src/interfaces/order.interface.ts`
- `src/actions/orders.ts`
- `src/hooks/orders/useOrders.ts`
- `src/index.css`

## Comprobaciones corridas

- `npx tsc -b` — pasa.
- `npm run lint` — 26 problemas (24 errores, 2 warnings), la misma línea base que
  antes del cambio; ninguno en los archivos tocados.
- `npm run build` — pasa.

## Pendiente del usuario

- ~~Validación manual en el navegador sobre el servidor de desarrollo~~ — **hecha por el usuario.**
- ~~El punto de «Agregar equipo» fuera de Edición no se tocó y queda como decisión de
  diseño abierta.~~ — **Resuelto: mantener el flujo actual.** Agregar equipos solo se
  hace dentro de Edición. El usuario entra en Edición, agrega, guarda. No se agrega
  un acceso directo fuera de Edición.
