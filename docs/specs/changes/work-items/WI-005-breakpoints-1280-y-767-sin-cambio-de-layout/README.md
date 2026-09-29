# WI-005: Los bordes de 1280px y 767px no cambian el layout como describe TC-014

<!-- wi:status=Draft -->

**Estado:** Draft
**Tipo:** bug-fix
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Los anchos de borde no producen los layouts distintos que describe TC-014: 1279px y 1280px muestran la misma navegación y a 767px no aparece el layout móvil con hamburguesa. Sí cambia la navegación al cruzar 768px (aparece desde 768px).

- **Esperado (TC-014, pasos 1 y 4-6):** a 767px el layout móvil con icono de hamburguesa; a 1279px la navegación colapsada a iconos; a 1280px la navegación completa con etiquetas.
- **Observado:** a 1279px y 1280px la navegación es idéntica (con etiquetas); a 767px la navegación está oculta y no hay hamburguesa. No hay desborde horizontal en ninguno de los seis anchos.
- **Reproducción:** iniciar sesión, fijar el ancho del viewport en 767, 1279 y 1280px y abrir `/tasks`.

## Referencias

- **Historia de usuario:** [US-001: Autenticación y acceso al portal](../../user-stories/US-001-autenticacion-acceso-portal/README.md)
- **Caso de prueba:** [TC-014](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/TC-014-breakpoints-768-1280-limite.md)
- **Hallazgo registrado en:** [automation.md](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/automation.md)
- **Prueba en `test.fixme`:** `tests/e2e/us-001/tc-014-breakpoints-768-1280.e2e.spec.ts` — prueba `TC-014: should differ in layout at each side of 1280px…` (`test.fixme`) (ruta desde la raíz del repositorio)

## Observaciones

- La causa no está analizada y la ficha no tiene criterios de aceptación ni plan de implementación; completarla antes de pasar a `Ready`.
- El caso de prueba pudo redactarse para un diseño anterior del portal: confirmar el comportamiento esperado vigente o actualizar el TC con `test-define` antes de tratarlo como defecto.
- El repositorio `frontend` se tomó de US-001; el código de la aplicación no está en este repositorio de pruebas.
- No existe una referencia visual aprobada del layout; las pruebas comprueban solo el comportamiento estructural.
