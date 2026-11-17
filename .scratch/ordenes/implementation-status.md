# Órdenes — estado de la implementación

## Blocking questions

- Ninguna.

## Project status

- Estado: rama `feature/ordenes`. Etapa: implementada y validada. Las 16 filas de la matriz manual V1–V16 pasan: 12 en la corrida del 2026-11-16 y las 4 que quedaban bloqueadas (V4, V7, V8, V9) en la revalidación del 2026-11-17, ya aplicada la migración de las RPC en la base. Comprobaciones: `npm run build` pasa; `npm run lint` mantiene la línea base (26 problemas: 24 errores y 2 warnings, los mismos antes del cambio, ninguno en los archivos nuevos).
- Informe de validación (con las 16 filas): `.scratch/ordenes/reports/browser/index.html`. Siguiente paso: revisión agéntica sobre el diff.

## Highlights

- El usuario validó el árbol de tareas T0–T9 y la matriz manual V1–V16 sin cambios.
- La migración de las dos RPC (`supabase/migrations/20261116120000_order_transactions.sql`) se aplicó al proyecto remoto enlazado (`npx supabase db push --remote`). Las funciones `save_order_changes` y `change_order_status` existen en el esquema desplegado. Los tipos manuales en `src/supabase/supabase.ts` y `supabase/supabase.ts` quedan declarados a mano todavía (desviación del programa de diseño) hasta que se regenere el archivo de tipos con el CLI.
- No se toca el CLI de Supabase: el devDependency `supabase@2.64.2` no parsea `supabase/config.toml` (clave `[local_smtp]`) y queda como está.
- El proyecto no tiene suite de tests (sin vitest/jest, sin script `test`): no hay filas automatizadas y las comprobaciones son `npm run lint` y `npm run build`.
- La validación manual la corrió esta sesión con navegador (agent-browser) contra el servidor de desarrollo y el Supabase enlazado.
- En Inventario se comprobó el bloque de la orden: el enlace al detalle y el `Select` de estado deshabilitado funcionan.
- El subagente de implementación dejó cuatro decisiones propias que el usuario todavía no vio: el texto del selector sin equipos disponibles (siguió el diseño, no el prototipo), el formato del «número de orden» (los primeros 8 caracteres del uuid), un módulo extra `src/utils/order.ts` con `formatDeliveryDate` y un tipo extra `OrderTeam`; además, `deleteOrder` revalida estado y equipos asociados en la acción, y el texto de espera del `ConfirmModal` pasó de «Eliminando…» a «Procesando…».
- Revalidación V4, V7, V8, V9 (2026-11-17): las cuatro filas pasan. La RPC `save_order_changes` acepta cambios de campos, agregado y retiro por separado (V4 en tres pasos); `change_order_status` aplica la transición de la orden y de sus equipos en una sola operación (V8, V9). V7: retiro de un equipo ya asociado con estado de retorno elegido; el equipo vuelve al Inventario con ese estado y sin orden.

## Open items

- Sin resolver por el usuario: el texto «Se perderán los cambios» y el formato del número de orden, y las cuatro decisiones propias del subagente que quedan listadas en Highlights.
- Hallazgo fuera de la matriz (no cubierto por ninguna fila ni decisión previa): la UI no marca visualmente con la etiqueta «Se quitará» el retiro de un equipo <em>ya asociado</em> a la orden, que es la única forma de quitar un equipo desde la UI. El borrador en [[src/pages/OrderDetailPage.tsx#OrderDetailPage]] solo etiqueta «Pendiente» a los equipos agregados en la operación; el retiro de un equipo de la orden queda sin etiqueta antes de guardar. Evidencia en `.scratch/ordenes/reports/browser/index.html` (sección V4).
- Los tipos manuales de `public.Functions` en `src/supabase/supabase.ts` y `supabase/supabase.ts` quedan declarados a mano todavía; hay que regenerarlos con `npx supabase gen types typescript --linked --project-ref <PROJECT_REF>` para reemplazar lo escrito a mano (desviación asentada en la corrida de implementación).
