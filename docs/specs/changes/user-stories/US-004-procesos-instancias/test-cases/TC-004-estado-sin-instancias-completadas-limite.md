# TC-004 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- No existe ninguna instancia en el estado seleccionado (`finished` en el ambiente o datos preparados para ello) [propuesto].

**Perspectiva:** Límite
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado con filtro Activo/Completado
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo      | Valor                                    | Notas                                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| `states`   | `finished`                               | Estado sin resultados                                               |

## Datos de prueba

| 1 | Usuario | Selecciona el filtro sin instancias | El sistema invoca `GET /bpm/processes?states=finished` |
| 2 | Sistema | Recibe `200` con `processes` vacío | Se muestra un mensaje de estado vacío |
| 3 | Verificador | Revisa la consola y la interfaz | No hay errores ni filas huérfanas; los filtros siguen operativos |

## Pasos de ejecución

| #                                                                                           | Actor | Acción | Resultado esperado del paso |
| ------------------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| El portal muestra un estado vacío claro, sin errores, y permite seguir cambiando de filtro. |

## Resultado esperado final

Si el ambiente siempre tiene instancias finalizadas, simular la respuesta vacía interceptando la petición. Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
