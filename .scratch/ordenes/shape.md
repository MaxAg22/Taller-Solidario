# Órdenes — alcance resuelto

## Árbol de decisiones

```text
Problema: Crear órdenes de donación que agrupen equipos y permitan gestionar su entrega.

├─ Datos de la orden — resuelta
│  ✓ El destinatario es obligatorio y funciona como título.
│  ✓ La fecha de entrega es obligatoria; equivale a la fecha límite mencionada antes.
│  ✓ La descripción es opcional.
│  ✓ Los datos se pueden editar después de crear la orden, excepto mientras está Donado.
│
├─ Estado y ciclo de vida — resuelta
│  ✓ Una orden nueva empieza en En Preparación.
│  ✓ Por ahora, sus únicos estados son En Preparación y Donado.
│  ✓ Al pasar a Donado, todos sus equipos pasan a Donados.
│  ✓ Puede volver a En Preparación; sus equipos vuelven a Listo para donar.
│  ✓ Al iniciar el regreso, aparece un modal de aviso. Si se cierra, no cambia nada.
│    Confirmar o elegir Cambiar ejecuta el cambio, restablece los equipos a Listo para donar
│    y habilita la edición de la orden.
│  ✓ El estado de un equipo se gestiona desde Inventario; mientras está asociado,
│    Inventario no permite cambiarlo.
│  ✓ Una orden Donado no se puede editar.
│
├─ Equipos asociados — resuelta
│  ✓ Una orden puede crearse sin equipos.
│  ✓ Se pueden agregar y quitar equipos; cada equipo solo puede pertenecer a una orden.
│  ✓ Solo se pueden asociar equipos en estado Listo para donar.
│  ✓ Después de desvincularlo, el equipo puede agregarse a otra orden.
│  ✓ Al desvincular, el modal permite elegir cualquiera de los estados de equipo
│    disponibles en la aplicación.
│  ✓ Una orden Donado no permite agregar ni desvincular equipos.
│
├─ Inventario — resuelta
│  ✓ Indica que el equipo pertenece a una orden y muestra la fecha de entrega.
│  ✓ Permite abrir la orden asociada desde el equipo.
│
├─ Eliminación de órdenes — resuelta
│  ✓ Solo se puede eliminar una orden sin equipos asociados.
│
└─ Fuera de alcance para este shape — resuelta
   ✓ El diseño de tablas, claves foráneas y consultas Supabase queda para la etapa
     de diseño técnico.
```

## Decisiones por pregunta

- Q1: el destinatario funciona como título; se interpretó inicialmente que descripción y fecha eran obligatorias. Q12 corrigió esa lectura.
- Q2: fecha de entrega y fecha límite significan lo mismo; usar fecha de entrega.
- Q3: una orden nueva empieza en En Preparación.
- Q4: los estados disponibles son En Preparación y Donado.
- Q5: se permite volver de Donado a En Preparación; los equipos asociados vuelven a Listo para donar y aparece un modal de aviso.
- Q6: los cambios manuales de estado del equipo se hacen desde Inventario; mientras el equipo está asociado, no se puede cambiar su estado desde allí. Los cambios automáticos definidos por el ciclo de la orden son la excepción.
- Q7: solo se agregan equipos en estado Listo para donar.
- Q8: al desvincular, el modal ofrece cualquiera de los estados de equipo disponibles en la aplicación. Esta respuesta reemplaza la respuesta inicial de que todo equipo desvinculado vuelve siempre a Listo para donar.
- Q9: un equipo desvinculado puede asociarse a otra orden.
- Q10: no se agregan ni desvinculan equipos de una orden Donado. Esta respuesta reemplaza la afirmación anterior de que sí se podía desvincular de una orden Donado.
- Q11: una orden solo se elimina cuando no tiene equipos asociados.
- Q12: el destinatario es obligatorio y funciona como título; la descripción es opcional y la fecha de entrega obligatoria. Esta respuesta corrige la primera lectura de Q1.
- Q13: destinatario, descripción y fecha de entrega se pueden editar después de crear la orden, salvo mientras está Donado.
- Q14: una orden solo recibe equipos Listo para donar; mientras están asociados no se puede editar manualmente su estado en Inventario. La transición de la orden a Donado cambia todos sus equipos a Donados; volverla a En Preparación los restablece a Listo para donar.
- Q15: una orden Donado no se edita; sus equipos no se pueden agregar ni desvincular.
- Q16: cerrar el modal de regreso no cambia nada. Confirmar o elegir Cambiar ejecuta el regreso, restablece los equipos a Listo para donar y habilita la edición de la orden.
- Requisito adicional: desde el equipo en Inventario se puede abrir la orden asociada.
- Fuera de alcance: diseño de la base de datos, claves foráneas y consultas Supabase se deja para la etapa de diseño técnico.
