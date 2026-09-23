# TC-002 — Dado un usuario sin sesión activa, Cuando abre directamente la URL de un módulo protegido del portal, Entonces el sistema lo redirige a la pantalla de login sin mostrar el módulo

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Reglas de negocio) — Autenticación requerida para acceder a cualquier módulo
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El portal está desplegado y apunta al ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El navegador no tiene credenciales del portal en almacenamiento efímero (sin `csrf_token` ni `username`).
- El usuario nunca inició sesión en esta pestaña, o cerró el navegador previamente.

## Datos de prueba

| Campo                   | Valor                     | Notas                              |
| ----------------------- | ------------------------- | ---------------------------------- |
| URL de módulo protegido | `/mis-tareas` [propuesto] | Ruta de un módulo que exige sesión |
| URL de login            | `/login` [propuesto]      | Ruta pública de autenticación      |

## Pasos de ejecución

| #   | Actor   | Acción                                                                                      | Resultado esperado del paso                                             |
| --- | ------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Usuario | Verifica que el almacenamiento efímero del navegador no contiene `csrf_token` ni `username` | El navegador no tiene credenciales del portal                           |
| 2   | Usuario | Escribe en la barra de direcciones la URL del módulo protegido y la abre                    | El navegador solicita la ruta del módulo protegido                      |
| 3   | Sistema | Evalúa la sesión antes de renderizar el módulo                                              | El sistema determina que no hay sesión y aborta la navegación al módulo |
| 4   | Sistema | Redirige al usuario                                                                         | El navegador queda en la pantalla de login                              |

## Resultado esperado final

El usuario ve la pantalla de login; la URL del navegador corresponde al login y no al módulo solicitado. No se renderiza ningún dato del módulo protegido (ni siquiera parcialmente) y no se emite ninguna petición autenticada a BAW.

## Observaciones

Complementa a [TC-001](./TC-001-login-credenciales-validas-happy.md), que cubre el flujo exitoso del mismo criterio. La verificación de que no se filtra contenido del módulo debe hacerse también sobre el HTML renderizado, no solo sobre lo visible.
