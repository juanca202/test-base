# US-004: Procesos — instancias en ejecución y completadas

<!-- us:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-16
**Repositorios:** frontend
**INVEST:** 🟢 6 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../requirements/SRS-001-portal-procesos-baw/README.md)

## Descripción

**COMO** usuario interno autenticado
**QUIERO** consultar el listado de instancias de proceso, activas y completadas, y poder buscarlas/filtrarlas
**PARA** hacer seguimiento del estado de los trámites

## Criterios de aceptación

- **AC-001 (Interacción de usuario):** El sistema DEBE mostrar un listado de instancias de proceso (`GET /bpm/processes`) con filtro Activo (`running`) / Completado (`finished`).
  Casos de prueba: [TC-001](./test-cases/TC-001-listado-instancias-activas-running-happy.md) · [TC-002](./test-cases/TC-002-listado-instancias-completadas-finished-happy.md) · [TC-003](./test-cases/TC-003-listado-sin-sesion-401-error.md) · [TC-004](./test-cases/TC-004-estado-sin-instancias-completadas-limite.md) · [TC-005](./test-cases/TC-005-fallo-carga-listado-baw-5xx-error.md)
- **AC-002 (Interacción de usuario):** El sistema DEBE permitir buscar por texto y filtrar por modelo de proceso, process app y snapshot, usando los parámetros de servidor que soporte la API de BAW (`search_term`, `model`, `containers`, `versions`).
  Casos de prueba: [TC-006](./test-cases/TC-006-busqueda-texto-search-term-servidor-happy.md) · [TC-007](./test-cases/TC-007-filtro-modelo-proceso-happy.md) · [TC-008](./test-cases/TC-008-filtro-process-app-y-snapshot-happy.md) · [TC-009](./test-cases/TC-009-combinacion-busqueda-filtros-estado-limite.md) · [TC-010](./test-cases/TC-010-busqueda-sin-coincidencias-estado-vacio-error.md)
- **AC-003 (Eficiencia de rendimiento):** El sistema DEBE cargar el listado de "Procesos" en no más de 3 segundos bajo condiciones normales de red, usando paginación de servidor.
  Casos de prueba: [TC-011](./test-cases/TC-011-carga-listado-3-segundos-paginacion-happy.md) · [TC-012](./test-cases/TC-012-paginacion-pagina-siguiente-offset-size-happy.md) · [TC-013](./test-cases/TC-013-ultima-pagina-sin-next-limite.md) · [TC-014](./test-cases/TC-014-indicador-carga-respuesta-lenta-limite.md)

## Referencias

- **Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../requirements/SRS-001-portal-procesos-baw/README.md)
- **Diseño / prototipo:** [Wireframe de Procesos](../../requirements/SRS-001-portal-procesos-baw/assets/wireframes/procesos.md)
- **Documentación técnica:** [Instancia de proceso](../../../../architecture/portal-procesos-baw/models/MD-03-instancia-proceso.md) · [Listar instancias de proceso](../../../../architecture/portal-procesos-baw/apis/API-016-procesos.md#get-bpm-processes)

## Observaciones

- ~~**Decisión pendiente (bloqueante):** acceso de un usuario final no administrador a `GET /bpm/processes`.~~ **Resuelta el 2026-09-16.** En vivo contra el ambiente de referencia, el usuario `juancarlos.altamirano` obtuvo **200** en `states=running`, `states=finished` y en los filtros de servidor `search_term`, `model` y `containers`. Ese usuario pertenece a `tw_admins` (también `tw_authors` y `tw_managers`). Producto decidió que los usuarios del portal serán (o ya son) administradores en BAW, coherente con el contrato OpenAPI de API-09 y con SRS-001 §2.6 para esta versión. AC-001 ya no queda condicionado a una verificación posterior.
- Esta laguna se resolvió a nivel de historia, no en el SRS-001 (que permanece en `Ready`).
- **Nota no bloqueante — columna «grupo responsable»:** el wireframe de Procesos la muestra; el modelo de instancia (MD-03) no trae equipo — el equipo solo existe a nivel de tarea. FR-006 ya acota el listado a lo que la API soporte; la columna se omite en esta historia.
- **Nota no bloqueante — `api/CR-001`:** el listado queda en la familia `/bpm/` (`GET /bpm/processes`), no en WLE. `OPTIONS /rest/bpm/wle/v1/processes` no expuso un equivalente (405). Es la misma clase de excepción ya conocida en detalle/reclamo/completado de tarea; no bloquea planificar ni implementar esta US.

---

## Validación

### Complejidad sugerida

- **Story points:** 5
- **Justificación:** el contrato de listado, filtros de servidor y paginación está confirmado en vivo y el acceso ya no es un bloqueante. El alcance restante es acotado: un repository/servicio sobre API-09, el listado con pestañas Activo/Completado, búsqueda/filtros y paginación según el wireframe aprobado.

### INVEST

| Letra | Criterio      | Resultado | Notas                                                                                                                                                                     |
| ----- | ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I** | Independiente | Cumple    | El acceso a API-09 quedó confirmado (usuarios del portal = administradores en BAW); solo depende de [US-001](../US-001-autenticacion-acceso-portal/README.md), ya creada. |
| **N** | Negociable    | Cumple    | El detalle visual del listado es negociable.                                                                                                                              |
| **V** | Valiosa       | Cumple    | Es la vista central de seguimiento de trámites.                                                                                                                           |
| **E** | Estimable     | Cumple    | Contrato, filtros y paginación confirmados en vivo el 2026-09-16.                                                                                                         |
| **S** | Pequeña       | Cumple    | Alcance acotado: un repository/servicio, el listado paginado y los filtros de servidor.                                                                                   |
| **T** | Testeable     | Cumple    | Los tres `AC-XXX` son verificables contra el contrato ya confirmado.                                                                                                      |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado | Notas                                                                                                                     |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| Dependencias listas                | Cumple | [US-001: Autenticación y acceso al portal](../US-001-autenticacion-acceso-portal/README.md).                              |
| Inputs/outputs claros              | Cumple | `GET /bpm/processes` con `states`, `search_term`, `model`, `containers` y paginación `offset`/`size`, confirmado en vivo. |
| Repositorios definidos             | Cumple | `frontend`.                                                                                                               |
| Sin decisiones técnicas pendientes | Cumple | Autorización cerrada el 2026-09-16; ver Observaciones para las notas no bloqueantes.                                      |
| Referencias de UI                  | Cumple | Wireframe de Procesos aprobado.                                                                                           |
| Sin aclaraciones pendientes        | Cumple | Ver Observaciones.                                                                                                        |
