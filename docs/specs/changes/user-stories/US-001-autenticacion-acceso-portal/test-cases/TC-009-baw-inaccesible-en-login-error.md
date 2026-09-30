# TC-009 — Dado que BAW está inaccesible, Cuando el usuario intenta iniciar sesión, Entonces el sistema muestra un mensaje claro de indisponibilidad con opción de reintentar y no marca la sesión como iniciada

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-005 (Fiabilidad) — Mensaje claro y reintento ante error de conexión o autenticación con BAW
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-005 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está en la pantalla de login, sin sesión activa.
- El ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`) se puede dejar inaccesible de forma controlada: deteniendo el servicio, bloqueando la red hacia el host, o suplantando la respuesta de `POST /bpm/system/login` con un error de red, un tiempo de espera agotado o un `500`.
- El usuario cuenta con credenciales válidas, para comprobar que el fallo proviene de la indisponibilidad y no de las credenciales.

## Datos de prueba

| Campo              | Valor                                                       | Notas                                                    |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------- |
| Usuario            | `usuario.prueba` [propuesto]                                | Cuenta válida del ambiente de referencia                 |
| Contraseña         | `********` [propuesto]                                      | Contraseña válida asociada al usuario                    |
| Condición de fallo | Error de red / tiempo de espera agotado / `500` [propuesto] | Tres variantes a ejecutar sobre `POST /bpm/system/login` |

## Pasos de ejecución

| #   | Actor       | Acción                                                                      | Resultado esperado del paso                                                                                                  |
| --- | ----------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verificador | Deja BAW inaccesible según la primera variante de la condición de fallo     | `POST /bpm/system/login` no puede completarse con éxito                                                                      |
| 2   | Usuario     | Ingresa credenciales válidas y envía el formulario de login                 | El sistema invoca `POST /bpm/system/login` y no obtiene una respuesta `201`                                                  |
| 3   | Sistema     | Resuelve el fallo de comunicación                                           | Se muestra un mensaje claro de que el servicio de BAW no está disponible, distinguible del mensaje de credenciales inválidas |
| 4   | Sistema     | Ofrece la recuperación al usuario                                           | La pantalla de login permanece operativa y ofrece reintentar sin recargar la página                                          |
| 5   | Verificador | Inspecciona el almacenamiento efímero del navegador                         | No hay `csrf_token` ni `username`; la sesión no figura como iniciada                                                         |
| 6   | Usuario     | Intenta abrir por URL un módulo protegido                                   | El sistema lo devuelve a la pantalla de login                                                                                |
| 7   | Verificador | Restablece BAW y el usuario reintenta el login con las mismas credenciales  | El login se completa con éxito y el usuario accede al módulo inicial                                                         |
| 8   | Verificador | Repite los pasos 1 a 6 con las variantes restantes de la condición de fallo | El comportamiento es equivalente en las tres variantes                                                                       |

## Resultado esperado final

Ante BAW inaccesible, el portal muestra un mensaje de indisponibilidad del servicio —distinto del de credenciales inválidas y sin exponer trazas técnicas—, mantiene la pantalla de login operativa con opción de reintentar y no marca la sesión como iniciada. Restablecido BAW, el mismo usuario inicia sesión con éxito sin pasos adicionales.

## Observaciones

El escenario de credenciales rechazadas por un BAW que sí responde lo cubre [TC-003](./TC-003-login-credenciales-invalidas-error.md). El tiempo de espera antes de dar por fallida la petición es negociable según la historia; si se fija un valor, debe reflejarse aquí como dato de prueba.
