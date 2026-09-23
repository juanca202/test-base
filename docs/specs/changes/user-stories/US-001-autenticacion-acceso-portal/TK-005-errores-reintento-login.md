# TK-005: Mensajes de error y reintento en el inicio de sesión

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-001: Autenticación y acceso al portal](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Diferenciar en la pantalla de login el fallo de conexión o indisponibilidad de BAW del rechazo de credenciales, y dejar el formulario en condiciones de reintentar en ambos casos sin marcar la sesión como iniciada.

Hoy la pantalla muestra un único texto —«No se pudo iniciar sesión. Verifica tus credenciales.»— tanto si BAW rechazó las credenciales como si nunca llegó a responder, de modo que el usuario recibe una instrucción equivocada cuando el problema es de disponibilidad. El formulario ya permanece operable tras el fallo y no marca sesión iniciada; esa parte se conserva.

## Dependencias

- [TK-002: Expiración de sesión durante el uso y normalización del error de BAW](./TK-002-expiracion-sesion-errores-baw.md) — utilidad de normalización del cuerpo de error que esta pantalla consume.
- Pantalla de login (`features/auth/components/login/`) — componente y plantilla.
- `AuthService.login` (`features/auth/services/auth-service.ts`) — origen del fallo a clasificar.
- Signal Forms (`@angular/forms/signals`) y Angular Material — formulario y presentación del mensaje, ya en uso.

## Referencias

- **Diseño:** [Wireframe de Login](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/login.md) — incluye el mensaje de error entre sus componentes clave
- **Documentación técnica:** [Iniciar sesión](../../../specs/technical-docs/portal-procesos-baw.md#api-01) · [Error de la API de BAW](../../../specs/technical-docs/portal-procesos-baw.md#md-11) · [Autenticación y ciclo de vida de la sesión](../../../specs/technical-docs/portal-procesos-baw.md#fl-01)

## Archivos afectados

```text
frontend/
└── src/app/features/auth/components/login/
    ├── ~ login.ts        # clasifica el fallo y elige el mensaje
    ├── ~ login.html      # mensaje diferenciado y afordancia de reintento
    └── ~ login.spec.ts   # credenciales inválidas, BAW inaccesible y reintento
```

## Plan de implementación

- [x] **IT-01** — Clasificar el fallo del login en indisponibilidad y rechazo de credenciales
      FL-01 separa los dos casos en su tabla de manejo de errores: BAW inaccesible en el paso 2 y `401` por credenciales inválidas en el paso 3. API-01 advierte además que el `401` lo emite el contenedor de seguridad antes de la aplicación y puede no traer cuerpo `exception`.
- [x] **IT-02** — Mostrar un mensaje propio para la indisponibilidad de BAW
      Mensaje de indisponibilidad con reintento, no una instrucción de verificar credenciales.
- [x] **IT-03** — Aprovechar el mensaje de la API cuando llegue
      El `error_message` de MD-11 viene localizado por BAW y es presentable tal cual; conservar un texto propio de respaldo para cuando resulte demasiado técnico o no haya cuerpo de error.
- [x] **IT-04** — Garantizar el reintento sin sesión iniciada
      El formulario queda operable tras el fallo, las credenciales no se conservan y ningún camino de error deja al usuario con sesión marcada como iniciada.
- [x] **IT-05** — Anunciar el mensaje a los lectores de pantalla
      El bloque ya se presenta con `role="alert"`; verificar que el cambio de mensaje se anuncia y que el foco permite reintentar de inmediato, conforme a los mínimos WCAG AA declarados en `AGENTS.md` del repositorio `frontend`.
