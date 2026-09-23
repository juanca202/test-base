# Reporte de trazabilidad — US-001-autenticacion-acceso-portal

**Fecha:** 2026-09-12 03:30
**Rama:** feature/US-001-autenticacion-acceso-portal
**Commit:** 110f2aa
**Trabajo:** [US-001](./README.md)
**Veredicto:** ❌ REJECTED

## Resumen

De los 6 criterios de aceptación de la historia, 2 quedan cubiertos (`AC-002`, `AC-007`), 2 parcialmente cubiertos (`AC-001`, `AC-005`) y 2 sin ninguna evidencia automatizada (`AC-003`, `AC-004`): ambos dependen por completo de casos de prueba declarados como `E2E`, y el repositorio no tiene ningún test e2e relacionado (solo un smoke test genérico en `e2e/example.spec.ts`). El resto de huecos son filas `E2E` puntuales dentro de criterios que sí tienen cobertura por otra vía (`Integration`, resuelta contra la suite `unit` a falta de una suite de integración distinta declarada en el estándar de testing).

**Pruebas:** caché fresca de `quality-check` (commit `110f2aa`, 2026-09-12). unit `PASS` (250 passed, 0 failed) · e2e `PASS` (1 passed — solo el smoke test genérico, sin relación con los criterios de esta historia).

**Cobertura de criterios de aceptación**

| Total | COVERED | PARTIAL | UNCOVERED |
| ----- | ------- | ------- | --------- |
| 6     | 2       | 2       | 2         |

## Cobertura por criterio

| Criterio | Descripción                                                                                                  | Estado       | Observaciones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-001   | Requiere autenticación contra BAW (`POST /bpm/system/login`) para acceder a cualquier módulo                 | ⚠️ PARTIAL   | `TC-001`/`TC-003` cubiertos como Unit del servicio/componente (mocks de HTTP/`AuthProvider`), no como `Integration` real contra HTTP — nota ya registrada en `progress.md` de TK-005. `TC-002` (`E2E`, acceso sin sesión) sin artefacto: el comportamiento equivalente existe en `auth-guard.spec.ts` (preexistente, Unit), pero el TC declara específicamente `E2E`.                                                                                                                                        |
| AC-002   | Comunicación con BAW sobre HTTPS/TLS con token anti-CSRF en toda petición posterior al login                 | ✅ COVERED   | `TC-004`/`TC-005` cubiertos vía `unit`: el estándar de testing no declara una suite de `Integration` distinta, así que ambos se resuelven contra esa suite (regla de `trace-validate` para tipos sin suite homónima).                                                                                                                                                                                                                                                                                        |
| AC-003   | Permitir cerrar sesión desde un control persistente, descartando credenciales locales sin llamar a BAW       | ❌ UNCOVERED | Su único caso de prueba documentado, `TC-006`, declara únicamente `E2E`, sin artefacto en el repo. El comportamiento en sí tiene cobertura Unit extensa y ya verde (`auth-service.spec.ts`: `logout()` descarta credenciales, navega sin llamar a BAW, es idempotente, cierra diálogos; `main-layout.spec.ts`: el control es descubrible y accesible en todo rango de ancho) — pero ninguna de esas pruebas está vinculada a `TC-006` en el índice de casos de prueba, así que no cuentan como su evidencia. |
| AC-004   | No permitir acceso a un módulo protegido con sesión inválida o expirada; redirigir al login                  | ❌ UNCOVERED | `TC-007` y `TC-008` declaran únicamente `E2E`, sin artefacto en el repo. `TC-007` (expiración durante el uso) tiene cobertura Unit sustancial en `session-expiry-interceptor.spec.ts`; `TC-008` (acceso directo por URL) la tiene en `auth-guard.spec.ts` (preexistente) — ninguna vinculada formalmente a estos TC.                                                                                                                                                                                         |
| AC-005   | Ante error de conexión/autenticación, mostrar mensaje claro y permitir reintentar sin marcar sesión iniciada | ⚠️ PARTIAL   | `TC-009` cubierto como Unit del componente `Login` (mocks de `AuthProvider`), no como `Integration` real — misma nota que TK-005 registró para TC-003. Fila `E2E` del propio TC-009 sin artefacto.                                                                                                                                                                                                                                                                                                           |
| AC-007   | Diseño responsivo en 3 rangos de ancho, con navegación adaptada en móvil                                     | ✅ COVERED   | Los 4 TC (`TC-011` a `TC-014`) declaran `Visual Test`; el repo no tiene herramienta de regresión visual, así que se resuelven contra `unit` (`main-layout.spec.ts`), verificando el contrato DOM/clases CSS/ARIA/teclado que sostiene el comportamiento responsivo, no una comparación de píxeles real.                                                                                                                                                                                                      |

## Matriz de trazabilidad

| Criterio | TC     | Tipo        | Evidencia                                                               | Ejecución     | Resultado    |
| -------- | ------ | ----------- | ----------------------------------------------------------------------- | ------------- | ------------ |
| AC-001   | TC-001 | Integration | `frontend/src/app/features/auth/services/auth-service.spec.ts`          | quality-check | ✅ PASS      |
| AC-001   | TC-001 | E2E         | —                                                                       | —             | ❌ UNCOVERED |
| AC-001   | TC-002 | E2E         | —                                                                       | —             | ❌ UNCOVERED |
| AC-001   | TC-003 | Integration | `frontend/src/app/features/auth/components/login/login.spec.ts`         | quality-check | ✅ PASS      |
| AC-001   | TC-003 | E2E         | —                                                                       | —             | ❌ UNCOVERED |
| AC-002   | TC-004 | Unit        | `frontend/src/app/features/auth/services/auth-service.spec.ts`          | quality-check | ✅ PASS      |
| AC-002   | TC-004 | Integration | `frontend/src/app/features/auth/services/auth-service.spec.ts`          | quality-check | ✅ PASS      |
| AC-002   | TC-005 | Integration | `frontend/src/app/core/interceptors/session-expiry-interceptor.spec.ts` | quality-check | ✅ PASS      |
| AC-003   | TC-006 | E2E         | —                                                                       | —             | ❌ UNCOVERED |
| AC-004   | TC-007 | E2E         | —                                                                       | —             | ❌ UNCOVERED |
| AC-004   | TC-008 | E2E         | —                                                                       | —             | ❌ UNCOVERED |
| AC-005   | TC-009 | Integration | `frontend/src/app/features/auth/components/login/login.spec.ts`         | quality-check | ✅ PASS      |
| AC-005   | TC-009 | E2E         | —                                                                       | —             | ❌ UNCOVERED |
| AC-007   | TC-011 | Visual Test | `frontend/src/app/shared/components/main-layout/main-layout.spec.ts`    | quality-check | ✅ PASS      |
| AC-007   | TC-012 | Visual Test | `frontend/src/app/shared/components/main-layout/main-layout.spec.ts`    | quality-check | ✅ PASS      |
| AC-007   | TC-013 | Visual Test | `frontend/src/app/shared/components/main-layout/main-layout.spec.ts`    | quality-check | ✅ PASS      |
| AC-007   | TC-014 | Visual Test | `frontend/src/app/shared/components/main-layout/main-layout.spec.ts`    | quality-check | ✅ PASS      |

## Observaciones y pendientes

- El repositorio no tiene ninguna prueba E2E relacionada con esta historia (`frontend/e2e/` solo contiene un smoke test genérico de la ruta raíz). Todas las filas `E2E` de la matriz quedan `UNCOVERED` por este motivo, incluidas las de criterios ya cubiertos por otra vía (`AC-001`, `AC-005`).
- `code-review` de esta rama se dejó **sin terminar** (omitido a petición explícita del usuario, ver `progress.md`): entre sus hallazgos pendientes hay al menos uno con un escenario de fallo concreto (`sessionExpiryInterceptor` puede dejar una petición colgada para siempre incluso con `isLoggedIn() === false`), que no se refleja en este reporte porque no afecta directamente la trazabilidad criterio↔prueba, pero es relevante para la decisión de cierre.

<!-- trace-validate:verdict=REJECTED · fingerprint=bb06f8ad6276584804f8b3c2c124943a1c4ac35f · spec=a721bde6dc52904f84a8bc7a95557fe786689c1a · generated=2026-09-12 -->
