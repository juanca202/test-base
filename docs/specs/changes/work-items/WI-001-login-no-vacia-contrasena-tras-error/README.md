# WI-001: El campo de contraseña del login no se vacía tras un intento fallido

<!-- wi:status=Draft -->

**Estado:** Draft
**Tipo:** bug-fix
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Tras un intento de login fallido, el campo de contraseña del formulario conserva el valor tecleado.

- **Esperado (TC-003, paso 4):** el usuario permanece en la pantalla de login y el campo de contraseña queda vacío; no se conserva ninguna credencial en el formulario.
- **Observado:** el usuario permanece en `/signin` con el mensaje de error, pero el campo de contraseña mantiene lo que se tecleó.
- **Reproducción:** abrir el login, ingresar un usuario inexistente y una contraseña cualquiera, enviar el formulario; con el mensaje de error visible, el campo de contraseña sigue con su valor.

## Referencias

- **Historia de usuario:** [US-001: Autenticación y acceso al portal](../../user-stories/US-001-autenticacion-acceso-portal/README.md)
- **Caso de prueba:** [TC-003](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/TC-003-login-credenciales-invalidas-error.md)
- **Hallazgo registrado en:** [automation.md](../../user-stories/US-001-autenticacion-acceso-portal/test-cases/automation.md)
- **Prueba en `test.fixme`:** `tests/e2e/us-001/tc-003-login-credenciales-invalidas.e2e.spec.ts` — prueba `TC-003: should leave the password field empty after a failed login` (`test.fixme`) (ruta desde la raíz del repositorio)

## Observaciones

- La causa no está analizada y la ficha no tiene criterios de aceptación ni plan de implementación; completarla antes de pasar a `Ready`.
- El repositorio `frontend` se tomó de US-001; el código de la aplicación no está en este repositorio de pruebas.
