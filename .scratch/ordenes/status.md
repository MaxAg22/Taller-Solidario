# Órdenes

## Stage

Implementación: implementado, validado, revisado agénticamente y revisado por el usuario. Las 16 filas de la matriz manual V1–V16 pasan. Los 4 skips de la revisión agéntica se resolvieron en la revisión humana (commiteados individualmente). Los tipos de RPC se regeneraron desde el proyecto remoto. «Agregar equipo» fuera de Edición se resolvió como decisión tomada: mantener el flujo actual (solo disponible dentro de Edición). Siguiente etapa: merge a main.

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
- `agentic-review.md` — reporte de la revisión agéntica (4 facetas, 3 rondas) con fixes y skips.
- `testing.md` — testing de Órdenes: paso 1 unit (hecho, 38 tests), paso 2 integración (propuesto), paso 3 E2E (pendiente).
- `prototypes/` — prototipos interactivos de la rama de interfaz.
- `prototypes/orders.html` — prototipo de la alternativa A para la tabla de órdenes, detalle, asociación e indicador en Inventario.
- `prototypes/InterVariable.woff2` — copia local de la tipografía de la aplicación para el prototipo.

## Tracking

- Revisión humana completada: los 4 skips de la agentic review se resolvieron (commits individuales), los tipos de RPC se regeneraron, y «Agregar equipo» fuera de Edición se resolvió como mantener el flujo actual.
