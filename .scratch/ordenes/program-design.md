# Órdenes — diseño del programa

## Cobertura

Detalla cómo implementar el diseño asentado en `design.md`: almacenamiento y acceso a datos de órdenes, pantallas de Órdenes, integración con Inventario y navegación necesaria.

Fuera de alcance: cambiar las decisiones funcionales de `design.md`, escribir código y diseñar pruebas. El usuario indicó que por ahora no se usarán la wiki ni una nota de invariantes.

## Decisiones que el diseño del sistema deja para esta etapa

- Tipos SQL concretos, constraints, relación y migración de `orders` y `notebooks.order_id`.
- Tipos de Supabase y representación de las órdenes dentro de la aplicación.
- Operaciones de lectura y escritura; la edición de campos y los cambios de equipos se guardan juntos en una transacción. Las transiciones de estado también son atómicas.
- Separación de pantallas y rutas para la lista, creación y detalle de órdenes.
- Ubicación de búsqueda, filtros de fecha, estados de carga/error/vacío y operaciones de la lista.
- Ubicación del formulario, equipos asociados, selector múltiple, cambios pendientes, transiciones y eliminación en el detalle.
- Integración del vínculo y fecha de entrega en Inventario, incluido el control de edición del estado de equipos asociados.
- Archivos e interfaces que conectan esas superficies con los datos.

## Árbol de ramas

```text
Diseño del programa — Órdenes
├─ Datos y persistencia de Órdenes                         settled
├─ Acceso a Órdenes: rutas y navegación                    settled
├─ Lista y creación de órdenes                             settled
├─ Detalle y gestión de una orden                          settled
├─ Integración de órdenes en Inventario                    settled
└─ Búsqueda del inventario sobre todos los registros       settled
```

La última rama entró por pedido del usuario: la búsqueda del inventario solo alcanzaba los registros de la página abierta, y debe cubrir todos los de la base.

El árbol está cerrado.

El orden propuesto parte del almacenamiento que sirve a las pantallas, luego define el acceso y trabaja las superficies visibles. La lista y el detalle son ramas separadas porque el diseño define la tabla como entrada y una página de detalle distinta. Inventario conserva su pantalla existente y recibe el vínculo a la orden y la restricción de estado.

El usuario confirmó este árbol y orden al retomar el diseño.

## Datos y persistencia de Órdenes — asentada

### Alcance asentado

- El usuario creará la tabla en Supabase y descargará aquí los tipos generados para revisarlos. El diseño del programa no especificará ni preparará el SQL de esa tabla.
- El contrato de aplicación y los archivos afectados por el tipo generado se pueden diseñar antes de esa revisión.
- La propuesta inicial de esquema no se asentó; el modelo persistido queda pendiente de revisar junto con los tipos descargados.

### Revisión del tipo descargado — resuelta

- `src/supabase/client.ts` importa `src/supabase/supabase.ts`, la copia actualizada que consume la aplicación.
- `orders.id` y `notebooks.order_id` se representan como `string`; `notebooks.Relationships` declara `notebooks_order_id_fkey` hacia `orders.id`.
- El usuario confirmó que Supabase Web muestra `deliveryDate` como `date` y `recipient` como `NOT NULL`. El tipo TypeScript representa la fecha como `string`; `orders.Row.recipient` es `string`. `orders.Insert.recipient` es opcional porque la columna tiene un valor por defecto, sin permitir `NULL`.
- `status` se representa como `string`; este tipo generado no expresa por sí solo las restricciones de valores de la columna.
- `src/supabase/supabase.ts` y `supabase/supabase.ts` contienen actualmente los mismos tipos para la relación y `orders`.

La revisión del esquema queda resuelta. La rama sigue abierta para especificar las operaciones de datos, sus interfaces y los módulos afectados.

### Organización de las operaciones — asentada

- Las operaciones de Supabase se concentran en `src/actions/orders.ts`; `src/hooks/orders/` contiene un archivo `use...` por operación.
- La separación acordada contempla cinco operaciones: lectura, creación, edición compuesta (campos y equipos), cambio de estado y eliminación.
- El código actual separa operaciones de Supabase en `src/actions/` y las conecta a pantallas mediante hooks de React Query. Referencias: `[[src/actions/notebooks.ts]]`, `[[src/hooks/notebooks/useNotebooks.ts#useNotebooks]]`, `[[src/hooks/notebooks/useCreateNotebook.ts#useCreateNotebook]]`.
- La rama trabaja los recorridos de lectura, creación, edición compuesta de campos y equipos, cambio de estado y eliminación. Omite layout de paquete porque no se crea ni se modifica un paquete, y diagrama de almacenamiento porque el esquema ya está definido y reflejado en los tipos generados.

### Lectura de órdenes — abierta

#### Callstack de la lista — asentado

```text
+ OrdersPage (página, búsqueda y rango de fechas)
+ └─ useOrders (from, to, búsqueda, límites de fecha; query key incluye filtros)  nuevo
+    └─ getOrders (from, to, búsqueda, límites de fecha)                         nuevo
+       └─ Supabase: consulta filtrada y paginada con .range(from, to)             nuevo
```

El patrón existente conecta una página con un hook `useQuery`, que invoca una acción y propaga `isLoading` e `isError` (`[[src/hooks/notebooks/useNotebooks.ts#useNotebooks]]`). La acción actual de inventario recibe `from` y `to`, aplica `.range(from, to)` y devuelve filas y `rowCount` (`[[src/actions/notebooks.ts#getNotebooks]]`). La propuesta replica esa paginación para la tabla de órdenes junto con la búsqueda por destinatario y los límites de fecha inclusivos del diseño.

#### Interfaces y módulos — asentados

- `getOrders` recibe `from`, `to`, texto de búsqueda y límites opcionales `deliveryDateFrom`/`deliveryDateTo`; devuelve filas con `id`, `recipient`, `deliveryDate`, `status` y `rowCount`.
- `useOrders` recibe los mismos filtros y expone el resultado, `isLoading`, `isError` y `refetch`.
- Las filas usan el tipo generado de Supabase, sin modelo duplicado de aplicación para esta lista.
- Se crean `src/actions/orders.ts` y `src/hooks/orders/useOrders.ts`; se agregan sus exports a `src/actions/index.ts` y `src/hooks/index.ts`.
- No se cambia el esquema persistido, por lo que no hay diagrama de almacenamiento en esta parte.

#### Comportamiento crítico de búsqueda — asentado

- La lista busca órdenes por destinatario y admite el rango de fechas inclusivo asentado en el diseño.
- Buscar órdenes por el número de serie de un equipo queda fuera del alcance actual. Se actualizó esa decisión en `design.md` y en `docs/app/orders.md`.
- El prototipo aprobado también refleja el alcance actual: búsqueda por destinatario en la tabla; la búsqueda por serie se conserva en el selector de equipos.

### Crear una orden — abierta

#### Callstack — asentado

```text
+ OrdersPage: formulario Crear orden (recipient, deliveryDate, description opcional)  nuevo
+ ├─ si falta recipient o deliveryDate: bloquear envío y conservar valores        según diseño
+ └─ si los requeridos están presentes
+    └─ useCreateOrder (mutación; callback de éxito)                               nuevo
+       └─ createOrder (recipient, deliveryDate, description)                     nuevo
+          └─ Supabase: insertar orden con estado En Preparación, sin equipos     nuevo
+             ├─ error: propagar fallo a la mutación
+             └─ éxito: devolver orden creada con id
+    ├─ éxito: invalidar consultas de órdenes y abrir detalle con el id creado
+    └─ error: notificar; dejar el formulario con los valores para reintentar
```

La acción actual de notebooks inserta un registro y devuelve el resultado de Supabase (`[[src/actions/notebooks.ts#createNotebook]]`). Su hook usa `useMutation`, invalida la consulta de la lista, muestra un toast y permite un callback de éxito (`[[src/hooks/notebooks/useCreateNotebook.ts#useCreateNotebook]]`). Para órdenes, el diseño requiere destinatario y fecha, inicia la orden en En Preparación y mantiene los valores si falla el guardado; el prototipo aprobado muestra que, al crearla, se abre su detalle (`[[.scratch/ordenes/prototypes/orders.html]]`). El usuario aceptó el recorrido y pidió tratar la creación como trivial; contrato y comportamiento se derivan directamente de estas decisiones y del tipo generado, sin abrir más partes.

### Editar una orden — abierta

#### Callstack — asentado

```text
+ OrderDetailPage: formulario de edición (id, campos y cambios de equipos pendientes)                nuevo
+ ├─ si falta recipient o deliveryDate: bloquear envío y conservar valores                          según diseño
+ └─ si los requeridos están presentes
+    └─ useUpdateOrder (mutación)                                                                  nuevo
+       └─ updateOrder (campos, equipos a asociar y desvincular con estado de retorno)               nuevo
+          └─ Supabase RPC save_order_changes(...)                                                  nuevo
+             └─ transacción SQL: validar y guardar todos los cambios o ninguno                    migración
+    ├─ éxito: invalidar caché de órdenes y equipos; salir de edición
+    └─ fallo: notificar y conservar el formulario para reintentar
```

El formulario prepara los cambios de destinatario, fecha, descripción y equipos sin persistirlos por separado. `updateOrder` ejecuta una RPC respaldada por una función PostgreSQL versionada como migración; el conjunto se confirma como una unidad. En caso de error se conservan los cambios del formulario para reintentar. La función no se define en `supabase.ts` ni se crea manualmente en el Dashboard.

### Cambio de estado de una orden — asentado

```text
+ OrderDetailPage: acción de transición y confirmación cuando corresponde                    según diseño
+ └─ useChangeOrderStatus (mutación)                                                           nuevo
+    └─ changeOrderStatus (orderId, nuevo estado)                                              nuevo
+       └─ Supabase RPC change_order_status(...)                                               nuevo
+          └─ transacción SQL: actualizar orden y equipos asociados en conjunto                migración
+ éxito: invalidar órdenes y equipos; error: notificar y mantener el estado actual
```

La función PostgreSQL se agrega en una migración SQL. La acción invoca la RPC desde `src/actions/orders.ts`; el hook correspondiente vive en `src/hooks/orders/`. Las definiciones SQL se despliegan por separado a cada proyecto Supabase, y los tipos generados no ejecutan migraciones.

La llamada lleva solo el estado nuevo de la orden; el estado de los equipos asociados se deduce de ese estado dentro de la función. El mapeo ya está asentado en `design.md` (ramas 3, 2.5a y 2.5b): al pasar a Donado los equipos pasan a Donados y al volver a En Preparación pasan a Listo para donar. Mandar ambos estados dejaría que la app enviara una combinación que el ciclo no contempla.

### Interfaces y módulos de las cinco operaciones — asentado

#### Contrato de las dos operaciones compuestas

```json
{
  "title": "updateOrder",
  "description": "Aplica en una sola transacción los cambios de campos, las asociaciones y las desvinculaciones de una orden.",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "description": "La orden que se edita." },
        "recipient": { "type": "string", "description": "Destinatario; obligatorio." },
        "deliveryDate": { "type": "string", "description": "Fecha de entrega, con precisión de día." },
        "description": { "type": ["string", "null"], "description": "Descripción opcional; null la deja vacía." },
        "attach": {
          "type": "array",
          "items": { "$ref": "#/$defs/Attach" },
          "description": "Equipos que se asocian a la orden en este guardado."
        },
        "detach": {
          "type": "array",
          "items": { "$ref": "#/$defs/Detach" },
          "description": "Equipos que se desvinculan de la orden en este guardado."
        }
      },
      "required": ["id", "recipient", "deliveryDate", "attach", "detach"]
    },
    "output": { "type": "null", "description": "No devuelve datos; el hook invalida las consultas de órdenes y equipos." }
  },
  "$defs": {
    "Attach": {
      "type": "object",
      "properties": { "notebookId": { "type": "string", "description": "El equipo que se asocia." } },
      "required": ["notebookId"]
    },
    "Detach": {
      "type": "object",
      "properties": {
        "notebookId": { "type": "string", "description": "El equipo que se desvincula." },
        "status": { "type": "string", "description": "Estado con el que el equipo vuelve al Inventario; uno de los estados de equipo de la aplicación." }
      },
      "required": ["notebookId", "status"]
    }
  }
}
```

```json
{
  "title": "changeOrderStatus",
  "description": "Cambia el estado de la orden y el de sus equipos asociados en una sola transacción.",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "description": "La orden cuyo estado cambia." },
        "status": {
          "enum": ["En Preparación", "Donado"],
          "description": "El estado al que pasa la orden; determina el estado al que pasan sus equipos."
        }
      },
      "required": ["id", "status"]
    },
    "output": { "type": "null", "description": "No devuelve datos; el hook invalida las consultas de órdenes y equipos." }
  }
}
```

Las dos listas de `updateOrder` no son simétricas. `attach` lleva solo el identificador del equipo: entra con el estado que ya tiene y la función no le cambia el estado, porque su estado solo lo mueve el ciclo de la orden. `detach` lleva el identificador y el estado de retorno elegido en el modal de desvinculación, porque ese estado se escribe en la misma operación en que se limpia `notebooks.order_id` (`shape.md`, Q8; `design.md`, rama 2.4).

Los hooks siguen el patrón existente: `useUpdateOrder` y `useChangeOrderStatus` reciben `{ onSuccess }` y exponen `{ mutate, isPending }`; `useDeleteOrder` expone `{ mutate, isPending }` sin callback (`[[src/hooks/notebooks/useCreateNotebook.ts#useCreateNotebook]]`, `[[src/hooks/notebooks/useDeleteNotebook.ts#useDeleteNotebook]]`).

#### Lista de módulos

```text
src/
├── actions/
│   ├── index.ts                              touched   exporta ./orders
│   └── orders.ts                             new      getOrders, createOrder, updateOrder, changeOrderStatus, deleteOrder
├── hooks/
│   ├── index.ts                              touched   exporta useOrders
│   └── orders/
│       ├── useOrders.ts                      new
│       ├── useCreateOrder.ts                 new
│       ├── useUpdateOrder.ts                 new
│       ├── useChangeOrderStatus.ts           new
│       └── useDeleteOrder.ts                 new
├── interfaces/
│   ├── index.ts                            touched   exporta ./order.interface
│   └── order.interface.ts                  new      payloads de las operaciones y tipo de estado de orden
└── utils/
    └── orderStatus.ts                        new      ORDER_STATUSES, igual que notebookStatus.ts
supabase/
└── migrations/
    └── <timestamp>_order_transactions.sql    new      save_order_changes y change_order_status
```

- `src/actions/orders.ts` agrupa las cinco operaciones, como `[[src/actions/notebooks.ts]]` agrupa las de equipos.
- `src/hooks/orders/` lleva un archivo por operación, como `src/hooks/notebooks/`.
- Solo `useOrders` entra al barrel `src/hooks/index.ts`; las mutaciones se importan por ruta directa, que es el patrón actual (`[[src/components/forms/NotebookForm/NotebookFormModal.tsx#L27]]`, `[[src/pages/NotebookInventoryPage.tsx#L7]]`).
- `src/interfaces/order.interface.ts` lleva los payloads de las operaciones; la lista no lleva modelo duplicado, usa el tipo generado (`[[src/interfaces/notebook.interface.ts#UpdateNotebook]]`).
- `src/utils/orderStatus.ts` concentra los valores de estado de orden, porque la columna es texto libre (`status: string` en `[[src/supabase/supabase.ts#L118-L144]]`), como `[[src/utils/notebookStatus.ts#NOTEBOOK_STATUSES]]` hace con los de equipo.
- La migración va en `supabase/migrations/`, que ya existe con el esquema remoto descargado; el CLI `supabase` está en devDependencies y `[db.migrations] enabled = true` en `[[supabase/config.toml]]`.

#### Desviación del registro sobre los tipos generados

El registro decía que la RPC no se añade a `supabase.ts`. Con el cliente tipado (`[[src/supabase/client.ts#supabase]]`), `rpc` exige `FnName extends keyof Schema['Functions']` y `public.Functions` está vacío en los tipos generados, así que la llamada no compila hasta que los tipos incluyan la función. El registro dice ahora: la RPC aparece en los tipos generados después de aplicar la migración; no se escribe a mano.

### Comportamiento crítico de las dos transacciones — asentado

#### `save_order_changes(p_order_id, p_recipient, p_delivery_date, p_description, p_attach, p_detach)`

```text
+ save_order_changes(...)
+ 1. Leer la orden bloqueando la fila (FOR UPDATE)
+ ├─ no existe → excepción
+ └─ existe
+    ├─ su status ≠ 'En Preparación' → excepción        (una orden Donado no se edita)
+    └─ su status = 'En Preparación'
+ 2. Validar que recipient no esté vacío y delivery_date no sea nula → si no, excepción
+ 3. Validar cada equipo de attach
+    ├─ el equipo existe
+    ├─ su status = 'Listo para Donar'
+    ├─ su order_id es null
+    └─ no está repetido dentro de la lista
+ 4. Validar cada equipo de detach
+    ├─ el equipo existe
+    ├─ su order_id = p_order_id
+    ├─ el status pedido es uno de los estados de equipo de la aplicación
+    └─ no aparece también en attach
+ 5. Escribir
+    ├─ orders: recipient, deliveryDate, description
+    ├─ notebooks de attach: order_id = p_order_id
+    └─ notebooks de detach: order_id = null, status = el elegido
+ 6. Devolver nada
```

#### `change_order_status(p_order_id, p_status)`

```text
+ change_order_status(...)
+ 1. Leer la orden bloqueando la fila
+ ├─ no existe → excepción
+ └─ existe
+ 2. p_status es 'En Preparación' o 'Donado' → si no, excepción
+ 3. p_status = estado actual → excepción (la orden ya está en ese estado)
+ 4. Escribir
+    ├─ orders: status = p_status
+    └─ notebooks con order_id = p_order_id: status = 'Donado' o 'Listo para Donar', según p_status
+ 5. Devolver nada
```

El vínculo de los equipos se conserva en la transición: siguen asociados a la orden y lo que cambia es su estado, según el mapeo asentado en `design.md` (ramas 3, 2.5a y 2.5b).

Postgres envuelve cada llamada a función en una transacción implícita, así que no hace falta `BEGIN`/`COMMIT` dentro del cuerpo: cualquier excepción revierte todo lo escrito por esa llamada. La atomicidad viene de que las escrituras estén dentro de la función.

#### Migración

`supabase/migrations/<timestamp>_order_transactions.sql`, en este orden:

1. `CREATE OR REPLACE FUNCTION public.save_order_changes(...)` — plpgsql, devuelve void.
2. `CREATE OR REPLACE FUNCTION public.change_order_status(...)` — plpgsql, devuelve void.
3. `ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('En Preparación','Donado'))` — la columna era texto libre sin restricción; a partir de la migración la base rechaza cualquier estado fuera de los dos del diseño. La tabla estaba vacía al specsificarse esto, así que el `CHECK` no encuentra filas que lo incumplan. Los tipos generados no cambian: `status` sigue siendo `string` y la app mantiene su propio tipo en `src/utils/orderStatus.ts`.
4. Permisos: Postgres concede `EXECUTE` sobre funciones a `PUBLIC` por defecto, así que `anon` y `authenticated` pueden llamarlas sin `GRANT` explícito.

Dos hechos del esquema actual que sostienen esta parte:

- No hay RLS: el esquema migrado no tiene `ENABLE ROW LEVEL SECURITY` ni políticas, así que una función corriente (`SECURITY INVOKER`) escribe sin problema. Si más adelante se habilita RLS, la función hay que revisarla.
- La FK protege el borrado: `notebooks_order_id_fkey` está definida sin `ON DELETE`, o sea `NO ACTION` (`[[supabase/migrations/20261113180933_remote_schema.sql#L196]]`), así que borrar una orden con equipos asociados falla en la base aunque la app ya lo impida antes.

No se agrega un `CHECK` sobre `notebooks.status`: la columna ya tiene filas y su conjunto de estados es el de la aplicación (`[[src/utils/notebookStatus.ts#NOTEBOOK_STATUSES]]`); esa validación vive dentro de la función, en la lista de `detach`.

El mensaje de la excepción queda disponible para el log; el toast sigue el patrón actual de mensaje genérico (`[[src/hooks/notebooks/useUpdateNotebook.ts#useUpdateNotebook]]`).

## Acceso a Órdenes: rutas y navegación — asentada

### Call path de la navegación — asentado

```text
+ Nav (navegación principal del header)
+ └─ NavLink to="/ordenes"                                     nuevo
+    └─ OrdersPage: tabla de órdenes                          nuevo
+       ├─ fila de la tabla → /ordenes/:id
+       │  └─ OrderDetailPage: detalle de la orden             nuevo
+       ├─ botón Crear orden → modal sobre la lista
+       │  └─ creación exitosa → /ordenes/:id de la orden creada
+       └─ vínculo desde Inventario (integración) → /ordenes/:id
+ OrderDetailPage
+ └─ botón Volver → /ordenes
```

Las rutas cuelgan de `RootLayout`, igual que las existentes (`[[src/router/index.tsx#router]]`), para conservar el header y la navegación. El prototipo aprobado ya muestra «Órdenes» como cuarta entrada del menú, la creación como modal sobre la lista y, tras crear, el detalle de la orden nueva (`[[.scratch/ordenes/prototypes/orders.html]]`).

La app usa `createHashRouter`, así que las URLs quedan como `/#/ordenes` y `/#/ordenes/18`.

### Interfaces — asentado

```json
{
  "title": "OrderDetailPage.routeParam",
  "description": "El identificador de la orden que la página del detalle debe leer.",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Identificador de la orden, tomado del parámetro de ruta ordenes/:id. La página lo usa para pedir la orden y sus equipos; si no existe, la página muestra el estado de error de consulta."
    }
  },
  "required": ["id"]
}
```

### Lista de módulos — asentado

```text
src/
├── components/
│   └── shared/
│       └── Nav.tsx                             touched   agrega el enlace a Órdenes
├── pages/
│   ├── OrderDetailPage.tsx                     new      la define la rama de detalle
│   └── OrdersPage.tsx                          new      la define la rama de lista y creación
└── router/
    └── index.tsx                               touched   declara las rutas ordenes y ordenes/:id
```

El nombre de las páginas sigue la convención de `src/pages/` (`NotebookInventoryPage.tsx`, `AttendancePage.tsx`, `TutorialsPage.tsx`). Las dos páginas aparecen acá porque las declara el router; su contenido lo trabajan las ramas siguientes.

### Comportamiento crítico — asentado

```text
+ Entrada de menú a /ordenes
+ ├─ el enlace queda activo tanto en /ordenes como en /ordenes/:id
+ │  (NavLink sin `end`, como los otros tres; solo "/" lleva `end`)
+ └─ un id inexistente no es un error de ruta
+    └─ /#/ordenes/no-existe coincide con ordenes/:id y renderiza el detalle
+       └─ la página pide la orden; si no existe, muestra el estado de error de consulta
```

### Fuera de esta rama

- Un `errorElement` en la ruta raíz: captura excepciones de render en todas las páginas, incluidas las que ya existen, y no cubre el caso de orden inexistente. Queda como decisión aparte de la app.
- El botón «Volver a Órdenes» del detalle, el estado de carga de la orden y el enlace desde Inventario, que pertenecen a las ramas de detalle y de integración.

## Lista y creación de órdenes — asentada

### Layout de la pantalla de lista — asentado

El layout viene del prototipo aprobado: encabezado «Órdenes» con subtítulo y botón «Crear orden»; barra de herramientas con búsqueda por destinatario y los filtros «Fecha desde» y «Fecha hasta»; tabla con las columnas Destinatario, Fecha de entrega y Estado; la fila abre el detalle.

```text
+ OrdersPage
+ ├─ Encabezado: «Órdenes» + subtítulo + botón «Crear orden»
+ ├─ Barra de herramientas
+ │  ├─ búsqueda por destinatario
+ │  ├─ filtro «Fecha desde» y filtro «Fecha hasta»
+ │  └─ estado de carga, de error o conteo de resultados
+ └─ Tabla de órdenes
+    ├─ columnas: Destinatario | Fecha de entrega | Estado
+    ├─ la fila abre el detalle
+    ├─ paginación (Anterior / Siguiente)
+    └─ mensaje vacío: «No hay órdenes disponibles» o «No se encontraron resultados»
```

Dos cosas que el prototipo no mostraba y que la rama resuelve:

- La paginación viene del componente `DataTable`, que ya la trae con paginación manual (`rowCount`, `manualPagination`, botones «Anterior» y «Siguiente», `[[src/components/notebooks/table/DataTable.tsx#DataTable]]`). La tabla de órdenes lo reutiliza; no se escribe una tabla nueva.
- `DataTable` acepta un solo `emptyMessage`, así que la página elige cuál pasar: «No hay órdenes disponibles» cuando no hay filtros aplicados, «No se encontraron resultados» cuando hay búsqueda o rango de fechas aplicados (`design.md`, Q17 y Q20).

La tabla genérica se muda de `src/components/notebooks/table/` a `src/components/shared/table/`, con `DataTable.tsx` y `data-table-features.ts`. La app ya la usaba en dos dominios (inventario y asistencias), así que la mudanza actualiza tres importadores: `[[src/pages/AttendancePage.tsx]]`, `[[src/pages/NotebookInventoryPage.tsx]]` y `[[src/components/attendance/AttendanceColumns.tsx]]`.

La etiqueta de estado necesita una regla nueva: el color está definido por reglas CSS, una por cada estado de equipo (`[[src/index.css#L171-L176]]`), y «En Preparación» no tiene la suya. Toma el ámbar `#b45309` del prototipo aprobado, el mismo de «En Reparación». «Donado» ya tiene la suya.

### Árbol de componentes — asentado

```text
+ OrdersPage  (src/pages/OrdersPage.tsx)                                   new
+ ├─ Encabezado: título, subtítulo y botón «Crear orden»                   ui/button
+ ├─ Barra de herramientas                                                 ui/input, ui/button
+ │  ├─ Input de búsqueda por destinatario
+ │  ├─ Input type="date" «Fecha desde»
+ │  ├─ Input type="date" «Fecha hasta»
+ │  └─ estado: carga, error con Reintentar, o conteo de resultados
+ ├─ DataTable                                                             shared/table/DataTable
+ │  └─ OrderColumns                                                       orders/table/OrderColumns
+ └─ OrderFormModal                                                        orders/OrderFormModal
+    └─ Dialog + form con react-hook-form y zod                            ui/dialog, ui/input, ui/textarea, ui/label
```

- `OrderColumns` sigue el patrón de `NotebookColumns` y `AttendanceColumns`: `createColumnHelper` sobre el tipo de fila y las columnas de la tabla. Las filas usan el tipo generado de Supabase, como asienta la rama de datos, así que no hay modelo duplicado.
- `OrderFormModal` sigue el patrón de `NotebookFormModal`: `Dialog` de `src/components/ui/dialog`, `react-hook-form` con `zodResolver` y el esquema en `src/validators/`, con los botones «Cancelar» y «Crear orden» y `Spinner` mientras guarda.
- El alta de una orden es solo modal; la edición de una orden es un formulario en la página de detalle, que es de la rama siguiente.
- El tipo de las props del modal (`onClose`, callback de éxito) va en `src/interfaces/order.interface.ts`, junto a los payloads, como `NotebookFormModalProps` está en `notebook.interface.ts`.

### Lista de módulos — asentado

```text
src/
├── components/
│   ├── attendance/
│   │   └── AttendanceColumns.tsx           touched   importa el tipo de features desde shared/table
│   ├── notebooks/
│   │   ├── NotebookFormModal.tsx            new       mudado desde components/forms/NotebookForm
│   │   └── table/
│   │       ├── DataTable.tsx                deleted   mudado a shared/table
│   │       ├── data-table-features.ts       deleted   mudado a shared/table
│   │       └── NotebookColumns.tsx          touched   importa el tipo de features desde shared/table
│   ├── orders/
│   │   ├── OrderFormModal.tsx              new       alta de una orden
│   │   └── table/
│   │       └── OrderColumns.tsx            new       columnas Destinatario, Fecha de entrega, Estado
│   └── shared/
│       └── table/
│           ├── DataTable.tsx               new       mudado desde components/notebooks/table
│           └── data-table-features.ts      new       mudado desde components/notebooks/table
├── interfaces/
│   ├── index.ts                            shared, defined in Datos y persistencia
│   └── order.interface.ts                  shared, defined in Datos y persistencia
├── pages/
│   ├── AttendancePage.tsx                  touched   importa DataTable desde shared/table
│   ├── NotebookInventoryPage.tsx            touched   importa DataTable desde shared/table y el modal desde components/notebooks
│   └── OrdersPage.tsx                      new
├── validators/
│   └── orderFormModal.validator.ts         new       esquema zod del alta
└── index.css                               touched   color de la etiqueta «En Preparación»
```

La carpeta `src/components/forms/` desaparece: el formulario de equipos pasa a `src/components/notebooks/NotebookFormModal.tsx`, para que el modal de órdenes quede en la carpeta de su dominio igual que ese. El único importador del formulario de equipos es `[[src/pages/NotebookInventoryPage.tsx]]`, que actualiza su import.

### Estado de la lista — asentado

```text
OrdersPage                                                            new
  searchTerm          := useState("")                                   local
  dateFrom            := useState("")                                   local
  dateTo              := useState("")                                   local
  pagination          := useState({ pageIndex: 0, pageSize: 14 })       local
  from                := pagination.pageIndex * pagination.pageSize   computed
  to                  := from + pagination.pageSize - 1                computed
  resetPagination     := setPagination(prev => ({ ...prev, pageIndex: 0 }))   local
  isCreateOpen        := useState(false)                               local
  query               := useOrders(from, to, searchTerm, dateFrom, dateTo)   server
  orders              := query.orders                                  computed
  rowCount            := query.rowCount                                computed
  isLoading           := query.isLoading                               computed
  isError             := query.isError                                 computed
  hasFilters          := searchTerm.trim() != "" or dateFrom != "" or dateTo != ""   computed
  emptyMessage        := hasFilters ? "No se encontraron resultados"
 : "No hay órdenes disponibles"  computed
  navigate            := useNavigate()                                  function
  returns              <div class="inventory-page">
                         ├─ <Encabezado> ← «Órdenes», «Órdenes de donación registradas»
                         │    <Botón «Crear orden»> ← isCreateOpen
                         ├─ <Barra de herramientas> ← searchTerm, dateFrom, dateTo
                         │    <Input «Buscar por destinatario»> ← searchTerm
                         │    <Input «Fecha desde»> ← dateFrom
                         │    <Input «Fecha hasta»> ← dateTo
                         └─ <DataTable> ← OrderColumns, orders, pagination, rowCount, emptyMessage
                              onRowClick → navigate(`/ordenes/${fila.id}`)
```

```text
OrderFormModal                                                        new
  recipient          := form.recipient                                 form
  deliveryDate       := form.deliveryDate                              form
  description        := form.description                               form
  mutation           := useCreateOrder()                               server
  isPending          := mutation.isPending                             computed
  returns              <Dialog>
                         ├─ <Form> ← recipient, deliveryDate, description
                         └─ <Botón «Crear orden»> ← isPending
```

El `returns` es el recibo de los valores, no JSX: cada línea nombra un elemento que el componente renderiza y, después de `←`, las props que recibe y de dónde sale cada valor. `<Encabezado>` y `<Barra de herramientas>` no son componentes a crear, son los bloques de la página escritos en línea como en `[[src/pages/NotebookInventoryPage.tsx#L40-L49]]`.

Los filtros van al servidor, no al navegador: la rama de datos asienta que `getOrders` recibe la búsqueda y los límites de fecha, así que la lista no filtra en el cliente, al revés de la página de inventario (`[[src/pages/NotebookInventoryPage.tsx#L27-L35]]`).

El reset a la primera página usa la actualización funcional del inventario (`[[src/pages/NotebookInventoryPage.tsx#L64]]`) y se aplica a cualquier cambio de filtro, búsqueda y rango de fechas: con los filtros yendo al servidor, no resetear dejaría la tabla mostrando una página que no corresponde a lo pedido. La búsqueda dispara una consulta por tecla, sin debounce, como hoy en el inventario. `pageSize` es 14, el mismo que el inventario (`[[src/pages/NotebookInventoryPage.tsx#L21]]`).

## Búsqueda del inventario sobre todos los registros — asentada

### Comportamiento crítico — asentado

```text
+ Búsqueda del inventario
+ ├─ el texto busca en toda la base, no en la página abierta     ya es así en el servidor
+ ├─ el número de serie se busca por igualdad exacta              sin cambios
+ └─ cambiar el texto de búsqueda vuelve a la primera página
+    └─ si no, la ventana de la página actual puede caer fuera del resultado
+       └─ la tabla se ve vacía aunque haya coincidencias
```

El filtro de búsqueda ya se aplica en el servidor, antes del rango (`[[src/actions/notebooks.ts#L19-L34]]`), así que la búsqueda sí alcanza todos los registros de la base. Lo que la dejaba reducida a la página abierta era que la ventana del rango podía caer fuera del resultado: en la página 20, con una sola coincidencia en toda la base, la consulta pedía las filas 267 a 280 y la tabla se veía vacía, con el conteo diciendo 1.

El segundo filtrado en el navegador (`[[src/pages/NotebookInventoryPage.tsx#L27-L35]]`) se saca: la búsqueda queda en un solo lugar, el servidor, como en la lista de órdenes. Con eso el conteo que ya muestra la pantalla («14 de 57 equipos») deja de poder mostrar «3 de 57» por filas descartadas en el cliente.

La búsqueda por número de serie queda por igualdad exacta, como está. Una búsqueda por substring sobre esa columna no es posible a través de PostgREST: `ilike` no existe para la columna `integer` (error 42883) y los filtros no aceptan casts (`or=(serialNumber::text.ilike.*2*)` devuelve PGRST100). Quedaría disponible con una columna generada de texto, que no se hace.

### Interfaces y lista de módulos — asentado

El contrato de `getNotebooks` no cambia: sigue recibiendo `from`, `to`, `status` y `search`.

```text
src/
└── pages/
    └── NotebookInventoryPage.tsx    touched   resetea la paginación al cambiar la búsqueda y saca el segundo filtrado en el navegador
```

## Detalle y gestión de una orden — asentada

### Layout de la pantalla de detalle — asentado

El layout viene del prototipo aprobado: botón «← Órdenes», el destinatario como título con el número de orden y la etiqueta de estado debajo; las acciones a la derecha del encabezado; los campos de la orden en una grilla (Destinatario, Fecha de entrega, Estado, Descripción) y, debajo y a todo el ancho, la lista de equipos.

```text
+ Detalle de una orden
+ ├─ Encabezado
+ │  ├─ botón «← Órdenes»
+ │  ├─ título: destinatario
+ │  └─ subtítulo: número de orden y estado
+ ├─ Acciones (a la derecha del encabezado)
+ │  ├─ En Preparación, en consulta: «Editar», «Marcar como Donado», «Eliminar orden» si no tiene equipos
+ │  ├─ En Preparación, editando: «Cancelar» y «Guardar Cambios»
+ │  └─ Donado: «Volver a En Preparación»
+ └─ Campos de la orden (grilla)
+    ├─ Destinatario
+    ├─ Fecha de entrega
+    ├─ Estado
+    └─ Descripción
+ Lista de equipos de la orden
+ ├─ DataTable (shared/table) con OrderNotebookColumns        orders/table/OrderNotebookColumns
+ │  ├─ Nombre de equipo   ← brand + model
+ │  ├─ N.° de Serie        ← serialNumber
+ │  ├─ Estado              ← status
+ │  ├─ Especificaciones    ← specs
+ │  └─ Acciones ← botón «Quitar» → modal de desvincular
+ ├─ sin onRowClick: la fila no abre nada
+ └─ sin paginación: se muestran todos los equipos, como en el prototipo
```

Las acciones según el estado salen del prototipo aprobado: en modo consulta sobre una orden En Preparación están «Editar», «Marcar como Donado» y «Eliminar orden» —este último solo si la orden no tiene equipos—; mientras se edita, solo «Cancelar» y «Guardar Cambios»; y en Donado, solo «Volver a En Preparación».

La lista de equipos del detalle se arma con `DataTable` y su propio archivo de columnas, sin click en la fila y sin paginación: la lista de equipos de una orden es un conjunto cerrado que el diseño muestra entero (`design.md`, rama 4), y en modo edición el borrador es esa lista.

Como `DataTable` siempre dibuja el bloque «Anterior» / «Siguiente» (`[[src/components/notebooks/table/DataTable.tsx#L113-L132]]`), `pagination` y `setPagination` pasan a ser opcionales en el componente compartido y ese bloque se dibuja solo cuando se los pasan. Con `manualPagination: true` —que ya está— la tabla no recorta las filas, así que sin estado de paginación se ven todos los equipos.

El modal de agregar equipo se arma con el `MultiSelect` que ya existe en `src/components/ui/multi-select.tsx` y que hoy no usa nadie: `MultiSelect` como contenedor controlado, `MultiSelectTrigger` como botón «Agregar equipo», `MultiSelectContent` con la búsqueda de `cmdk` y `MultiSelectItem` por equipo disponible. El prototipo era un maqueta y le ponía un paso intermedio, «Agregar selección»; con el `MultiSelect` la selección va directo a los cambios pendientes de la edición, porque el componente es controlado por `values` y `onValuesChange`.

### Árbol de componentes — asentado

```text
+ OrderDetailPage (src/pages/OrderDetailPage.tsx)                              new
+ ├─ Encabezado: «← Órdenes», destinatario como título, «Orden #id» y estado    ui/badge
+ ├─ Acciones: Editar / Guardar Cambios / Cambiar estado / Eliminar / Volver     ui/button
+ ├─ Grilla de campos
+ │  ├─ Destinatario     ← draft.recipient | order.recipient                    ui/input, ui/label
+ │  ├─ Fecha de entrega ← draft.deliveryDate | order.deliveryDate              ui/input
+ │  ├─ Estado           ← order.status, solo lectura                           ui/badge
+ │  └─ Descripción      ← draft.description | order.description                ui/textarea
+ ├─ Sección de equipos
+ │  ├─ DataTable ← OrderNotebookColumns, teams                                 shared/table/DataTable
+ │  └─ MultiSelect «Agregar equipo» ← availableTeams                          ui/multi-select
+ ├─ OrderRemoveTeamModal: quitar equipo con su estado de retorno              orders/OrderRemoveTeamModal
+ ├─ ConfirmModal: salir sin guardar / volver a En Preparación / eliminar        shared/modals/ConfirmModal
+ ├─ useOrder(id)                                                               hooks/orders/useOrder
+ ├─ useUpdateOrder()                                                           hooks/orders/useUpdateOrder
+ ├─ useChangeOrderStatus()                                                     hooks/orders/useChangeOrderStatus
+ └─ useDeleteOrder()                                                           hooks/orders/useDeleteOrder
```

`OrderRemoveTeamModal` es un componente propio y no el `ConfirmModal` genérico porque lleva el `Select` con el estado de retorno del equipo: el prototipo lo muestra como «Quitar equipo» con un select «Estado de retorno» y los botones «Cancelar» y «Quitar de la orden». El estado que se elige ahí es el que se escribe junto con la desvinculación (`shape.md`, Q8; `design.md`, rama 2.4).

`ConfirmModal` se generaliza para que sirva a los tres casos de órdenes: «salir sin guardar», «volver a En Preparación» y «eliminar orden». Hoy sus props están escritas para equipos (`confirmDeleteId`, `handleDeleteNotebook`, `setConfirmDeleteId`, `[[src/interfaces/utils.interface.ts#L1-L7]]`), el botón dice «Eliminar» fijo y es destructivo siempre; lo usan las asistencias y el inventario (`[[src/components/attendance/UserActions.tsx#L40]]`, `[[src/components/notebooks/NotebookActions.tsx#L28]]`).

```text
+ ConfirmModal (shared/modals)
+ ├─ id, onConfirm, onClose
+ ├─ title, description
+ ├─ confirmLabel, destructive
+ └─ isPending
```

### Estado del detalle — asentado

```text
OrderDetailPage                                                          new
  id                 := useParams().id                                   prop
  orderQuery         := useOrder(id)                                     server
  order              := orderQuery.order                                computed
  orderNotebooks     := orderQuery.notebooks                             computed
  availableNotebooks := useAvailableNotebooks().notebooks                server
  isEditing          := useState(false)                                  local
  draft              := useState<Draft | null>(null)                     local
  hasChanges         := draft != null and (draft.recipient != order.recipient
      or draft.deliveryDate != order.deliveryDate
      or draft.description != order.description
      or draft.attach.length > 0
      or draft.detach.length > 0)                                        computed
  rows               := orderNotebooks
      + draft.attach, marcados «Pendiente»
      - draft.detach, marcados «Se quitará»                               computed
  detachStatus       := el estado de retorno elegido en el modal         local
  updateOrder        := useUpdateOrder()                                 server
  changeStatus       := useChangeOrderStatus()                           server
  deleteOrder        := useDeleteOrder()                                 server
  returns              <Detalle>
                         ├─ <Encabezado> ← order.recipient, order.id, order.status
                         ├─ <Acciones> ← isEditing, hasChanges, order.status
                         ├─ <Grilla de campos> ← draft | order
                         └─ <DataTable> ← rows
```

```text
Draft                                                                  new
  recipient          := el valor del campo en el momento de editar
  deliveryDate       := el valor del campo en el momento de editar
  description        := el valor del campo en el momento de editar
  attach             := ids de los equipos que se agregan
  detach             := pares (id de equipo, estado de retorno)
```

El borrador se crea al pulsar «Editar», con una copia de los campos de la orden y las dos listas vacías, y se va llenando con cada cambio: escribir en un campo actualiza su valor, elegir un equipo en el selector lo suma a `attach`, y quitar un equipo de la fila lo suma a `detach` con el estado de retorno elegido. Nada se escribe hasta «Guardar Cambios», que manda el borrador entero en una sola llamada; «Cancelar» lo descarta.

El borrador guarda solo lo que cambió, no una copia de la lista de equipos: si copiara la lista, no se podría distinguir «el equipo está marcado para quitarse» de «el equipo cambió de estado». Las filas de la tabla se arman con `orderNotebooks + attach − detach`.

`hasChanges` mira si el borrador se diferenció de la orden; si no hay cambios, «Guardar Cambios» queda deshabilitado. El modal «Se perderán los cambios» aparece al salir de la pantalla con cambios pendientes.

Los equipos disponibles para el selector salen de una lectura nueva, `getAvailableNotebooks`, con el filtro de estado «Listo para Donar» y `order_id` nulo. No pueden armarse con los datos que la pantalla ya tiene: los equipos disponibles son otros, y que un equipo esté asociado a otra orden es una propiedad de la base (`shape.md`, Q7 y Q8). La consulta va en `src/actions/notebooks.ts`, con el resto de las consultas de equipos, y llega a la pantalla por un hook, como todas las demás (`[[src/actions/notebooks.ts]]`).

### Interfaces y lista de módulos — asentado

```json
{
  "title": "getOrder",
  "description": "Lee una orden con los equipos que tiene asociados.",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": { "id": { "type": "string", "description": "Identificador de la orden." } },
      "required": ["id"]
    },
    "output": {
      "type": "object",
      "properties": {
        "order": { "$ref": "#/$defs/Order" },
        "notebooks": {
          "type": "array",
          "items": { "$ref": "#/$defs/NotebookRow" },
          "description": "Los equipos asociados a la orden."
        }
      },
      "required": ["order", "notebooks"]
    }
  },
  "$defs": {
    "Order": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "recipient": { "type": "string" },
        "deliveryDate": { "type": "string", "description": "Fecha de entrega, con precisión de día." },
        "description": { "type": ["string", "null"] },
        "status": { "type": "string" },
        "created_at": { "type": "string" }
      },
      "required": ["id", "recipient", "deliveryDate", "status"]
    },
    "NotebookRow": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "serialNumber": { "type": "integer" },
        "brand": { "type": ["string", "null"] },
        "model": { "type": ["string", "null"] },
        "status": { "type": ["string", "null"] },
        "specs": { "type": ["string", "null"] },
        "order_id": { "type": ["string", "null"] }
      },
      "required": ["id", "serialNumber"]
    }
  }
}
```

```json
{
  "title": "getAvailableNotebooks",
  "description": "Los equipos que se pueden asociar a una orden: Listos para donar y sin orden.",
  "type": "object",
  "properties": {
    "input": { "type": "object", "properties": {} },
    "output": {
      "type": "array",
      "items": { "$ref": "#/$defs/NotebookRow" },
      "description": "Los equipos disponibles para asociar."
    }
  },
  "$defs": {
    "NotebookRow": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "serialNumber": { "type": "integer" },
        "brand": { "type": ["string", "null"] },
        "model": { "type": ["string", "null"] },
        "status": { "type": ["string", "null"] }
      },
      "required": ["id", "serialNumber"]
    }
  }
}
```

```json
{
  "title": "OrderDraft",
  "description": "Los cambios pendientes de una orden, que se guardan juntos.",
  "type": "object",
  "properties": {
    "recipient": { "type": "string" },
    "deliveryDate": { "type": "string" },
    "description": { "type": ["string", "null"] },
    "attach": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": { "notebookId": { "type": "string" } },
        "required": ["notebookId"]
      },
      "description": "Los equipos que se asocian."
    },
    "detach": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "notebookId": { "type": "string" },
          "status": { "type": "string", "description": "El estado con el que el equipo vuelve al Inventario." }
        },
        "required": ["notebookId", "status"]
      },
      "description": "Los equipos que se desvinculan."
    }
  },
  "required": ["recipient", "deliveryDate", "description", "attach", "detach"]
}
```

```json
{
  "title": "ConfirmModal",
  "$comment": "exists, generalized",
  "type": "object",
  "properties": {
    "id": { "type": "string", "$comment": "added", "description": "El identificador del registro sobre el que se confirma." },
    "onConfirm": { "type": "function", "$comment": "added", "description": "Se llama con el identificador cuando la persona confirma." },
    "onClose": { "type": "function", "$comment": "added", "description": "Cierra el modal sin confirmar." },
    "confirmLabel": { "type": "string", "$comment": "added", "description": "El texto del botón de confirmación." },
    "destructive": { "type": "boolean", "$comment": "added", "description": "Si el botón de confirmación va en variante destructiva." },
    "title": { "type": "string", "$comment": "exists" },
    "description": { "type": "string", "$comment": "exists" },
    "isPending": { "type": "boolean", "$comment": "exists" }
  },
  "required": ["id", "onConfirm", "onClose", "confirmLabel"]
}
```

```json
{
  "title": "OrderRemoveTeamModal",
  "description": "Pide el estado con el que un equipo vuelve al Inventario antes de desvincularlo.",
  "type": "object",
  "properties": {
    "notebook": { "$ref": "#/$defs/NotebookRow", "description": "El equipo que se va a desvincular." },
    "onConfirm": { "type": "function", "description": "Se llama con el estado de retorno elegido." },
    "onClose": { "type": "function", "description": "Cierra el modal sin desvincular." }
  },
  "required": ["notebook", "onConfirm", "onClose"],
  "$defs": {
    "NotebookRow": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "serialNumber": { "type": "integer" },
        "brand": { "type": ["string", "null"] },
        "model": { "type": ["string", "null"] },
        "status": { "type": ["string", "null"] }
      },
      "required": ["id", "serialNumber"]
    }
  }
}
```

```text
src/
├── actions/
│   ├── notebooks.ts                touched   agrega getAvailableNotebooks
│   └── orders.ts                   touched   agrega getOrder
├── components/
│   ├── attendance/
│   │   └── UserActions.tsx         touched   usa las props nuevas del ConfirmModal
│   ├── modals/
│   │   └── ConfirmModal.tsx        touched   props generalizados
│   ├── notebooks/
│   │   └── NotebookActions.tsx     touched   usa las props nuevas del ConfirmModal
│   ├── orders/
│   │   ├── OrderFormModal.tsx      shared, defined in Lista y creación
│   │   ├── OrderRemoveTeamModal.tsx new      desvincular un equipo con su estado de retorno
│   │   └── table/
│   │       ├── OrderColumns.tsx    shared, defined in Lista y creación
│   │       └── OrderNotebookColumns.tsx new   columnas de los equipos de la orden
│   └── shared/
│       └── table/
│           ├── DataTable.tsx       touched   pagination y setPagination pasan a ser opcionales
│           └── data-table-features.ts shared, defined in Lista y creación
├── hooks/
│   ├── notebooks/
│   │   └── useAvailableNotebooks.ts new
│   └── orders/
│       └── useOrder.ts             new
├── interfaces/
│   ├── order.interface.ts          touched   agrega OrderDraft y las props de los modales
│   └── utils.interface.ts          touched   ConfirmModalType pasa a ser genérica
└── pages/
    └── OrderDetailPage.tsx         new
```

## Integración de órdenes en Inventario — asentada

### Layout del formulario del equipo — asentado

El bloque de la orden va al final del formulario del equipo, como en el prototipo aprobado (`[[.scratch/ordenes/prototypes/orders.html#L301]]`), y no encima de modelo y marca como decía el diseño (`design.md`, rama 4).

```text
+ Formulario del equipo (NotebookFormModal)
+ ├─ Modelo
+ ├─ Marca
+ ├─ Estado ← deshabilitado mientras el equipo tenga orden
+ ├─ Especificaciones
+ ├─ Tareas a Realizar
+ ├─ Historial de Reparaciones
+ └─ <Bloque de la orden>            solo si el equipo tiene orden
+    ├─ «Orden de donación»
+    ├─ <Link to={`/ordenes/${order.id}`}> → recipient
+    └─ «Fecha de entrega: …»
```

El estado del equipo no se puede cambiar desde Inventario mientras esté asociado a una orden (`shape.md`, Q6): el `Select` de estado queda deshabilitado. El resto de los campos siguen editables, porque el diseño solo restringe el estado.

El `order_id` no está hoy en el modelo de la aplicación: `Notebook` no lo tiene (`[[src/interfaces/notebook.interface.ts#L9-L19]]`) ni `mapNotebook` lo mapea (`[[src/utils/notebook.ts#L5-L17]]`). Se suma a los dos, y el modal no puede saber si el equipo tiene orden hasta que eso esté.

### Árbol de componentes — asentado

```text
+ NotebookFormModal (src/components/notebooks/NotebookFormModal.tsx)      moved
+ ├─ <Select de Estado>                                                 ui/select
+ │    disabled cuando notebook.orderId no es nulo
+ └─ <NotebookOrderBlock>                                               ui/link
+      se dibuja solo cuando notebook.orderId no es nulo
+
+ NotebookOrderBlock (src/components/notebooks/NotebookOrderBlock.tsx)    new
+ ├─ «Orden de donación»
+ ├─ <Link to={`/ordenes/${order.id}`}> ← order.recipient
+ └─ «Fecha de entrega: …» ← order.deliveryDate
```

El bloque va en su propio archivo, no en línea en el modal.

El enlace va con `Link` de react-router y no con un `button` que navegue: el modal se abre dentro del árbol del router, así que el enlace funciona y además permite abrirlo en una pestaña nueva con el menú contextual. La fecha se muestra con el formato de la app, que ya tiene `date-fns` como dependencia (`package.json`).

### Interfaces y lista de módulos — asentado

```json
{
  "title": "NotebookOrderBlock",
  "description": "Muestra la orden de donación a la que pertenece el equipo, con un enlace a su detalle.",
  "type": "object",
  "properties": {
    "order": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "recipient": { "type": "string" },
        "deliveryDate": { "type": "string", "description": "Fecha de entrega, con precisión de día." }
      },
      "required": ["id", "recipient", "deliveryDate"]
    }
  },
  "required": ["order"]
}
```

```json
{
  "title": "Notebook",
  "$comment": "exists, gains a member",
  "type": "object",
  "properties": {
    "orderId": {
      "type": ["string", "null"],
      "$comment": "added",
      "description": "La orden a la que pertenece el equipo; nulo cuando no tiene orden."
    }
  }
}
```

```json
{
  "title": "useOrder",
  "description": "Lee una orden con sus equipos; sin id no hace la consulta.",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "id": { "type": ["string", "null"], "description": "La orden a leer; si falta, no se consulta." }
      }
    },
    "output": {
      "type": "object",
      "properties": {
        "order": { "$ref": "#/$defs/Order" },
        "notebooks": { "type": "array", "items": { "$ref": "#/$defs/NotebookRow" } },
        "isLoading": { "type": "boolean" },
        "isError": { "type": "boolean" },
        "refetch": { "type": "function" }
      },
      "required": ["order", "notebooks", "isLoading", "isError"]
    }
  },
  "$defs": {
    "Order": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "recipient": { "type": "string" },
        "deliveryDate": { "type": "string" },
        "description": { "type": ["string", "null"] },
        "status": { "type": "string" }
      },
      "required": ["id", "recipient", "deliveryDate", "status"]
    },
    "NotebookRow": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "serialNumber": { "type": "integer" },
        "brand": { "type": ["string", "null"] },
        "model": { "type": ["string", "null"] },
        "status": { "type": ["string", "null"] },
        "specs": { "type": ["string", "null"] }
      },
      "required": ["id", "serialNumber"]
    }
  }
}
```

```text
src/
├── components/
│   └── notebooks/
│       ├── NotebookFormModal.tsx         moved     desde components/forms/NotebookForm/
│       └── NotebookOrderBlock.tsx        new       bloque de la orden en el formulario del equipo
├── hooks/
│   └── orders/
│       └── useOrder.ts                   touched   acepta id indefinido; sin id no consulta
├── interfaces/
│   └── notebook.interface.ts             touched   Notebook suma orderId
├── pages/
│   └── NotebookInventoryPage.tsx         touched   import del modal movido
└── utils/
    └── notebook.ts                       touched   mapNotebook mapea order_id a orderId
```

La fecha de entrega se formatea con `date-fns` y el locale `es`, como el resto de la app (`[[src/components/attendance/AttendanceColumns.tsx#L2-L3]]`, `[[src/utils/attendanceReportPdf.ts#L11]]`).

## Estándares — asentados

No hay wiki ni `AGENTS.md` en el proyecto, así que las fuentes de convenciones son el propio código, que cada rama leyó antes de proponer.

### Datos y persistencia de Órdenes

- `src/actions/notebooks.ts`: la forma de una acción de Supabase —consulta encadenada, `throw` con el mensaje del error, devolver los datos— gobierna las seis acciones de órdenes.
- `src/hooks/notebooks/useNotebooks.ts` y `src/hooks/notebooks/useCreateNotebook.ts`: la forma de un hook de React Query —`useQuery` con la clave y `staleTime`, `useMutation` que invalida la consulta y avisa con un toast— gobierna los seis hooks de órdenes.
- `src/supabase/supabase.ts`: los tipos generados por Supabase —la forma de `orders` y de `notebooks`, y el `Functions` que crece con cada RPC— gobiernan los tipos de fila y de payload que usan las acciones.
- `supabase/migrations/20261113180933_remote_schema.sql`: las convenciones del esquema —columnas en camelCase, `status` como `text`, `gen_random_uuid()` para las claves, FK con `ON UPDATE CASCADE` y sin `ON DELETE`— gobiernan la migración con las dos funciones y la restricción `orders_status_check`.
- `src/utils/notebookStatus.ts`: la forma de una lista de estados —valor, etiqueta y color— gobierna `src/utils/orderStatus.ts`.

### Acceso a Órdenes: rutas y navegación

- `src/router/index.tsx`: `createHashRouter` con las rutas hijas de `RootLayout` y los paths en español gobierna las rutas `ordenes` y `ordenes/:id`.
- `src/components/shared/Nav.tsx`: las entradas de menú como `NavLink`, con `end` solo en la raíz, gobiernan la entrada de Órdenes.

### Lista y creación de órdenes

- `src/pages/NotebookInventoryPage.tsx`: la forma de una página de listado —contenedor `inventory-page`, encabezado con acción, barra de herramientas con búsqueda y filtros, conteo de resultados, estado de paginación en `useState`— gobierna `OrdersPage`.
- `src/components/notebooks/table/DataTable.tsx`: la tabla con paginación manual, `rowCount`, `onRowClick`, `emptyMessage` e `isLoading` gobierna las tres tablas de órdenes y el cambio que vuelve opcionales `pagination` y `setPagination`.
- `src/components/notebooks/table/NotebookColumns.tsx`: las columnas con `createColumnHelper` sobre el tipo de fila gobiernan `OrderColumns` y `OrderNotebookColumns`.
- `src/components/forms/NotebookForm/NotebookFormModal.tsx`: la forma de un formulario en un `Dialog` —`react-hook-form` con `zodResolver`, `Card` para cabecera, cuerpo y pie, `Spinner` en el botón mientras guarda— gobierna `OrderFormModal`.
- `src/validators/notebookFormModal.validator.ts`: el esquema de zod con el tipo inferido al lado gobierna `orderFormModal.validator.ts`.
- `src/index.css`: las clases `inventory-*` y las reglas de color por estado gobiernan el color de la etiqueta «En Preparación» y los estilos del bloque de la orden.

### Detalle y gestión de una orden

- `src/interfaces/notebook.interface.ts`: el modelo de la aplicación en camelCase y los tipos de props en el mismo archivo gobiernan `order.interface.ts`, el `OrderDraft` y las props de los modales.
- `src/utils/notebook.ts`: el mapeo de la fila generada al modelo de la aplicación gobierna que `mapNotebook` mapee `order_id` a `orderId`.
- `src/components/modals/ConfirmModal.tsx` y `src/interfaces/utils.interface.ts`: el modal de confirmación con su tipo en `utils.interface.ts` gobierna la generalización de sus props.
- `src/components/ui/multi-select.tsx`: el selector múltiple controlado por `values` y `onValuesChange`, con la búsqueda de `cmdk`, gobierna el selector de equipos del detalle.

### Integración de órdenes en Inventario

- `src/components/forms/NotebookForm/NotebookFormModal.tsx`: el formulario del equipo, ya mudado a `src/components/notebooks/`, gobierna el bloque de la orden y el `Select` de estado deshabilitado.
- `src/interfaces/notebook.interface.ts` y `src/utils/notebook.ts`: el modelo y su mapeo gobiernan el campo `orderId`.
- `src/utils/attendanceReport.ts` y `src/components/attendance/AttendanceColumns.tsx`: el formato de fechas con `date-fns` y el locale `es` gobierna la fecha de entrega del bloque de la orden.

### Búsqueda del inventario sobre todos los registros

- `src/pages/NotebookInventoryPage.tsx`: el estado de paginación en `useState` con actualización funcional al cambiar un filtro gobierna el reset de la página al cambiar la búsqueda.

## Referencias de código observadas

- `[[src/router/index.tsx#router]]` registra las rutas existentes.
- `[[src/pages/NotebookInventoryPage.tsx#NotebookInventoryPage]]` coordina la pantalla de inventario.
- `[[src/actions/notebooks.ts#getNotebooks]]` y `[[src/hooks/notebooks/useNotebooks.ts#useNotebooks]]` muestran el patrón actual de acceso a notebooks.
- `[[src/interfaces/notebook.interface.ts#Notebook]]` y `[[src/utils/notebook.ts#mapNotebook]]` representan y adaptan los datos de notebooks.
- `[[.scratch/ordenes/prototypes/orders.html]]` contiene la composición aprobada de lista, detalle, modales e integración en Inventario.
