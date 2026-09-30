# API-015: Autenticación y sesión

Grupo de operaciones de la capability [portal-procesos-baw](../README.md). Los identificadores `API-01`…`API-14` de los encabezados son los de la estructura anterior (archivo único), conservados porque el texto los cita.

| Operación              | Método y ruta            | Ancla                                                |
| ---------------------- | ------------------------ | ---------------------------------------------------- |
| API-01: Iniciar sesión | `POST /bpm/system/login` | [#post-bpm-system-login](#post-bpm-system-login)     |
| API-02: Cerrar sesión  | **No existe**            | [#no-existe-cerrar-sesion](#no-existe-cerrar-sesion) |

<a id="post-bpm-system-login"></a>
<a id="api-01"></a>

## API-01: Iniciar sesión

- **Método y ruta:** `POST /bpm/system/login` — `operationId: createBPMCSRFToken`
- **Autenticación:** `Authorization: Basic base64(usuario:contraseña)`. Es la **única** operación sin `BPMCSRFToken`.
- **Descripción:** Obtiene el token anti-CSRF y establece la cookie de sesión (FR-010, NFR-001).
- **Estado de validación: Confirmado** (OpenAPI + implementado en `AuthService.login`).

**Request**

| Parámetro     | Ubicación | Tipo                                                              | Requerido | Descripción                                 |
| ------------- | --------- | ----------------------------------------------------------------- | --------- | ------------------------------------------- |
| Authorization | header    | string                                                            | Sí        | `Basic` con las credenciales del formulario |
| login_request | body      | `login_request` ([MD-01](../models/MD-01-sesion-credenciales.md)) | **Sí**    | Cuerpo obligatorio                          |

```json
{ "refresh_groups": false }
```

**Responses**

| Código  | Condición                 | Cuerpo                                                                                                                    |
| ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **201** | Autenticación correcta    | `csrf_token` ([MD-01](../models/MD-01-sesion-credenciales.md)) + `Set-Cookie` de sesión                                   |
| 400     | Cuerpo inválido o ausente | `exception` ([MD-11](../models/MD-11-error-api-baw.md))                                                                   |
| 401     | Credenciales inválidas    | Rechazo del contenedor de seguridad (`realm="BPMRESTAPI"`), **antes** de la aplicación: puede no traer cuerpo `exception` |
| 500     | Error interno             | `exception`                                                                                                               |

> El éxito es **201**, no 200. La respuesta **no incluye datos del usuario**: el portal conserva el `username` del formulario ([MD-01](../models/MD-01-sesion-credenciales.md)).

<a id="no-existe-cerrar-sesion"></a>
<a id="api-02"></a>

## API-02: Cerrar sesión

- **Método y ruta:** **No existe.**
- **Estado de validación: Confirmado (ausente)** — la definición OpenAPI declara una sola operación bajo `System`, que es el login.
- **Descripción:** FR-011 (cerrar sesión desde cualquier módulo) se resuelve **enteramente en el cliente**.

**Comportamiento del portal al cerrar sesión:**

1. Descartar el `csrf_token` y el `username` del almacenamiento efímero.
2. Navegar a `/signin`; `authGuard` bloquea desde ese momento cualquier módulo protegido.
3. No se invoca ningún endpoint de BAW.

> **La cookie de sesión sobrevive al cierre de sesión del portal**, y es una diferencia de seguridad que conviene tener explícita: sin token CSRF el portal ya no puede operar contra BAW —toda operación responde 403 ([MD-11](../models/MD-11-error-api-baw.md))—, pero la sesión sigue viva en el servidor hasta que caduque (máximo 7200 s, ver [MD-01](../models/MD-01-sesion-credenciales.md)) o el navegador descarte la cookie.
>
> Mitigación posible dentro del alcance del frontend: emitir la cookie como de sesión de navegador, de modo que se descarte al cerrarlo. **No sustituye a un logout real en el servidor**, que esta API no ofrece. Si el cierre de sesión efectivo en servidor fuera un requisito de seguridad, hay que buscarlo en la familia clásica o asumir la limitación — decisión pendiente con el usuario.
