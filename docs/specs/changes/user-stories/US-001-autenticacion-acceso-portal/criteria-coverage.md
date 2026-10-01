# Reporte de cobertura — US-001-autenticacion-acceso-portal

**Fecha:** 2026-09-30 00:02
**Rama:** test/US-001-autenticacion-acceso-portal
**Commit:** a9e696d
**Trabajo:** [US-001](./README.md)
**Veredicto:** ⚠️ Aprobado con observaciones

## Resumen

Los seis criterios de aceptación tienen casos de prueba y pruebas automatizadas que corren en verde, y ninguno queda sin cobertura. Cuatro (AC-001, AC-002, AC-003 y AC-007) quedan parciales porque una parte de sus casos está marcada `test.fixme` por hallazgos abiertos o no se puede verificar; solo AC-004 y AC-005 quedan cubiertos por completo.

**Pruebas:** corrida `tests-only` disparada ahora por `quality-check` (commit a9e696d, 2026-09-30). Resultado por suite: unit `N/A` · coverage `N/A` · e2e `PASS` (25 pasan, 11 `test.fixme` omitidas).

**Cobertura de criterios de aceptación**

| Total | Cubiertos | Parciales | No cubiertos |
| ----- | --------- | --------- | ------------ |
| 6     | 2         | 4         | 0            |

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción                                                                                                            | Estado     | Observaciones                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-001   | Requerir autenticación contra BAW (`POST /bpm/system/login`) para acceder a cualquier módulo                           | ⚠️ PARTIAL | TC-003 paso 4 (campo de contraseña vacío tras el error) en `test.fixme`: el portal conserva la contraseña. El resto de TC-001, TC-002 y TC-003 pasa.                                                                                                                                                                                                                                                                                         |
| AC-002   | Comunicación con BAW solo sobre HTTPS/TLS e incluir `BPMCSRFToken` tras el login                                       | ⚠️ PARTIAL | El esquema `https` de TC-004 no se verifica: `API_BASE_URL` es el proxy `http` del portal (falta una variable con la URL directa de BAW). TC-005: la envoltura `exception` del cuerpo del `403` está en `test.fixme`; BAW devuelve `error_number` en la raíz, probablemente el TC deba corregirse.                                                                                                                                           |
| AC-003   | Cierre de sesión desde un control persistente que descarta credenciales y redirige al login sin llamar a BAW           | ⚠️ PARTIAL | TC-006 pasos 1-2 (botón en el pie del menú lateral) en `test.fixme`: el portal no tiene menú lateral y el control está en el menú de usuario del encabezado. Los pasos 3-7 pasan; AC-003 no fija la ubicación, por lo que el TC probablemente deba corregirse.                                                                                                                                                                               |
| AC-004   | Sin acceso a módulos protegidos con sesión inválida o expirada; redirección al login y pérdida de cambios no guardados | ✅ COVERED | El «formulario» de TC-007 es el campo «Buscar» de Mis tareas (no hay formulario editable sin efectos en BAW).                                                                                                                                                                                                                                                                                                                                |
| AC-005   | Mensaje claro y reintento ante error de conexión o autenticación contra BAW, sin marcar la sesión como iniciada        | ✅ COVERED | Solo E2E, como declara el TC; la indisponibilidad de BAW se simula con `page.route` (error de red, tiempo de espera y `500`).                                                                                                                                                                                                                                                                                                                |
| AC-007   | Diseño adaptado a escritorio (≥1280px), tablet (768–1279px) y móvil (<768px), con navegación adaptada en móvil         | ⚠️ PARTIAL | Escritorio y ausencia de desborde en todos los anchos pasan. Los pasos de TC-012 (colapso a iconos), TC-013 (hamburguesa y panel superpuesto), TC-014 (pasos 1, 2 y 4) y TC-011 (referencia visual aprobada) están en `test.fixme`: el portal oculta la navegación en móvil sin alternativa y no colapsa a iconos en tablet. Los casos `Visual Test` se automatizaron como E2E con aserciones estructurales y capturas, sin diff de píxeles. |

## Matriz de trazabilidad

Vista auditable: **una fila por cada combinación criterio × caso de prueba × tipo de prueba declarado**. Si un TC declara `API Test, E2E`, genera **dos** filas — así se ve de un vistazo qué parte de la intención de prueba está realmente materializada y cuál no.

| Criterio | TC     | Tipo        | Evidencia                                                                    | Ejecución     | Resultado |
| -------- | ------ | ----------- | ---------------------------------------------------------------------------- | ------------- | --------- |
| AC-001   | TC-001 | API Test    | `tests/api/us-001/tc-001-login-credenciales-validas.api.spec.ts`             | quality-check | ✅ PASS   |
| AC-001   | TC-001 | E2E         | `tests/e2e/us-001/tc-001-login-credenciales-validas.e2e.spec.ts`             | quality-check | ✅ PASS   |
| AC-001   | TC-002 | E2E         | `tests/e2e/us-001/tc-002-acceso-sin-sesion-redirige-login.e2e.spec.ts`       | quality-check | ✅ PASS   |
| AC-001   | TC-003 | API Test    | `tests/api/us-001/tc-003-login-credenciales-invalidas.api.spec.ts`           | quality-check | ✅ PASS   |
| AC-001   | TC-003 | E2E         | `tests/e2e/us-001/tc-003-login-credenciales-invalidas.e2e.spec.ts`           | quality-check | ✅ PASS   |
| AC-002   | TC-004 | API Test    | `tests/api/us-001/tc-004-peticion-autenticada-https-csrf.api.spec.ts`        | quality-check | ✅ PASS   |
| AC-002   | TC-005 | API Test    | `tests/api/us-001/tc-005-peticion-sin-csrf-token-rechazada.api.spec.ts`      | quality-check | ✅ PASS   |
| AC-003   | TC-006 | E2E         | `tests/e2e/us-001/tc-006-cierre-sesion-desde-menu-lateral.e2e.spec.ts`       | quality-check | ✅ PASS   |
| AC-004   | TC-007 | E2E         | `tests/e2e/us-001/tc-007-sesion-expira-durante-formulario-error.e2e.spec.ts` | quality-check | ✅ PASS   |
| AC-004   | TC-008 | E2E         | `tests/e2e/us-001/tc-008-acceso-directo-url-sesion-invalida.e2e.spec.ts`     | quality-check | ✅ PASS   |
| AC-005   | TC-009 | E2E         | `tests/e2e/us-001/tc-009-baw-inaccesible-en-login-error.e2e.spec.ts`         | quality-check | ✅ PASS   |
| AC-007   | TC-011 | Visual Test | `tests/e2e/us-001/tc-011-layout-escritorio-navegacion-completa.e2e.spec.ts`  | quality-check | ✅ PASS   |
| AC-007   | TC-012 | Visual Test | `tests/e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts`     | quality-check | ✅ PASS   |
| AC-007   | TC-013 | Visual Test | `tests/e2e/us-001/tc-013-layout-movil-menu-hamburguesa.e2e.spec.ts`          | quality-check | ✅ PASS   |
| AC-007   | TC-014 | Visual Test | `tests/e2e/us-001/tc-014-breakpoints-768-1280-limite.e2e.spec.ts`            | quality-check | ✅ PASS   |

## Observaciones y pendientes

- El `Resultado` de cada fila refleja las pruebas que corren; las marcadas `test.fixme` (11 omitidas en la corrida) se detallan en la columna Observaciones de su criterio y en `test-cases-automation.md`.
- Ninguno de los hallazgos abiertos (TC-003, TC-005, TC-006, TC-012, TC-013, TC-014) tiene work item de seguimiento registrado.
- El hallazgo de TC-013 (sin hamburguesa ni navegación alternativa en móvil, con el usuario limitado a cambiar de módulo por URL) es el de mayor impacto: incumple lo que exige AC-007 para el rango móvil.
- Las suites `unit` y `coverage` son `N/A`: el estándar de testing del repo no contempla pruebas unitarias ni cobertura de líneas.
- El árbol de trabajo no está limpio (`workingTreeClean: false`): quedan carpetas de documentación sin versionar ajenas a esta historia.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=8fd0434f09ab16a323f7c03a64699e38e5319b03 · spec=55016dbcc746d431136a3d38538d59053cd51b63 · generated=2026-09-30 -->
