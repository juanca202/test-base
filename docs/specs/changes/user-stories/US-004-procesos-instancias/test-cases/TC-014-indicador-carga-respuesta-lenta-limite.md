# TC-014 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- La respuesta de `GET /bpm/processes` se retrasa artificialmente (más de 3 s) interceptando la petición [propuesto].

**Perspectiva:** Límite
**Tipo de prueba:** E2E
**Prioridad:** Baja
**Criterio de aceptación:** AC-003 (Eficiencia de rendimiento) — Carga en ≤ 3 s con paginación de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo            | Valor                                    | Notas                                                               |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario          | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña       | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| Retraso simulado | 5 s [propuesto]                          | Supera el umbral de 3 s                                             |

## Datos de prueba

| 1 | Usuario | Abre «Procesos» | Se invoca `GET /bpm/processes` y la respuesta se retrasa |
| 2 | Verificador | Observa la interfaz durante la espera | Se muestra un indicador de carga; el listado no aparece parcial ni vacío |
| 3 | Sistema | Recibe `200` | El indicador desaparece y se pinta el listado |

## Pasos de ejecución

| #                                                                                  | Actor | Acción | Resultado esperado del paso |
| ---------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| El usuario siempre percibe que la carga está en curso, aunque se exceda el umbral. |

## Resultado esperado final

Verifica el comportamiento, no el cumplimiento del umbral (cubierto en TC-011). Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
