# Órdenes — diseño del programa

## Cobertura

Detalla cómo implementar el diseño asentado en `design.md`: almacenamiento y acceso a datos de órdenes, pantallas de Órdenes, integración con Inventario y navegación necesaria.

Fuera de alcance: cambiar las decisiones funcionales de `design.md`, escribir código y diseñar pruebas. El usuario indicó que por ahora no se usarán la wiki ni una nota de invariantes.

## Decisiones que el diseño del sistema deja para esta etapa

- Tipos SQL concretos, constraints, relación y migración de `orders` y `notebooks.order_id`.
- Tipos de Supabase y representación de las órdenes dentro de la aplicación.
- Operaciones de lectura y escritura, incluidas las transacciones atómicas para editar una orden y para cambiar el estado junto con el de sus equipos.
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

## Datos y persistencia de Órdenes — abierta

### Alcance asentado

- El usuario creará la tabla en Supabase y descargará aquí los tipos generados para revisarlos. El diseño del programa no especificará ni preparará el SQL de esa tabla.
- El contrato de aplicación y los archivos afectados por el tipo generado se pueden diseñar antes de esa revisión.
- La propuesta inicial de esquema no se asentó; el modelo persistido queda pendiente de revisar junto con los tipos descargados.

### Revisión del tipo descargado — pendiente de corrección

- El archivo actualizado es `supabase/supabase.ts`, pero `src/supabase/client.ts` importa `src/supabase/supabase.ts`; la aplicación todavía no consume el archivo descargado.
- El tipo descargado declara `orders.id` como `number` y `notebooks.order_id` como `string | null`, y no declara una relación en `notebooks`. Para el vínculo del diseño, ambos campos deben tener el mismo tipo y Supabase debe exponer la FK.
- `deliveryDate: string` no demuestra que la columna SQL sea `date`; el diseño requiere fecha sin hora.
- `orders.Insert` permite omitir `recipient`; comprobar si la columna tiene un default, porque el diseño exige destinatario.
- `status` se representa como `string`; confirmar en Supabase que solo se permitan En Preparación y Donado.

## Referencias de código observadas

- `[[src/router/index.tsx#router]]` registra las rutas existentes.
- `[[src/pages/NotebookInventoryPage.tsx#NotebookInventoryPage]]` coordina la pantalla de inventario.
- `[[src/actions/notebooks.ts#getNotebooks]]` y `[[src/hooks/notebooks/useNotebooks.ts#useNotebooks]]` muestran el patrón actual de acceso a notebooks.
- `[[src/interfaces/notebook.interface.ts#Notebook]]` y `[[src/utils/notebook.ts#mapNotebook]]` representan y adaptan los datos de notebooks.
- `[[.scratch/ordenes/prototypes/orders.html]]` contiene la composición aprobada de lista, detalle, modales e integración en Inventario.
