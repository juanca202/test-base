# WI-003: La navegación en el rango de tablet no se colapsa a iconos

<!-- wi:status=Draft -->

**Estado:** Draft
**Tipo:** bug-fix
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Entre 768px y 1279px de ancho la navegación principal se muestra igual que en escritorio, con las etiquetas de texto visibles, en lugar de colapsada a iconos.

- **Esperado (TC-012, pasos 2-4 y 6):** la navegación aparece colapsada a iconos con todos los destinos accesibles, se expande al interactuar mostrando sus etiquetas y vuelve a colapsarse tras navegar.
- **Observado:** en 768, 1024 y 1279px la navegación muestra las etiquetas «Mis tareas», «Procesos» y «Rendimiento»; no hay estado colapsado ni control de expansión. No hay desborde horizontal.
- **Reproducción:** iniciar sesión, fijar el ancho del viewport en 768, 1024 o 1279px y abrir `/tasks`.

## Referencias

- **Historia de usuario:** [US-001: Autenticación y acceso al portal](../../user-stories/US-001-autenticacion-acceso-portal/README.md)
- **Caso de prueba:** [TC-012](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/TC-012-layout-tablet-navegacion-colapsada-happy.md)
- **Hallazgo registrado en:** [automation.md](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/automation.md)
- **Prueba en `test.fixme`:** `tests/e2e/us-001/tc-012-layout-tablet.e2e.spec.ts` — prueba `TC-012: should collapse the navigation to icons…` (`test.fixme`) (ruta desde la raíz del repositorio)

## Observaciones

- La causa no está analizada y la ficha no tiene criterios de aceptación ni plan de implementación; completarla antes de pasar a `Ready`.
- El caso de prueba pudo redactarse para un diseño anterior del portal: confirmar el comportamiento esperado vigente o actualizar el TC con `test-define` antes de tratarlo como defecto.
- El repositorio `frontend` se tomó de US-001; el código de la aplicación no está en este repositorio de pruebas.
- No existe una referencia visual aprobada del layout; las pruebas comprueban solo el comportamiento estructural.
