# WI-002: El cierre de sesión no está en un menú lateral, como describe TC-006

<!-- wi:status=Draft -->

**Estado:** Draft
**Tipo:** bug-fix
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

El portal no tiene el menú lateral con el botón de cierre de sesión en su pie que describe TC-006; el cierre de sesión está en el menú de usuario del encabezado.

- **Esperado (TC-006, pasos 1-2):** el pie del menú lateral muestra el botón «Cerrar sesión» con su icono, visible con el menú expandido y colapsado.
- **Observado:** no existe menú lateral. La opción «Cerrar sesión» está en el menú que abre el botón de usuario del encabezado. Los pasos 3-7 del caso (sin llamadas a BAW, credenciales descartadas, redirección al login, retroceso sin mostrar el módulo) se cumplen.
- **Reproducción:** iniciar sesión en cualquier módulo y buscar el control de cierre de sesión: solo aparece en el menú de usuario del encabezado.
- **Nota:** AC-003 de US-001 no fija la ubicación del control.

## Referencias

- **Historia de usuario:** [US-001: Autenticación y acceso al portal](../../user-stories/US-001-autenticacion-acceso-portal/README.md)
- **Caso de prueba:** [TC-006](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/TC-006-cierre-sesion-desde-menu-lateral-happy.md)
- **Hallazgo registrado en:** [automation.md](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/automation.md)
- **Prueba en `test.fixme`:** `tests/e2e/us-001/tc-006-cierre-sesion.e2e.spec.ts` — prueba `TC-006 steps 1-2` (`test.fixme`) (ruta desde la raíz del repositorio)

## Observaciones

- La causa no está analizada y la ficha no tiene criterios de aceptación ni plan de implementación; completarla antes de pasar a `Ready`.
- El caso de prueba pudo redactarse para un diseño anterior del portal: confirmar el comportamiento esperado vigente o actualizar el TC con `test-define` antes de tratarlo como defecto.
- El repositorio `frontend` se tomó de US-001; el código de la aplicación no está en este repositorio de pruebas.
