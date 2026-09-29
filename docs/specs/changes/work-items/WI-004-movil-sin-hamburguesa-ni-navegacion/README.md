# WI-004: En móvil no hay icono de hamburguesa ni navegación visible

<!-- wi:status=Draft -->

**Estado:** Draft
**Tipo:** bug-fix
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Por debajo de 768px de ancho la navegación principal desaparece y no existe un icono de hamburguesa para acceder a ella, por lo que no hay forma visible de cambiar de módulo.

- **Esperado (TC-013, pasos 2-5 y 7):** un icono de hamburguesa en el encabezado abre un panel de navegación superpuesto con todos los destinos y sus etiquetas; el panel permite navegar y cerrarse sin perder estado.
- **Observado:** en 360 y 767px el encabezado solo muestra el logotipo y el botón de usuario; la barra de navegación está oculta y no hay control de hamburguesa. No hay desborde horizontal.
- **Reproducción:** iniciar sesión, fijar el ancho del viewport en 360 o 767px y abrir `/tasks`.

## Referencias

- **Historia de usuario:** [US-001: Autenticación y acceso al portal](../../user-stories/US-001-autenticacion-acceso-portal/README.md)
- **Caso de prueba:** [TC-013](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/TC-013-layout-movil-menu-hamburguesa-happy.md)
- **Hallazgo registrado en:** [automation.md](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/automation.md)
- **Prueba en `test.fixme`:** `tests/e2e/us-001/tc-013-layout-movil.e2e.spec.ts` — prueba `TC-013: should offer the navigation behind a hamburger icon…` (`test.fixme`) (ruta desde la raíz del repositorio)

## Observaciones

- La causa no está analizada y la ficha no tiene criterios de aceptación ni plan de implementación; completarla antes de pasar a `Ready`.
- El caso de prueba pudo redactarse para un diseño anterior del portal: confirmar el comportamiento esperado vigente o actualizar el TC con `test-define` antes de tratarlo como defecto.
- El repositorio `frontend` se tomó de US-001; el código de la aplicación no está en este repositorio de pruebas.
- No existe una referencia visual aprobada del layout; las pruebas comprueban solo el comportamiento estructural.
