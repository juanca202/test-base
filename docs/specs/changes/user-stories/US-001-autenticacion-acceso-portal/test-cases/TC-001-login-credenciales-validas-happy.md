# TC-001 — Dado un usuario con credenciales válidas de BAW, Cuando envía el formulario de login, Entonces accede al módulo inicial del portal

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Reglas de negocio) — Autenticación requerida para acceder a cualquier módulo
**Artefacto padre:** US-001

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-001 · parent=US-001 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario no tiene sesión activa en el portal.
- El usuario cuenta con credenciales válidas en el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

## Datos de prueba

| Campo      | Valor                        | Notas                                    |
| ---------- | ---------------------------- | ---------------------------------------- |
| Usuario    | `usuario.prueba` [propuesto] | Cuenta válida del ambiente de referencia |
| Contraseña | `********` [propuesto]       | Contraseña válida asociada al usuario    |

## Pasos de ejecución

| #   | Actor   | Acción                                                     | Resultado esperado del paso                                                         |
| --- | ------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | Usuario | Abre el portal sin sesión activa                           | Se muestra la pantalla de login                                                     |
| 2   | Usuario | Ingresa usuario y contraseña válidos y envía el formulario | El sistema invoca `POST /bpm/system/login` con `Authorization: Basic`               |
| 3   | Sistema | Recibe `201` con `csrf_token` y la cookie de sesión de BAW | El sistema guarda `csrf_token` y `username` en almacenamiento efímero del navegador |
| 4   | Sistema | Redirige al usuario                                        | El usuario llega al módulo inicial del portal, autenticado                          |

## Resultado esperado final

El usuario queda autenticado y puede navegar a cualquier módulo del portal; toda petición posterior incluye la cookie de sesión y la cabecera `BPMCSRFToken`.

## Observaciones

Ninguna.
