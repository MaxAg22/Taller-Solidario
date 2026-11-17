# Órdenes

## Stage

Implementación: implementado, validado y revisado por el usuario. Las 16 filas de la matriz manual V1–V16 pasan (12 en la corrida del 2026-11-16, las 4 bloqueadas V4, V7, V8, V9 revalidadas el 2026-11-17 tras aplicar la migración). Los cambios de UI y bug de post-validación están documentados en `pre-human-review.md` y validados por el usuario. Siguiente etapa: revisión agéntica.

## Links

- Documentación: [docs/README.md](../../docs/README.md), [docs/app/orders.md](../../docs/app/orders.md)
- Rama de trabajo: `feature/ordenes` (desde `main`)

## Local artifacts

- `status.md` — stage, links, artefactos y tracking de Órdenes.
- `canvas/` — documentos del canvas de exploración.
- `canvas/explore.tldr.json` — canvas del explore y diagrama de componentes.
- `canvas/explore.svg` — export del canvas.
- `canvas/mockups/` — carpeta vacía creada por el scaffold del canvas.
- `shape.md` — árbol y decisiones de alcance resueltas.
- `design.md` — árbol de diseño y representación asentada de datos de órdenes.
- `program-design.md` — cobertura, decisiones técnicas por especificar y árbol de ramas del diseño del programa.
- `implementation-tree.md` — árbol de tareas T0–T9, matriz de validación manual V1–V16 y decisiones tomadas para la implementación.
- `implementation-status.md` — estado de la corrida de implementación.
- `pre-human-review.md` — cambios de UI y bug aplicados tras la validación, validados por el usuario.
- `prototypes/` — prototipos interactivos de la rama de interfaz.
- `prototypes/orders.html` — prototipo de la alternativa A para la tabla de órdenes, detalle, asociación e indicador en Inventario.
- `prototypes/InterVariable.woff2` — copia local de la tipografía de la aplicación para el prototipo.

## Tracking

- Las firmas de las dos RPC se declaran a mano en `src/supabase/supabase.ts` y `supabase/supabase.ts` (desviación del programa de diseño). Hay que regenerar los tipos con `npx supabase gen types typescript --linked` para reemplazar lo escrito a mano.
- Los cambios de UI de post-validación (11 puntos en `pre-human-review.md`) son ajustes de presentación y un bug de comportamiento; no cambian la API ni las RPC.
