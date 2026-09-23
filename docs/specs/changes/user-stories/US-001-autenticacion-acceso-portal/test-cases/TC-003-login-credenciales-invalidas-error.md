# TC-003 — Dado un usuario en la pantalla de login, Cuando envía credenciales inválidas, Entonces el sistema muestra un mensaje de error, lo mantiene en el login y no conserva las credenciales

**Perspectiva:** Error
**Tipo de prueba:** Integration, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Reglas de negocio) — Autenticación requerida para acceder a cualquier módulo
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=Integration, E2E · criterion=AC-001 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario no tiene sesión activa en el portal y está en la pantalla de login.
- El ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`) está disponible y responde al login.
- El usuario o la contraseña usados no corresponden a una cuenta válida de ese ambiente.

## Datos de prueba

| Campo               | Valor                             | Notas                                         |
| ------------------- | --------------------------------- | --------------------------------------------- |
| Usuario             | `usuario.prueba` [propuesto]      | Cuenta existente en el ambiente de referencia |
| Contraseña          | `clave-incorrecta` [propuesto]    | Contraseña deliberadamente incorrecta         |
| Usuario inexistente | `usuario.inexistente` [propuesto] | Variante: cuenta que no existe en BAW         |

## Pasos de ejecución

| #   | Actor   | Acción                                                              | Resultado esperado del paso                                                                                                          |
| --- | ------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Usuario | Ingresa el usuario y la contraseña incorrecta y envía el formulario | El sistema invoca `POST /bpm/system/login` con `Authorization: Basic`                                                                |
| 2   | Sistema | Recibe de BAW una respuesta de autenticación fallida (`401`)        | El sistema no guarda `csrf_token` ni `username` en almacenamiento efímero                                                            |
| 3   | Sistema | Presenta el resultado al usuario                                    | Se muestra un mensaje de error de credenciales inválidas, sin exponer detalles técnicos ni el mensaje crudo de BAW                   |
| 4   | Usuario | Observa el formulario tras el error                                 | El usuario permanece en la pantalla de login; el campo de contraseña queda vacío y no se conserva ninguna credencial en el navegador |
| 5   | Usuario | Repite los pasos 1 a 4 con el usuario inexistente                   | El comportamiento es el mismo: mensaje de error equivalente, sin revelar si el usuario existe o no                                   |

## Resultado esperado final

El portal sigue mostrando la pantalla de login con un mensaje de error visible; el almacenamiento efímero del navegador no contiene `csrf_token` ni `username`, la sesión no se marca como iniciada y ningún módulo protegido es accesible. El mensaje es idéntico para contraseña incorrecta y para usuario inexistente, para no filtrar la existencia de cuentas.

## Observaciones

El error de credenciales se distingue del error de conexión con BAW, cubierto por [TC-009](./TC-009-baw-inaccesible-en-login-error.md). El formulario debe permitir reintentar de inmediato sin recargar la página.
