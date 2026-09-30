<a id="md-11"></a>

# MD-11: Error de la API de BAW

Forma del error que el frontend normaliza. **Estado de validación: Confirmado** para la familia `/bpm/` (OpenAPI `exception`, y verificado en vivo); **Por confirmar** para la familia WLE.

**`exception`** — cuerpo de **todas** las respuestas de error de la API:

| Campo                    | Tipo        | Requerido | Descripción                         | Validaciones / restricciones                                                                                                                        |
| ------------------------ | ----------- | --------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| error_number             | string      | **Sí**    | Identificador del mensaje           | P. ej. `CWTBG0651E`                                                                                                                                 |
| error_message            | string      | **Sí**    | Texto del mensaje                   | **Localizado por BAW**: responde en el idioma negociado (`Content-Language: es-EC` en el ambiente de referencia), así que es presentable al usuario |
| error_message_parameters | string[]    | No        | Parámetros insertados en el mensaje | —                                                                                                                                                   |
| error_cause              | `exception` | No        | Causa encadenada                    | **Recursivo**                                                                                                                                       |

**Campo derivado en el cliente:** `isSessionExpired` — dispara [FL-02](../flows/FL-02-expiracion-sesion-durante-uso.md). Regla: `httpStatus === 403 && error_number === 'CWTBG0651E'` (token CSRF no verificable), o `httpStatus === 401`.

**Relaciones:** Ninguna.

> **Verificado en vivo:** un `GET /bpm/user-tasks` con credenciales válidas pero sin cabecera `BPMCSRFToken` devuelve **403** con `error_number: CWTBG0651E` y el mensaje «La solicitud se ha bloqueado porque no se ha podido verificar la cabecera de señal BPMCSRFToken». Esto resuelve la ambigüedad que este modelo tenía abierta: **el token caducado o ausente se manifiesta como 403, no como 401**, y por tanto la regla de `isSessionExpired` debe contemplar ambos códigos.
>
> `error_message` llega localizado, así que puede mostrarse tal cual. Conviene igualmente un mensaje propio de respaldo por si el texto de BAW resulta demasiado técnico.
>
> **Los errores de WLE también llevan `error_number`, pero la regla de sesión expirada sigue sin verificar.** La respuesta de éxito de [API-13](../apis/API-017-tareas.md#put-rest-bpm-wle-tasks) usa un sobre propio (`{ status, data }`) que no se parece al contrato de `/bpm/`, así que la forma de sus errores no era deducible. Un **400 provocado en vivo** contra `/rest/bpm/wle/v1/tasks` (enviando `offset` en el cuerpo) devolvió `error_number: CWTBG0618E` con su `error_message` descriptivo: **la familia WLE comparte la numeración `CWTBG…` y, al menos en el 400, la estructura de este modelo**. Es evidencia parcial a favor de que el normalizador de errores sirva para las dos familias.
>
> **Lo que sigue abierto es justo lo que `isSessionExpired` necesita:** no se ha provocado ningún **401 ni 403** contra WLE. La regla discrimina hoy por `error_number === 'CWTBG0651E'`, que es el código del control `BPMCSRFToken`; WLE usa otro mecanismo CSRF (`x-xsrf-token`) y **no hay motivo para suponer que falle con el mismo código**. Mientras no se capture, una sesión caída durante el listado podría no reconocerse y [FL-02](../flows/FL-02-expiracion-sesion-durante-uso.md) no dispararse. Ver [Observaciones](../README.md#observaciones), punto 18.
