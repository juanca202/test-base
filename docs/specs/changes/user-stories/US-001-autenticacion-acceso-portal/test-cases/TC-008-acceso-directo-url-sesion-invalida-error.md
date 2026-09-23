# TC-008 — Dado un usuario cuya sesión ya no es válida, Cuando abre directamente por URL un módulo protegido, Entonces el sistema lo redirige al login sin exponer el contenido del módulo

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-004 (Seguridad) — Sin acceso con sesión inválida o expirada; se pierden los cambios no guardados
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-004 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario inició sesión previamente en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- La sesión se invalidó después: el `csrf_token` conservado ya no es verificable por BAW, o la cookie de sesión caducó.
- El navegador conserva la URL del módulo protegido en su historial o el usuario la introduce manualmente.

## Datos de prueba

| Campo                     | Valor                                          | Notas                                                           |
| ------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| URL de módulo protegido   | `/mis-tareas` [propuesto]                      | Ruta que exige sesión válida                                    |
| `csrf_token` inválido     | `tok-csrf-caducado` [propuesto]                | Token presente en almacenamiento efímero pero ya no verificable |
| Respuesta esperada de BAW | `403` + `error_number: CWTBG0651E` [propuesto] | También aplica `401`; ambos se tratan como sesión inválida      |

## Pasos de ejecución

| #   | Actor       | Acción                                                                   | Resultado esperado del paso                                                  |
| --- | ----------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 1   | Verificador | Deja en el almacenamiento efímero un `csrf_token` que BAW ya no reconoce | El portal aparenta tener sesión, pero la credencial no es válida contra BAW  |
| 2   | Usuario     | Abre directamente por URL el módulo protegido                            | El navegador solicita la ruta del módulo                                     |
| 3   | Sistema     | Emite la primera petición autenticada a BAW para poblar el módulo        | BAW responde `403` con `error_number: CWTBG0651E` (o `401`)                  |
| 4   | Sistema     | Clasifica la respuesta como sesión inválida                              | El sistema descarta las credenciales locales del almacenamiento efímero      |
| 5   | Sistema     | Redirige al usuario                                                      | El navegador queda en la pantalla de login                                   |
| 6   | Verificador | Inspecciona la interfaz y el HTML renderizado durante la transición      | No se muestra ni queda en el DOM ningún dato de negocio del módulo protegido |

## Resultado esperado final

El usuario termina en la pantalla de login y el almacenamiento efímero queda sin `csrf_token` ni `username`. En ningún momento se renderizan datos del módulo protegido, ni siquiera de forma transitoria antes de la redirección.

## Observaciones

Se diferencia de [TC-002](./TC-002-acceso-sin-sesion-redirige-login-error.md), donde no hay credencial alguna: aquí existe una credencial que el portal cree válida, y el rechazo lo determina la respuesta de BAW. La manifestación de esa respuesta está verificada en [TC-005](./TC-005-peticion-sin-csrf-token-rechazada-error.md).
