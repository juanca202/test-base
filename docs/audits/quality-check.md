# Verificaciones automatizadas — US-001-autenticacion-acceso-portal

**Fecha:** 2026-09-29
**Rama:** test/US-001-autenticacion-acceso-portal
**Commit:** dcf5fd6
**Modo:** default
**Veredicto:** ❌ Rechazado

## Resumen

Se ejecutaron tipado, linter, validaciones de arquitectura, build y la suite Playwright (proyectos `chromium` y `api-tests`). Los checks estáticos, la arquitectura y el build pasan. La suite Playwright falla completa (24 fallos, 2 omitidos): todas las pruebas que llegan a ejecutarse terminan en `ECONNREFUSED ::1:4300`, porque el portal bajo prueba no está levantado en `http://localhost:4300`. Para llegar a `APPROVED` hay que levantar el portal y repetir la corrida.

## Verificaciones

Leyenda de estados: `✅` Correcto · `❌` Fallido · `⏭️` Omitido · `⏸️` Pendiente · `—` No aplica · `ℹ️` Informativo.

| #   | Check        | Comando                                                                  | Categoría   | Estado      | Detalle                                                            | Duración |
| --- | ------------ | ------------------------------------------------------------------------ | ----------- | ----------- | ------------------------------------------------------------------ | -------- |
| 1   | tipado       | `npx tsc --noEmit`                                                       | Bloqueante  | ✅ Correcto | 0 errores                                                          | —        |
| 2   | linter       | `npm run lint`                                                           | Bloqueante  | ✅ Correcto | 0 errores, 0 warnings                                              | —        |
| 3   | arquitectura | `node scripts/arch/verify.mjs`                                           | Bloqueante  | ✅ Correcto | 1 criterio, 0 violaciones                                          | —        |
| 4   | unit tests   | —                                                                        | Bloqueante  | — No aplica | el estándar de testing no contempla pruebas unitarias              | —        |
| 5   | coverage     | —                                                                        | Bloqueante  | — No aplica | el repo no tiene tooling de cobertura                              | —        |
| 6   | build        | `npm run build`                                                          | Bloqueante  | ✅ Correcto | OK                                                                 | —        |
| 7   | e2e          | `npx playwright test --project=chromium --project=api-tests --workers=2` | Condicional | ❌ Fallido  | 24 failed, 2 skipped; todos los fallos por `ECONNREFUSED ::1:4300` | —        |

### Detalle de checks fallidos

- **e2e** — 24 fallos, todos de infraestructura, no de aserciones: `apiRequestContext.post: connect ECONNREFUSED ::1:4300` (`src/helpers/baw-session.ts:25`) en las pruebas de API y errores equivalentes de conexión en las E2E. Afecta a los proyectos `chromium` (TC-001…TC-014 E2E y TC-001/003/004/005 API) y `api-tests` (TC-001/003/004/005). Los 2 omitidos son `test.fixme` de hallazgos ya registrados. `BASE_URL` y `API_BASE_URL` apuntan a `http://localhost:4300` (`.env`) y no hay ningún proceso escuchando en ese puerto; `playwright.config.ts` no arranca el servidor (`START_LOCAL_SERVER` no está activo y el repo no tiene el código del portal). La corrida anterior (2026-09-24, commit `dcf5fd6`) dio 21 passed con el portal disponible, así que el fallo parece de entorno y no de este cambio (traducción de los títulos de las pruebas).

## Próximas acciones

1. Levantar el portal en `http://localhost:4300` (o ajustar `BASE_URL`/`API_BASE_URL` en `.env` al ambiente disponible) y repetir `quality-check`.
2. Sin cambios de código pendientes: los fallos no apuntan a defectos del repositorio de pruebas.

<!-- quality-check:verdict=REJECTED · fingerprint=61a94cdb1109ea2b5582413576c137d5ce3548cc · generated=2026-09-29 -->
