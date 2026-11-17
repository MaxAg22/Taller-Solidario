# Agentic review — Órdenes

Rama: `feature/ordenes`. Diff revisado: `git diff main...HEAD` (2070 líneas en `src/`).
Ejecutado sin subagentes: los 4 reviewers corrieron en secuencia en el chat.

**Nota**: el repo no tiene wiki ni `AGENTS.md`, así que no hay lista de fuentes de
convenciones. Solo corrieron las 4 facetas: Reuse, Simplification, Efficiency, Altitude.

Reglas aplicadas: no buscar bugs de correctness, no cambiar comportamiento ni
apariencia, reportar cada fix y skip con su razón.

---

## Ronda 1

### Fixes

1. **Simplification** — `OrderNotebookColumns.tsx` — la columna Acciones pintaba el
   mismo `Button` ghost con `Trash2` en tres ramas casi idénticas (deshabilitado,
   «Se quitará», normal), cada una con sus clases y `title` propios. El reviewer lo
   vio como copy-paste con variación. Se redujo a un solo `Button` cuya `className`
   y `title` se eligen con expresiones ternarias; `disabled={!onRemove}` y
   `onClick={() => onRemove?.(row.original)}` cubren los tres estados. Mismo markup,
   mismas clases, mismo `aria-label` y mismo `title` por estado.

2. **Simplification** — `OrdersPage.tsx` — el array `STATUS_OPTIONS` local
   (`{ value, label, color }` por estado) era un duplicado con variación de
   `ORDER_STATUSES` en `src/utils/orderStatus.ts`. El reviewer lo vio como código
   que reimplementa datos ya existentes (también es la única lista de estados de
   orden del código). Se importó `ORDER_STATUSES` y se borró el array local. El
   cast del filtro pasó de `OrderStatus` a
   `(typeof ORDER_STATUSES)[number]["value"]`, que es el mismo tipo.

3. **Simplification** — `OrderDetailPage.tsx` — `hasChanges` estaba enredado en un
   `useMemo` cuyo cuerpo es una comparación pura sobre props/estado: no hay
   `Array.prototype` costoso que justifique memoizar, y la forma escondía el
   cálculo. El reviewer lo vio como indirection innecesaria. Se dejó como
   expresión simple. `rows` y `columns` siguen memoizados.

4. **Efficiency** — `useOrder.ts` + `NotebookFormModal.tsx` — la página de
   inventario se queda montada detrás del modal de formulario (Radix no la
   unmountea), y `NotebookFormModal` llamaba `useOrder(notebook?.orderId ?? undefined)`.
   El `enabled: !!id` interno solo protege el caso `orderId === null`, pero en el
   modal de **crear** (`notebook === undefined`) `id` llega como `undefined` y la
   query corrige `getOrder(undefined as string)` → `supabase.from("orders").eq("id", undefined)`.
   El reviewer lo vio como I/O repetido y evitable: cada vez que se abre el modal de
   creación dispara una consulta a la base con `id = null`. Se agregó un segundo
   parámetro `options.enabled` al hook (default `true`) y el modal pasa
   `enabled: !!notebook?.orderId`. En modo crear la query queda en estado
   `disabled` (sin fetch); en modo editar se consulta igual.

5. **Simplification** — `OrdersPage.tsx` + `NotebookInventoryPage.tsx` —
   `resetPagination` se escribía como `setPagination((prev) => ({ ...prev, pageIndex: 0 }))`
   en ambos lugares. `prev` es el estado completo de paginación y solo se usa para
   conservar `pageSize`. El reviewer lo vio como spread con variación (el resto del
   estado se copia sin leerse). Se reescribió en ambos archivos como
   `setPagination((prev) => ({ pageIndex: 0, pageSize: prev.pageSize }))`, nombrando
   explícitamente lo que se conserva.

6. **Simplification** — `OrderDetailPage.tsx` — la `useMemo` de `hasChanges` se
   reemplazó por una expresión directa (ver fix 3).

### Skips

1. **Altitude** — `DataTable.tsx` — el `TableRow` aplica las clases
   `orders-row-removing` / `orders-row-pending` con dos guards
   `("pending" in row.original && row.original.pending === ...)`. El reviewer lo vio
   como casos especiales de Órdenes apilados en el componente de tabla genérico.
   **Skip**: el componente es genérico sobre `RowData`; sacar los guards rompe el
   tipado para las otras tablas (Inventario, Asistencia) que no tienen `pending`.
   Una solución con clase opcional en `DataTableProps` o un `rowClass` callback
   cambia la API pública del componente y toca a otras dos áreas. Es un cambio de
   alcance fuera de la revisión agéntica; lo dejo para la revisión humana.

2. **Reuse** — `NotebookFormModal.tsx` (línea 80) — el comentario `// Error here`
   quedó en el diff como un marcador de debugging dentro de la estructura del objeto
   `updateNotebook(...) as UpdateNotebook`. El reviewer lo vio como código muerto.
   **Skip**: es una nota que parece apuntar a un bug de correctness (el cast `as
   UpdateNotebook` con un spread que no satisface el tipo). Corregirlo o borrarlo
   sin entender la intención del comentario es una decisión del dominio, no
   mecánica; la dejo para la revisión humana.

3. **Simplification** — `OrderFormModal.tsx` y `NotebookFormModal.tsx` — ambos
   modales de formulario comparten la estructura completa del diálogo (CardHeader
   con título + descripción + botón X, CardContent con grid de campos, CardFooter
   con Cancelar/Submit). El reviewer lo vio como copy-paste con variación.
   **Skip**: abstraer un `FormModal` genérico con slot de campos y callbacks cambia
   el markup y la estructura de ambos componentes. Es un refactor de diseño, no una
   simplificación mecánica. Lo dejo para la revisión humana.

4. **Efficiency** — `getOrder` en `actions/orders.ts` — hace dos consultas
   secuenciales (`orders` y luego `notebooks` por `order_id`) cuando podrían
   correr en paralelo con `Promise.all`. **Skip**: las dos llamadas no son
   independientes en la semántica (la segunda depende de que la primera no haya
   fallado) y el cambio afecta la estructura de una función de acción que la
   revisión humana puede querer revisar por su cuenta. No lo toco.

### Checks

- `npx tsc -b` — pasa.
- `npm run lint` — 26 problemas (24 errores, 2 warnings), la misma línea base que
  antes del cambio; ninguno en los archivos tocados.

---

## Ronda 2

### Fixes

1. **Reuse** — `OrderDetailPage.tsx` + `index.css` — el contenedor de la página
   usaba la clase `inventory-page` de la página de Inventario, cuyo único efecto
   visible es `min-height: 100dvh` (los otros estilos de la página de Inventario —
   heading, toolbar, feedback — no se usan en el detalle). El reviewer lo vio como
   código nuevo reutilizando un contenedor genérico con un nombre de otra área.
   Se agregó `.orders-page { display: flex; min-height: 100dvh; flex-direction:
   column; }` y `.orders-fields { flex: 1; ... }`. El efecto visual es el mismo
   (`min-height: 100dvh` en la página, y `flex: 1` hace que el bloque de datos
   ocupe el espacio restante, que es lo que ya pasaba por el layout anterior).

### Skips

1. **Simplification** — `OrderDetailPage.tsx` — el bloque `orders-fields` pinta
   tres campos con la misma estructura `<div class="orders-field"><Label/><control/></div>`
   repetida (Fecha, Estado, Descripción). El reviewer lo vio como copy-paste con
   variación. **Skip**: los tres campos son distintos (input date, span con estado,
   textarea) y tienen `htmlFor` distintos. Un array de configuración pierde la
   claridad de la estructura y no reduce la complejidad real.

2. **Simplification** — `useUpdateOrder.ts` / `useChangeOrderStatus.ts` — ambos
   hooks invalidan `["orders"]` y `["notebooks"]` en `onSuccess`. El reviewer lo
   vio como lógica repetida. **Skip**: el patrón de invalidación es explícito por
   hook y cada hook sabe qué áreas toca. Un helper centralizado de invalidación
   cambia el diseño de todos los hooks de mutación del proyecto (notebooks,
   attendance, tutorials) y está fuera del alcance de esta rama.

3. **Efficiency** — `OrdersPage.tsx` — `hasFilters` y `emptyMessage` se recalculan
   en cada render sin memoizar. **Skip**: el cálculo es una comparación de 4
   strings; memoizarlo con `useMemo` agrega más indirection que la que ahorra.

### Checks

- `npx tsc -b` — pasa.
- `npm run lint` — 26 problemas (24 errores, 2 warnings), la misma línea base que
  antes del cambio; ninguno en los archivos tocados.

---

## Ronda 3

Nada nuevo. Las cuatro facetas no encontraron fixes adicionales sobre lo que
queda en el diff. Se detiene.

### Checks

- `npx tsc -b` — pasa.
- `npm run lint` — 26 problemas (24 errores, 2 warnings), la misma línea base que
  antes del cambio; ninguno en los archivos tocados.
