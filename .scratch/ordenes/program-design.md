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

## Árbol inicial

```text
Diseño del programa — Órdenes
├─ Datos y persistencia de Órdenes                         open
├─ Acceso a Órdenes: rutas y navegación                    pending
├─ Lista y creación de órdenes                             pending
├─ Detalle y gestión de una orden                          pending
└─ Integración de órdenes en Inventario                    pending
```

El orden propuesto parte del almacenamiento que sirve a las pantallas, luego define el acceso y trabaja las superficies visibles. La lista y el detalle son ramas separadas porque el diseño define la tabla como entrada y una página de detalle distinta. Inventario conserva su pantalla existente y recibe el vínculo a la orden y la restricción de estado.

El usuario confirmó este árbol y orden al retomar el diseño.

## Datos y persistencia de Órdenes — abierta

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

#### Callstack de la lista — propuesta

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

#### Callstack — propuesta

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

#### Callstack — propuesta

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

### Cambio de estado de una orden — abierto

```text
+ OrderDetailPage: acción de transición y confirmación cuando corresponde                    según diseño
+ └─ useChangeOrderStatus (mutación)                                                           nuevo
+    └─ changeOrderStatus (orderId, nuevo estado)                                              nuevo
+       └─ Supabase RPC change_order_status(...)                                               nuevo
+          └─ transacción SQL: actualizar orden y equipos asociados en conjunto                migración
+ éxito: invalidar órdenes y equipos; error: notificar y mantener el estado actual
```

La función PostgreSQL se agrega en una migración SQL. La acción invoca la RPC desde `src/actions/orders.ts`; el hook correspondiente vive en `src/hooks/orders/`. Las definiciones SQL se despliegan por separado a cada proyecto Supabase, y los tipos generados no ejecutan migraciones.

### Organización de módulos para las cinco operaciones — propuesta

- Acciones en `src/actions/orders.ts`: `getOrders`, `createOrder`, `updateOrder`, `changeOrderStatus` y `deleteOrder`.
- Hooks en `src/hooks/orders/`: un archivo `use...` por operación (`useOrders`, `useCreateOrder`, `useUpdateOrder`, `useChangeOrderStatus`, `useDeleteOrder`).
- Definiciones PostgreSQL de las dos operaciones compuestas en `supabase/migrations/`; el RPC se invoca desde acciones y no se añade a `supabase.ts`.

## Referencias de código observadas

- `[[src/router/index.tsx#router]]` registra las rutas existentes.
- `[[src/pages/NotebookInventoryPage.tsx#NotebookInventoryPage]]` coordina la pantalla de inventario.
- `[[src/actions/notebooks.ts#getNotebooks]]` y `[[src/hooks/notebooks/useNotebooks.ts#useNotebooks]]` muestran el patrón actual de acceso a notebooks.
- `[[src/interfaces/notebook.interface.ts#Notebook]]` y `[[src/utils/notebook.ts#mapNotebook]]` representan y adaptan los datos de notebooks.
- `[[.scratch/ordenes/prototypes/orders.html]]` contiene la composición aprobada de lista, detalle, modales e integración en Inventario.
