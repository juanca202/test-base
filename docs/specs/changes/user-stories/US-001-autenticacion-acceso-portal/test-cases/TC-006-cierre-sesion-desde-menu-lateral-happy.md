# TC-006 — Dado un usuario autenticado situado en cualquier módulo del portal, Cuando cierra sesión desde el control del pie del menú lateral, Entonces el sistema descarta las credenciales locales y lo redirige al login sin invocar ningún endpoint de BAW

**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-003 (Interacción de usuario) — Opción de cierre de sesión accesible desde cualquier módulo, resuelta en el cliente
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11
**Última actualización:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El almacenamiento efímero del navegador contiene `csrf_token` y `username`.
- El usuario está navegando un módulo autenticado distinto del inicial, para comprobar que el control del pie del menú lateral es persistente.
- El menú lateral se muestra expandido al iniciar el caso; el paso 2 lo colapsa para verificar que el control sigue disponible en ese estado.
- La rutina de cierre de sesión local está implementada ([TK-001](../TK-001-cierre-sesion-local.md)): sin ella el control dispara `AuthProvider.logout()`, que hoy no descarta las credenciales ni navega a `/signin`, y los pasos 5 y 6 fallan.

## Datos de prueba

| Campo                       | Valor                                                                                             | Notas                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Usuario                     | `usuario.prueba` [propuesto]                                                                      | Cuenta válida del ambiente de referencia                                                 |
| Módulo de partida           | `/mis-tareas` [propuesto]                                                                         | Cualquier módulo autenticado distinto del inicial                                        |
| Control de cierre de sesión | Botón del pie del menú lateral (`.sidebar__logout`), con icono `sign-out` y texto «Cerrar sesión» | Forma parte del shell `MainLayout`, por lo que está en todos los módulos autenticados    |
| Estado del menú lateral     | Expandido y colapsado (`.sidebar--collapsed`)                                                     | Al colapsar, el botón se mantiene visible centrado y solo se oculta su etiqueta de texto |

## Pasos de ejecución

| #   | Actor       | Acción                                                                    | Resultado esperado del paso                                                                                                              |
| --- | ----------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Usuario     | Navega desde el módulo inicial a otro módulo autenticado                  | El pie del menú lateral sigue mostrando el botón de cierre de sesión, con su icono `sign-out` y el texto «Cerrar sesión»                 |
| 2   | Usuario     | Colapsa el menú lateral con el control de plegado del encabezado del menú | El botón de cierre de sesión sigue visible y accionable en el pie, ahora centrado y solo con su icono: la etiqueta de texto queda oculta |
| 3   | Verificador | Comienza a registrar el tráfico de red hacia BAW                          | El registro de peticiones queda activo antes del cierre de sesión                                                                        |
| 4   | Usuario     | Activa el botón de cierre de sesión del pie del menú lateral              | El portal ejecuta el cierre de sesión sin emitir ninguna petición a BAW                                                                  |
| 5   | Sistema     | Descarta las credenciales locales                                         | El almacenamiento efímero queda sin `csrf_token` ni `username`                                                                           |
| 6   | Sistema     | Redirige al usuario                                                       | El navegador queda en la pantalla de login                                                                                               |
| 7   | Usuario     | Intenta volver al módulo anterior con el botón de retroceso del navegador | El sistema vuelve a redirigir al login; no se muestra contenido del módulo                                                               |

## Resultado esperado final

El usuario termina en la pantalla de login, el almacenamiento efímero del navegador no conserva `csrf_token` ni `username`, y el registro de red no contiene ninguna llamada a BAW originada por el cierre de sesión. Ningún módulo protegido vuelve a ser accesible sin autenticarse de nuevo.

## Observaciones

- La cookie de sesión de BAW sobrevive al cierre de sesión del portal: BAW no expone un endpoint de logout y la sesión en servidor permanece hasta su expiración natural (máximo 7200 s) o hasta que el navegador descarte la cookie. Es una limitación aceptada del contrato de BAW, no un defecto: el caso NO debe fallar porque la cookie siga presente, sino solo si se conservan `csrf_token` o `username`, o si se emite alguna llamada a BAW.
- **El caso no pasa con el código actual.** El botón del pie del menú lateral ya existe e invoca `AuthProvider.logout()`, pero el descarte de credenciales y la navegación a `/signin` dependen de [TK-001](../TK-001-cierre-sesion-local.md), que sigue en `Ready` y sin implementar. Hasta entonces, los pasos 1 a 4 son verificables y los pasos 5 a 7 fallan por esa dependencia, no por el control.
- Este caso verifica la implementación concreta vigente (control en el pie del menú lateral). AC-003 no fija esa ubicación como requisito: [TK-004](../TK-004-opcion-cierre-sesion-accesible.md) (revivida en `Ready` el 2026-09-11) cubre, de forma genérica, que la opción de cierre de sesión exista, sea descubrible en todos los módulos y cumpla accesibilidad, sin importar dónde viva en la interfaz.
