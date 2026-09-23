# TK-004: Opción de cierre de sesión accesible en el portal

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-001: Autenticación y acceso al portal](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

> **Historial:** esta tarea se llamó originalmente «Acción de cerrar sesión en el encabezado» y proponía trasladar el control a esa ubicación, retirando el que ya existe en el pie del menú lateral. Se marcó `Obsolete` el 2026-09-11 porque el control del menú lateral ya cumplía el propósito. El mismo día se revisó esa decisión: fijar la ubicación (encabezado o menú lateral) no es parte del criterio de aceptación — AC-003 solo exige que la opción exista y sea accesible, sin importar dónde viva en la interfaz. Esta tarea se revive con ese alcance genérico, sin reubicar nada.

## Descripción

Garantizar que el portal ofrezca, en su shell común (`MainLayout`), una opción de cierre de sesión persistente y accesible desde cualquier módulo autenticado — sin fijar su ubicación exacta en la interfaz, que queda a criterio de diseño.

Hoy esa opción ya existe como un control en el pie del menú lateral e invoca `AuthProvider.logout()`; esta tarea no la reubica ni la duplica. Su alcance es confirmar y dejar verificado que ese control (o el que en el futuro lo reemplace, dondequiera que viva) es descubrible en todos los módulos autenticados, incluido el menú colapsado, y que cumple las reglas de accesibilidad del repositorio.

## Dependencias

- [TK-001: Cierre de sesión local del portal](./TK-001-cierre-sesion-local.md) — rutina que descarta las credenciales y navega a `/signin`; este control la invoca.
- `MainLayout` (`shared/components/main-layout/`) — shell que contiene el control de cierre de sesión, hoy en el pie del menú lateral.
- `AuthProvider` (`@factor_ec/utils`) — contrato por el que el control invoca el cierre de sesión; ya inyectado en `MainLayout`.

## Referencias

- **Documentación técnica:** [Cerrar sesión](../../../specs/technical-docs/portal-procesos-baw.md#api-02) · [Autenticación y ciclo de vida de la sesión](../../../specs/technical-docs/portal-procesos-baw.md#fl-01)

## Archivos afectados

```text
frontend/
└── src/app/shared/components/main-layout/
    ├── main-layout.html         # sin cambios de ubicación; se revisa el marcado de accesibilidad del control existente
    ├── main-layout.ts           # sin cambios de ubicación; se confirma la invocación a AuthProvider.logout()
    └── ~ main-layout.spec.ts    # cubre: el control existe en todo módulo autenticado, con menú expandido y colapsado, y cumple accesibilidad
```

## Plan de implementación

- [x] **IT-01** — Confirmar que el control de cierre de sesión está disponible en todos los módulos autenticados
      El control vive en `MainLayout`, shell común de los módulos autenticados, así que su disponibilidad transversal se verifica una sola vez a ese nivel, con el menú tanto expandido como colapsado.
- [x] **IT-02** — Confirmar que el control invoca la rutina de cierre de sesión de TK-001
      Sin reubicarlo: solo se verifica que dispara `AuthProvider.logout()` y que, una vez implementado TK-001, el resultado descarta las credenciales y navega a `/signin` sin invocar ningún endpoint de BAW (API-02 confirma que esta API no expone cierre de sesión en servidor).
- [x] **IT-03** — Cubrir el control con las reglas de accesibilidad del repositorio
      Rol y nombre accesible del control, foco visible y contraste conforme a los mínimos WCAG AA declarados en `AGENTS.md` del repositorio `frontend`.

## Observaciones

- Esta tarea no reubica el control ni lo duplica: si en el futuro el diseño decide moverlo (p. ej. al encabezado), es una decisión de UI distinta, sin impacto en AC-003 mientras la opción siga existiendo y siendo accesible.
- El destino `/profile` del elemento de usuario del encabezado (una ruta no declarada en el enrutado, detectada al evaluar la propuesta original de esta tarea) es un asunto no relacionado con el cierre de sesión; queda **fuera del alcance** de esta tarea y se gestiona por separado.
