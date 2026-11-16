# Órdenes — estado de la implementación

## Blocking questions

- Ninguna.

## Project status

- Estado: rama `feature/ordenes`. Etapa: implementada y validada a medias; 12 de las 16 filas de la matriz manual pasaron y 4 quedaron bloqueadas por la misma causa (la migración de las RPC no está aplicada en la base). Comprobaciones: `npm run build` pasa; `npm run lint` mantiene la línea base (26 problemas: 24 errores y 2 warnings, los mismos antes del cambio, ninguno en los archivos nuevos).
- Informe de validación: `.scratch/ordenes/reports/browser/index.html`. Siguiente paso: revisión agéntica sobre el diff.

## Highlights

- El usuario validó el árbol de tareas T0–T9 y la matriz manual V1–V16 sin cambios.
- La migración de las dos RPC no se aplica al proyecto remoto enlazado: queda solo el archivo `.sql`. Consecuencia: las firmas de `save_order_changes` y `change_order_status` se declaran a mano en `src/supabase/supabase.ts` y `supabase/supabase.ts`, porque `public.Functions` está vacío y `supabase.rpc(...)` no compila. Es una desviación del programa de diseño, que decía que los tipos no se escriben a mano; al aplicar la migración y regenerar los tipos, lo escrito a mano se reemplaza por lo generado.
- No se toca el CLI de Supabase: el devDependency `supabase@2.64.2` no parsea `supabase/config.toml` (clave `[local_smtp]`) y queda como está.
- El proyecto no tiene suite de tests (sin vitest/jest, sin script `test`): no hay filas automatizadas y las comprobaciones son `npm run lint` y `npm run build`.
- La validación manual la corrió esta sesión con navegador (agent-browser) contra el servidor de desarrollo y el Supabase enlazado.
- En Inventario se comprobó el bloque de la orden: el enlace al detalle y el `Select` de estado deshabilitado funcionan.
- El subagente de implementación dejó cuatro decisiones propias que el usuario todavía no vio: el texto del selector sin equipos disponibles (siguió el diseño, no el prototipo), el formato del «número de orden» (los primeros 8 caracteres del uuid), un módulo extra `src/utils/order.ts` con `formatDeliveryDate` y un tipo extra `OrderTeam`; además, `deleteOrder` revalida estado y equipos asociados en la acción, y el texto de espera del `ConfirmModal` pasó de «Eliminando…» a «Procesando…».

## Open items

- V4, V7, V8 y V9 quedan bloqueadas: necesitan la migración aplicada en la base. Evidencia en `.scratch/ordenes/reports/browser/index.html`. LaRPC responde `PGRST202`.
- Sin resolver por el usuario: el texto «Se perderán los cambios» y el formato del número de orden, y las cuatro decisiones propias del subagente que quedan listadas en Highlights.
