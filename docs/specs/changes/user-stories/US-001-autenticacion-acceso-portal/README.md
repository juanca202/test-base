# US-001: Autenticación y acceso al portal

<!-- us:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-11
**Repositorios:** frontend
**INVEST:** 🟢 5 · 🟡 1 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../requirements/SRS-001-portal-procesos-baw/README.md)

## Descripción

**COMO** usuario interno autenticado
**QUIERO** iniciar sesión de forma segura contra BAW y poder cerrarla cuando termine
**PARA** acceder al portal sin comprometer la información de los procesos que gestiono

## Contexto

La autenticación se realiza directamente contra el endpoint de login de BAW (`POST /bpm/system/login`); no hay backend propio que intermedie. BAW no expone un endpoint de cierre de sesión en servidor: el cierre de sesión (AC-003) se resuelve enteramente en el cliente, descartando las credenciales locales. El control que lo dispara vive en el pie del menú lateral del shell `MainLayout`, que acompaña a todos los módulos autenticados y nunca se oculta —solo se colapsa a modo icono—, de modo que la acción está siempre a mano sin abandonar la vista en curso. La sesión de BAW en servidor permanece activa hasta su expiración natural (máximo 2 horas) o hasta que el navegador descarte la cookie — es una limitación aceptada del contrato de BAW, no un defecto del portal.

En desarrollo, las llamadas a BAW pasan por el proxy propio del frontend (`proxy.conf.js`). En producción, sin ese proxy, BAW deberá emitir cabeceras CORS y una cookie de sesión `SameSite=None; Secure` para el origen del portal; es un riesgo ya registrado en el SRS de origen (ver Referencias) a confirmar con el equipo de infraestructura de BAW antes de desplegar, y no condiciona el desarrollo de esta historia.

## Criterios de aceptación

- **AC-001 (Reglas de negocio):** El sistema DEBE requerir que el usuario esté autenticado contra BAW mediante `POST /bpm/system/login` para acceder a cualquier módulo del portal.
  Casos de prueba: [TC-001](./test-cases/TC-001-login-credenciales-validas-happy.md) · [TC-002](./test-cases/TC-002-acceso-sin-sesion-redirige-login-error.md) · [TC-003](./test-cases/TC-003-login-credenciales-invalidas-error.md)
- **AC-002 (Seguridad):** El sistema DEBE comunicarse con la API de BAW exclusivamente sobre HTTPS/TLS, incluyendo el token anti-CSRF (`BPMCSRFToken`) en toda petición posterior al login.
  Casos de prueba: [TC-004](./test-cases/TC-004-peticion-autenticada-https-csrf-happy.md) · [TC-005](./test-cases/TC-005-peticion-sin-csrf-token-rechazada-error.md)
- **AC-003 (Interacción de usuario):** El sistema DEBE permitir al usuario finalizar su sesión desde un control persistente, accesible en cualquier módulo autenticado (sin fijar su ubicación exacta en la interfaz); al hacerlo, DEBE descartar las credenciales locales y redirigir a la pantalla de login sin invocar ningún endpoint de BAW.
  Casos de prueba: [TC-006](./test-cases/TC-006-cierre-sesion-desde-menu-lateral-happy.md)
- **AC-004 (Seguridad):** El sistema NO DEBE permitir el acceso a un módulo protegido con una sesión inválida o expirada; DEBE redirigir al login en ese caso. Los cambios no guardados de un formulario en curso se pierden.
  Casos de prueba: [TC-007](./test-cases/TC-007-sesion-expira-durante-formulario-error.md) · [TC-008](./test-cases/TC-008-acceso-directo-url-sesion-invalida-error.md)
- **AC-005 (Fiabilidad):** Ante un error de conexión o de autenticación contra BAW, el sistema DEBE mostrar un mensaje claro y permitir reintentar, sin marcar la sesión como iniciada.
  Casos de prueba: [TC-009](./test-cases/TC-009-baw-inaccesible-en-login-error.md)
- **AC-007 (Usabilidad):** El sistema DEBE adaptar su diseño a tres rangos de ancho de pantalla — escritorio (≥1280px), tablet (768–1279px) y móvil (<768px) —, con navegación adaptada (p. ej. menú colapsable) en el rango móvil.
  Casos de prueba: [TC-011](./test-cases/TC-011-layout-escritorio-navegacion-completa-happy.md) · [TC-012](./test-cases/TC-012-layout-tablet-navegacion-colapsada-happy.md) · [TC-013](./test-cases/TC-013-layout-movil-menu-hamburguesa-happy.md) · [TC-014](./test-cases/TC-014-breakpoints-768-1280-limite.md)

## Referencias

- **Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../requirements/SRS-001-portal-procesos-baw/README.md)
- **Diseño / prototipo:** [Wireframe de Login](../../requirements/SRS-001-portal-procesos-baw/assets/wireframes/login.md)
- **Documentación técnica:** [Sesión y credenciales](../../../../architecture/portal-procesos-baw/models/MD-01-sesion-credenciales.md) · [Error de la API](../../../../architecture/portal-procesos-baw/models/MD-11-error-api-baw.md) · [Iniciar sesión](../../../../architecture/portal-procesos-baw/apis/API-015-autenticacion.md#post-bpm-system-login) · [Cerrar sesión](../../../../architecture/portal-procesos-baw/apis/API-015-autenticacion.md#no-existe-cerrar-sesion) · [Autenticación y ciclo de vida de la sesión](../../../../architecture/portal-procesos-baw/flows/FL-01-autenticacion-ciclo-vida-sesion.md) · [Expiración de sesión durante el uso](../../../../architecture/portal-procesos-baw/flows/FL-02-expiracion-sesion-durante-uso.md)

## Observaciones

- **2026-09-11 — AC-003 generalizado, sin ubicación fija.** Primero se había realineado AC-003 para describir el control existente en el pie del menú lateral, descartando [TK-004](./TK-004-opcion-cierre-sesion-accesible.md) (que proponía trasladarlo al encabezado). Se revisó esa decisión: AC-003 ya no fija ninguna ubicación de interfaz — solo exige que exista una opción de cierre de sesión persistente y accesible desde cualquier módulo autenticado. [TK-004](./TK-004-opcion-cierre-sesion-accesible.md) se revivió en `Ready` con ese alcance genérico (existencia, disponibilidad transversal y accesibilidad del control, sin reubicarlo); [TK-001](./TK-001-cierre-sesion-local.md) sigue cubriendo la rutina de cierre en sí. Hoy la opción existe en el pie del menú lateral e invoca `AuthProvider.logout()`; su caso de prueba es [TC-006](./test-cases/TC-006-cierre-sesion-desde-menu-lateral-happy.md), que verifica esa implementación concreta.
- **AC-003 depende de TK-001 y de TK-004.** El control del pie del menú lateral ya existe e invoca `AuthProvider.logout()`, pero el descarte de credenciales y la redirección al login que exige AC-003 aún no ocurren: dependen de [TK-001: Cierre de sesión local del portal](./TK-001-cierre-sesion-local.md), que sigue en `Ready` y sin implementar. [TK-004](./TK-004-opcion-cierre-sesion-accesible.md) queda en `Ready` para confirmar la disponibilidad transversal y la accesibilidad del control.
- **Divergencia pendiente con el SRS de origen.** SRS-001 describe FR-011 como «un elemento persistente del encabezado» (nota de diseño y criterio de verificación de FR-011); AC-003 ya no fija esa ni ninguna otra ubicación, y la implementación actual usa el pie del menú lateral, no el encabezado. La corrección del SRS queda **fuera del alcance** de este ajuste, por ser un artefacto de requisitos con línea base propia: requiere pasar por `requirement-refine`.
- **La compatibilidad entre navegadores no forma parte del alcance.** La historia no fija ningún criterio sobre el conjunto de navegadores soportados; el requisito equivalente tampoco existe en SRS-001, de modo que no queda cobertura pendiente por este concepto.

---

## Validación

### Complejidad sugerida

- **Story points:** 5
- **Justificación:** integra autenticación real contra un sistema externo sin backend propio que absorba complejidad, maneja expiración de sesión y reintentos, y establece el layout responsivo transversal (3 breakpoints) que heredan las otras 6 historias.

### INVEST

| Letra | Criterio      | Resultado | Notas                                                                                                                                                                                     |
| ----- | ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I** | Independiente | Cumple    | No depende de ninguna otra historia de esta tanda; es la base.                                                                                                                            |
| **N** | Negociable    | Cumple    | El detalle de mensajes de error y tiempos de reintento es negociable.                                                                                                                     |
| **V** | Valiosa       | Cumple    | Protege el acceso a toda la información de procesos.                                                                                                                                      |
| **E** | Estimable     | Cumple    | Contrato de API confirmado en vivo (ver documentación técnica).                                                                                                                           |
| **S** | Pequeña       | Parcial   | Agrupa autenticación, cierre de sesión y el layout responsivo transversal; se mantiene unida por ser la infraestructura base que heredan las otras 6 historias, no por falta de análisis. |
| **T** | Testeable     | Cumple    | AC-001 a AC-005 y AC-007 son verificables, cada uno con al menos un caso de prueba documentado.                                                                                           |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado | Notas                                                                  |
| ---------------------------------- | ------ | ---------------------------------------------------------------------- |
| Dependencias listas                | Cumple | Ninguna; es la base de las demás historias.                            |
| Inputs/outputs claros              | Cumple | Contrato de login/CSRF confirmado en vivo (ver documentación técnica). |
| Repositorios definidos             | Cumple | `frontend`.                                                            |
| Sin decisiones técnicas pendientes | Cumple | Cierre de sesión y layout responsivo resueltos (ver Contexto).         |
| Referencias de UI                  | Cumple | Wireframe de Login aprobado.                                           |
| Sin aclaraciones pendientes        | Cumple | Observaciones sin pendientes.                                          |
