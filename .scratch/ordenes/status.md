# Órdenes

## Stage

Implementación: el árbol de tareas y la matriz de validación manual están asentados; la implementación arranca sobre la rama `feature/ordenes`.

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
- `prototypes/` — prototipos interactivos de la rama de interfaz.
- `prototypes/orders.html` — prototipo de la alternativa A para la tabla de órdenes, detalle, asociación e indicador en Inventario.
- `prototypes/InterVariable.woff2` — copia local de la tipografía de la aplicación para el prototipo.

## Tracking

- La migración de las dos RPC no se aplica al proyecto remoto enlazado; queda solo el archivo `.sql`. Las filas V4, V7, V8, V9 y V12 quedan bloqueadas por esa causa.
- Las firmas de las dos RPC se declaran a mano en los tipos generados, como desviación del programa de diseño.
