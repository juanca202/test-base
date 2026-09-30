<a id="md-01"></a>

# MD-01: Sesión y credenciales

DTOs del intercambio de login, más el estado de sesión que el frontend mantiene. **Estado de validación: Confirmado** (OpenAPI `login_request` / `csrf_token`, e implementado en `frontend/src/app/features/auth/`).

**`login_request`** — cuerpo de [API-01](../apis/API-015-autenticacion.md#post-bpm-system-login):

| Campo              | Tipo               | Requerido | Descripción                                                             | Validaciones / restricciones                                                            |
| ------------------ | ------------------ | --------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| refresh_groups     | boolean            | **Sí**    | Refresca la pertenencia a grupos del usuario en la base de datos de BAW | Único campo obligatorio; el portal envía `false`                                        |
| requested_lifetime | integer (segundos) | No        | Vida solicitada del token                                               | Entero positivo. **Por defecto 7200 y máximo 7200** (2 h): la sesión no puede durar más |

**`csrf_token`** — respuesta 201 de [API-01](../apis/API-015-autenticacion.md#post-bpm-system-login):

| Campo      | Tipo    | Requerido | Descripción                                                                                   | Validaciones / restricciones                                                                                                 |
| ---------- | ------- | --------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| csrf_token | string  | Sí        | Token anti-CSRF; obligatorio en la cabecera `BPMCSRFToken` de las nueve operaciones restantes | Opaco; no se parsea                                                                                                          |
| expiration | integer | Sí        | Expiración del token                                                                          | OpenAPI lo declara `integer` **sin unidad ni formato**; queda por confirmar en ejecución si es epoch (ms o s) o una duración |

**`SessionState`** — estado en el frontend:

| Campo     | Tipo                | Requerido | Descripción                             | Validaciones / restricciones                                      |
| --------- | ------------------- | --------- | --------------------------------------- | ----------------------------------------------------------------- |
| username  | string              | Sí        | Usuario autenticado, para el encabezado | Se captura del formulario; BAW **no** lo devuelve en `csrf_token` |
| csrfToken | string              | Sí        | Copia de `csrf_token`                   | Almacenamiento efímero del navegador; nunca un backend propio     |
| expiresAt | datetime (ISO 8601) | No        | Derivado de `expiration`                | Informativo                                                       |

**Relaciones:** Ninguna.

> **La credencial de sesión real es la cookie LTPA que BAW emite en el login**, gestionada por el navegador y enviada con `withCredentials: true`. El `csrf_token` **no** es la credencial de autenticación: es la defensa anti-CSRF que la acompaña. Detalle en [FL-01](../flows/FL-01-autenticacion-ciclo-vida-sesion.md).
>
> **El techo de 7200 s es un requisito de producto, no un detalle.** La sesión caduca como muy tarde a las 2 horas, así que [FL-02](../flows/FL-02-expiracion-sesion-durante-uso.md) (expiración en pleno uso, con pérdida de cambios no guardados) no es un caso de borde: es el comportamiento esperable de cualquier jornada de trabajo.
