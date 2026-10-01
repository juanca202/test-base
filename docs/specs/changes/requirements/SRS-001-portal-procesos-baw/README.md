# SRS-001: Portal de administración de procesos IBM BAW

<!-- srs:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-10
**Última actualización:** 2026-09-11

## 1. Introducción

### 1.1 Propósito

Reemplazar, para los usuarios finales, la experiencia de uso del Process Portal estándar de IBM BAW —percibida como deficiente y confusa para los aprobadores— por una interfaz web moderna que permita ver el estado de los procesos y realizar aprobaciones, con el objetivo de reducir el tiempo de aprobación y mejorar la adopción/satisfacción de los usuarios.

### 1.2 Alcance del producto

Una nueva interfaz web (frontend Angular) que consume directamente la API REST de IBM BAW para cubrir las funcionalidades de: Iniciar procesos, Mis tareas (listar, reclamar y completar tareas mediante un formulario dinámico), Procesos (instancias en ejecución y completadas), Rendimiento del proceso, Rendimiento del equipo, y búsqueda/filtros transversales a los listados anteriores. No incluye backend propio ni almacenamiento propio de datos: toda la información se consulta en vivo contra BAW.

**Fuera de alcance:**

- Administración/configuración de procesos (despliegue de process apps, diseño BPMN, gestión de usuarios/grupos de BAW) — se sigue haciendo en el portal administrativo existente de BAW, no en este portal.
- Diferenciación de permisos o vistas por rol (aprobador/supervisor/administrador de procesos): todos los usuarios autenticados acceden a las mismas funcionalidades en esta versión (ver 2.6).
- Alta disponibilidad o redundancia propia del portal más allá de la que ofrezca la API de BAW (ver NFR-004 y riesgo R-04).

### 1.3 Definiciones, acrónimos y abreviaturas

- **BAW:** IBM Business Automation Workflow — el sistema de procesos existente cuya API consume este portal.
- **Outcome:** acción o salida definida por una tarea humana de BAW (p. ej. aprobar/rechazar) que determina cómo continúa el proceso.
- **Coach:** formulario de interacción humana definido dentro de BAW para una tarea o proceso.

### 1.4 Referencias

- Ninguna por ahora.

## 2. Descripción general del producto

### 2.1 Perspectiva del producto

Este portal reemplaza, para los usuarios finales, el acceso operativo (ejecución y uso de procesos: ver estado, aprobar) al Process Portal estándar de IBM BAW. Convive con el portal administrativo de BAW, que sigue usándose para la administración/configuración de procesos — eso queda fuera del alcance de este SRS.

### 2.2 Funciones del producto

- Iniciar nuevas instancias de los procesos disponibles para el usuario.
- Listar las tareas asignadas al usuario, con su estado de SLA (a tiempo, en riesgo, vencida).
- Reclamar una tarea no asignada y completarla mediante un formulario renderizado dinámicamente según los datos que exponga la API de BAW, incluyendo comentarios y la ejecución de la acción ("outcome") correspondiente.
- Consultar el listado de instancias de proceso en ejecución y completadas.
- Consultar indicadores de rendimiento por tipo de proceso (incluido su diagrama con el estado de tareas) y por grupo/equipo.
- Buscar y filtrar dentro de cada uno de los listados anteriores.
- Finalizar la sesión activa desde cualquier módulo del portal.

### 2.3 Restricciones del producto

- El ambiente de referencia de la API de BAW usado durante este levantamiento es interno/de prueba, accesible tanto por IP (`https://192.168.120.100:9443`) como por su nombre DNS interno (`https://btq-srv-bawodm:9443`) — mismo servidor; se adoptó como URL de producción provisional hasta contar con la definitiva (ver riesgo R-01).
- El sistema depende funcional y arquitectónicamente de las capacidades que exponga la API REST de BAW; no se construye lógica de negocio de aprobación adicional a la que BAW ya gestiona.

### 2.4 Características de los usuarios

- **Usuario:** empleado interno autenticado que usa el portal para iniciar procesos, gestionar sus tareas asignadas y consultar el estado/rendimiento de los procesos. Sin distinción de rol funcional en esta versión (ver 2.6).

### 2.5 Supuestos y dependencias

**Funcionalidad transversal asumida como existente o provista por el proyecto base**

| Capacidad                          | Supuesto                                                                                   | Origen                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Autenticación                      | Ya existe / se reutiliza — no está en el alcance de este SRS construir un mecanismo propio | Mecanismo de seguridad nativo de BAW (endpoint de login) |
| Auditoría / trazabilidad de tareas | Ya existe / se reutiliza — no se construye una auditoría propia                            | Historial nativo de tareas e instancias de BAW           |

- El portal no almacena datos propios; toda la información se consulta en vivo contra la API de BAW.
- Dependencia total de la disponibilidad y del contrato real de la API REST de BAW (ver riesgos R-01, R-02, R-04).

### 2.6 Requisitos diferidos a futuras versiones

| Requisito                                                                                    | Motivo del diferimiento                                                                                | Versión objetivo |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------- |
| Diferenciación de permisos/vistas por rol (aprobador, supervisor, administrador de procesos) | El usuario indicó que, por ahora, no hay distinción de rol: todos acceden a las mismas funcionalidades | Por definir      |

## 3. Stack tecnológico

<!-- srs:stack-mode=decided -->

**Modo de resolución:** Definido por el usuario

| Capa                         | Tecnología                                                                                            | Justificación                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Frontend                     | Angular 22 + TypeScript (repositorio `frontend`, ya inicializado a partir del starter `angular-base`) | Stack estándar ya definido en el proyecto base del repositorio |
| Backend                      | No aplica — se consume directamente la API REST de IBM BAW ya existente, sin backend intermedio       | Decisión del equipo                                            |
| Base de datos                | No aplica — sin almacenamiento propio                                                                 | Decisión del equipo                                            |
| Infraestructura / despliegue | Azure Static Web Apps (tentativo)                                                                     | Decisión del equipo, sujeta a confirmación posterior           |

**Decisiones pendientes:** Ninguna que bloquee el desarrollo. La URL de producción de la API de BAW se resuelve usando el ambiente de referencia interno (`https://192.168.120.100:9443`) como valor provisional, parametrizado por ambiente (ver riesgo R-01); debe confirmarse la URL definitiva antes del despliegue real a producción. La infraestructura de despliegue (Azure Static Web Apps) queda tentativa, sujeta a confirmación posterior — no condiciona el desarrollo del frontend ni el consumo de la API de BAW mientras tanto.

## 4. Repositorios e implementación

| Repositorio | Tipo  | Proyecto base                                                  | Notas                                                                                                                  |
| ----------- | ----- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `frontend`  | Nuevo | `angular-base` (https://github.com/juanca202/angular-base.git) | Repositorio ya scaffolded como submódulo en el workspace; consumirá directamente la API de BAW sin backend intermedio. |

## 5. Equipo de desarrollo

**¿Equipo de desarrollo definido?** Sí

| Nombre                 | Email                        | Responsabilidad |
| ---------------------- | ---------------------------- | --------------- |
| Juan Carlos Altamirano | juanca.altamirano@bayteq.com | Frontend        |

## 6. Requisitos funcionales

| ID     | Categoría              | Prioridad | Estado   | Enunciado                                                                                                                                                                                                                                      |
| ------ | ---------------------- | --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001 | Interacción de usuario | Alta      | Aprobado | El sistema DEBE mostrar un listado de los procesos disponibles para que el usuario inicie una nueva instancia, según lo que la API de BAW exponga.                                                                                             |
| FR-002 | Interacción de usuario | Esencial  | Aprobado | El sistema DEBE mostrar al usuario autenticado el listado de tareas asignadas, con los campos que retorne la API de BAW y un resumen de conteos por estado de SLA (a tiempo, en riesgo, vencida).                                              |
| FR-003 | Casos de uso           | Esencial  | Aprobado | El sistema DEBE permitir reclamar ("claim") una tarea no asignada antes de completarla, cuando la API de BAW la reporte como no reclamada.                                                                                                     |
| FR-004 | Casos de uso           | Esencial  | Aprobado | El sistema DEBE renderizar dinámicamente el formulario de la tarea con los campos y datos que la API de BAW exponga, permitir su revisión/edición, y completarla ejecutando una de las acciones ("outcomes") que la API defina para esa tarea. |
| FR-005 | Interacción de usuario | Media     | Aprobado | El sistema DEBE permitir adjuntar un comentario al completar una tarea, cuando la API de BAW lo soporte, y DEBE exigirlo cuando la acción ("outcome") elegida sea de rechazo (ver BR-01).                                                      |
| FR-006 | Salidas del sistema    | Alta      | Aprobado | El sistema DEBE mostrar un listado de instancias de proceso, con filtro Activo/Completado, según lo que la API de BAW soporte.                                                                                                                 |
| FR-007 | Salidas del sistema    | Media     | Aprobado | El sistema DEBE mostrar, por tipo de proceso, indicadores agregados (instancias en curso, duración promedio, tasa de renovación) y, al seleccionar uno, su diagrama con el estado de tareas superpuesto.                                       |
| FR-008 | Salidas del sistema    | Media     | Aprobado | El sistema DEBE mostrar, por grupo/equipo, el estado de los procesos con totales de instancias vencidas, en riesgo y a tiempo.                                                                                                                 |
| FR-009 | Interacción de usuario | Alta      | Aprobado | El sistema DEBE permitir buscar y filtrar dentro de cada listado (Iniciar, Mis tareas, Procesos, Rendimiento) por los criterios que la API de BAW soporte.                                                                                     |
| FR-010 | Reglas de negocio      | Alta      | Aprobado | El sistema DEBE requerir que el usuario esté autenticado contra BAW para acceder a cualquier módulo; esta versión no distingue permisos por rol.                                                                                               |
| FR-011 | Interacción de usuario | Media     | Aprobado | El sistema DEBE permitir al usuario autenticado finalizar su sesión desde cualquier módulo del portal.                                                                                                                                         |

## 7. Requisitos no funcionales

| ID      | Categoría                   | Prioridad | Estado   | Enunciado                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | --------------------------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-001 | Seguridad                   | Esencial  | Aprobado | El sistema DEBE autenticar al usuario contra el endpoint de login de BAW (`/bpm/system/login`) antes de permitir el acceso a cualquier módulo.                                                                                                                                                                                                                                                           |
| NFR-002 | Seguridad                   | Esencial  | Aprobado | El sistema DEBE comunicarse con la API de BAW exclusivamente mediante HTTPS/TLS.                                                                                                                                                                                                                                                                                                                         |
| NFR-003 | Eficiencia de rendimiento   | Media     | Aprobado | El sistema DEBE cargar cada listado principal (Iniciar, Mis tareas, Procesos, Rendimiento) en no más de 3 segundos bajo condiciones normales de red, sin comprometerse a un SLA de concurrencia específico. Las vistas de detalle con contenido variable (formulario dinámico de una tarea, diagrama de un proceso) quedan fuera de este umbral fijo, por depender del volumen de datos que retorne BAW. |
| NFR-004 | Fiabilidad (Disponibilidad) | Media     | Aprobado | La disponibilidad del sistema DEBE depender de la disponibilidad de la API de BAW; no se define un SLA de disponibilidad propio adicional.                                                                                                                                                                                                                                                               |
| NFR-006 | Usabilidad                  | Alta      | Aprobado | El sistema DEBE adaptar su diseño a tres rangos de ancho de pantalla — escritorio (≥1280px), tablet (768–1279px) y móvil (<768px) —, con navegación adaptada (p. ej. menú colapsable) en el rango móvil, además de cumplir los estándares de accesibilidad (WCAG AA) ya definidos en el proyecto base del frontend.                                                                                      |
| NFR-007 | Mantenibilidad              | —         | Aprobado | No aplica como requisito adicional — cubierta por los estándares de arquitectura ya definidos en el proyecto base (fitness functions, dependency-cruiser).                                                                                                                                                                                                                                               |
| NFR-008 | Portabilidad                | —         | Aprobado | No aplica — aplicación web única, sin requisitos de portabilidad entre plataformas o entornos de ejecución.                                                                                                                                                                                                                                                                                              |
| NFR-009 | Idoneidad funcional         | —         | Aprobado | No aplica como característica separada — verificada a través del cumplimiento de los `FR-XXX` de la sección 6.                                                                                                                                                                                                                                                                                           |

## 8. Reglas de negocio

Las reglas de negocio de los procesos de aprobación (niveles, SLA, delegación, etc.) las define y gestiona BAW dentro de sus propias definiciones de proceso; este portal es un cliente que refleja lo que la API expone (campos, historial, acciones disponibles), sin implementar lógica de negocio de aprobación propia. El portal sí impone la siguiente regla de interacción, propia de su UI:

- **BR-01:** El comentario DEBE ser obligatorio cuando el usuario elige la acción ("outcome") de rechazo al completar una tarea; para el resto de las acciones es opcional, sujeto a que la API de BAW soporte comentarios (ver FR-005).

## 9. Interfaces externas

### 9.1 Interfaces de usuario

- Web (navegador): aplicación web responsiva. Sin lineamientos de estilo adicionales más allá de los estándares de accesibilidad (WCAG AA) ya definidos en el proyecto base del frontend.

### 9.2 Interfaces de hardware

- No aplica.

### 9.3 Interfaces de software

- **API REST de IBM BAW:** ambiente de referencia `https://192.168.120.100:9443/bpm/explorer/` (mismo servidor accesible también por su nombre DNS interno `btq-srv-bawodm`), usado también como URL de producción provisional, parametrizada por ambiente (ver riesgo R-01 — debe confirmarse la URL definitiva antes del despliegue real). Expone las capacidades de listado y gestión de tareas, instancias de proceso y rendimiento que consume este portal.

### 9.4 Interfaces de comunicaciones

- **HTTPS/REST:** todas las comunicaciones con la API de BAW se realizan sobre HTTPS (ver NFR-002).

## 10. Requisitos de datos

No aplica — el portal no almacena datos propios; toda la información se consulta en vivo contra BAW, que es quien gobierna su retención y privacidad.

## 11. Cumplimiento normativo

No aplica — no se identificó normativa específica aplicable a este alcance. Cualquier dato personal que se muestre en el portal (p. ej. datos de solicitantes en un formulario de tarea) es gobernado y retenido por BAW, fuera del alcance de este SRS.

## 12. Diseño de interfaz (wireframes)

<!-- srs:ui-required=true -->

**¿Requiere diseño de interfaz?** Sí

**Tipo de solución:** Aplicación web

**¿Debe ser responsiva (adaptable a distintos tamaños de pantalla)?** Sí — con breakpoints definidos en escritorio (≥1280px), tablet (768–1279px) y móvil (<768px), con navegación adaptada en el rango móvil (ver NFR-006).

> **Cerrar sesión (FR-011):** se materializa como un elemento persistente del encabezado, presente en todas las pantallas autenticadas; no se modela como una pantalla propia dado que es un componente de navegación compartido, no una vista independiente.

| Pantalla                                               | Wireframe                                                                            | Estado de revisión | Observaciones ya incorporadas                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Login                                                  | [assets/wireframes/login.md](assets/wireframes/login.md)                             | Aprobado           | Ninguna                                                                                                                   |
| Iniciar                                                | [assets/wireframes/iniciar.md](assets/wireframes/iniciar.md)                         | Aprobado           | Ninguna                                                                                                                   |
| Mis tareas                                             | [assets/wireframes/mis-tareas.md](assets/wireframes/mis-tareas.md)                   | Aprobado           | Ninguna                                                                                                                   |
| Detalle de tarea (incluye estado "Reclamar tarea")     | [assets/wireframes/tarea-detalle.md](assets/wireframes/tarea-detalle.md)             | Aprobado           | Casilla "No volver a mostrarme este mensaje" retirada del diálogo de reclamo (Ola 3): el portal no almacena datos propios |
| Procesos                                               | [assets/wireframes/procesos.md](assets/wireframes/procesos.md)                       | Aprobado           | Ninguna                                                                                                                   |
| Rendimiento del proceso (incluye detalle con diagrama) | [assets/wireframes/rendimiento-proceso.md](assets/wireframes/rendimiento-proceso.md) | Aprobado           | Ninguna                                                                                                                   |
| Rendimiento del equipo                                 | [assets/wireframes/rendimiento-equipo.md](assets/wireframes/rendimiento-equipo.md)   | Aprobado           | Ninguna                                                                                                                   |

## 13. Verificación y trazabilidad

| ID      | Origen                                                                                    | Depende de | Método de verificación | Criterio de verificación                                                                                                                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------- | ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-001  | `references/raw-requirement.md`; capturas en `references/`                                | Ninguna    | Demostración           | El listado de "Iniciar" muestra los procesos que retorna la API de BAW para el usuario, y permite iniciar una instancia con éxito.                                                                                                                                 |
| FR-002  | Capturas en `references/`; conversación con el usuario                                    | Ninguna    | Demostración           | "Mis tareas" muestra las tareas y los conteos de SLA (a tiempo/en riesgo/vencida) exactamente como los retorna la API de BAW.                                                                                                                                      |
| FR-003  | Capturas en `references/` (diálogo "Reclamar tarea")                                      | Ninguna    | Prueba                 | Al abrir una tarea no reclamada aparece el diálogo de reclamo; al confirmar, la tarea queda asignada al usuario en BAW.                                                                                                                                            |
| FR-004  | Capturas en `references/` (formulario "Apertura de cuentas"); conversación con el usuario | FR-003     | Prueba                 | Los campos y acciones mostrados corresponden a los que define la API de BAW para esa tarea; la acción elegida cambia el estado de la tarea en BAW.                                                                                                                 |
| FR-005  | Conversación con el usuario; wireframe `tarea-detalle`                                    | FR-004     | Prueba                 | El comentario ingresado se envía y queda asociado a la tarea completada, cuando la API lo soporta; si la acción elegida es de rechazo, el sistema no permite completar la tarea sin comentario (ver BR-01).                                                        |
| FR-006  | Capturas en `references/`                                                                 | Ninguna    | Demostración           | El listado de "Procesos" refleja el filtro Activo/Completado según la API de BAW.                                                                                                                                                                                  |
| FR-007  | Capturas en `references/`                                                                 | Ninguna    | Demostración           | Al seleccionar un proceso se muestran sus indicadores y diagrama, coincidiendo con los datos de la API de BAW, para todos los tipos de proceso disponibles (sin filtrar por grupo del usuario, dado que no hay diferenciación de roles en esta versión — ver 2.6). |
| FR-008  | Capturas en `references/`                                                                 | Ninguna    | Demostración           | "Rendimiento del equipo" muestra, para todos los grupos disponibles en la API de BAW (sin filtrar por el grupo del usuario, dado que no hay diferenciación de roles en esta versión — ver 2.6), los totales de vencido/en riesgo/a tiempo.                         |
| FR-009  | Conversación con el usuario                                                               | Ninguna    | Prueba                 | Un filtro o término de búsqueda soportado por la API actualiza el listado a los resultados que cumplen el criterio.                                                                                                                                                |
| FR-010  | Conversación con el usuario                                                               | Ninguna    | Prueba                 | Un usuario no autenticado es redirigido al login al intentar acceder a cualquier módulo.                                                                                                                                                                           |
| FR-011  | Validación Ola 3 (revisión cruzada con capturas del portal actual)                        | FR-010     | Demostración           | El usuario autenticado puede finalizar su sesión desde el encabezado de cualquier módulo; tras hacerlo, se le redirige al login y no puede acceder a módulos protegidos sin autenticarse de nuevo.                                                                 |
| NFR-001 | Conversación con el usuario                                                               | FR-010     | Prueba                 | Ninguna sesión inválida accede a un módulo protegido, incluida la que expira durante el uso: cualquier llamada a la API que responda sesión inválida redirige al login y los cambios no guardados del formulario en curso se pierden.                              |
| NFR-002 | Conversación con el usuario                                                               | Ninguna    | Análisis               | Todas las llamadas a la API de BAW se realizan sobre HTTPS.                                                                                                                                                                                                        |
| NFR-003 | Conversación con el usuario                                                               | Ninguna    | Prueba                 | Cada listado principal (Iniciar, Mis tareas, Procesos, Rendimiento) carga en ≤3 segundos bajo condiciones normales de red en el ambiente de referencia; las vistas de detalle no tienen umbral fijo por su contenido variable.                                     |
| NFR-004 | Conversación con el usuario                                                               | Ninguna    | Análisis               | La disponibilidad del portal depende de la de BAW; no hay SLA propio adicional.                                                                                                                                                                                    |
| NFR-006 | Conversación con el usuario                                                               | Ninguna    | Prueba                 | El layout se recompone correctamente en los tres breakpoints definidos (≥1280px, 768–1279px, <768px), incluida la navegación colapsable en móvil, sin pérdida de funcionalidad.                                                                                    |

## 14. Riesgos

| ID   | Riesgo                                                                                                                                                                                                   | Probabilidad | Impacto | Mitigación                                                                                                                                                                                                                                                                                                                          | Relacionado con                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| R-01 | El ambiente de referencia de la API de BAW usa una IP interna (`192.168.120.100`, también accesible como `btq-srv-bawodm`); se adoptó como URL de producción provisional hasta contar con la definitiva. | Media        | Alto    | Endpoint parametrizado por ambiente (ya decidido); confirmar la URL de producción definitiva antes de desplegar a producción real.                                                                                                                                                                                                  | Stack / Interfaces de software |
| R-02 | El alcance funcional real depende de lo que la API REST de BAW exponga; podría no soportar todas las acciones esperadas.                                                                                 | Media        | Alto    | Validar el contrato real de la API en la fase técnica (`design-define`) antes de implementar cada módulo.                                                                                                                                                                                                                           | FR-001, FR-004                 |
| R-03 | Renderizar formularios dinámicos genéricos para procesos con estructuras de datos muy distintas es complejo; el material de referencia sugiere además campos de tipo adjunto/archivo.                    | Media        | Media   | Diseñar un motor de renderizado basado en tipos de datos comunes (texto, número, booleano, fecha) e iterar con procesos reales; los tipos adicionales candidatos (archivos/adjuntos, listas de selección) deben confirmarse contra el contrato real de la API de BAW en la fase técnica (`design-define`), mismo criterio que R-02. | FR-004                         |
| R-04 | Sin backend propio ni redundancia, una caída del login/API de BAW deja el portal completamente inoperativo.                                                                                              | Baja         | Alto    | Mensaje claro de error y reintento; alta disponibilidad propia queda fuera de alcance.                                                                                                                                                                                                                                              | NFR-004                        |

## 15. Enlaces y archivos de apoyo

- **Requerimiento original:** [references/raw-requirement.md](references/raw-requirement.md)
- **Capturas del Process Portal actual de BAW (referencia de modernización):** ver carpeta [references/](references/) (11 capturas)
- **Wireframes:** [assets/wireframes/](assets/wireframes/)

## 16. Historias de usuario derivadas

| US-XXX                                                                               | Título                                           | FR-XXX cubiertos                                   |
| ------------------------------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------- |
| [US-001](../../../archive/user-stories/US-001-autenticacion-acceso-portal/README.md) | Autenticación y acceso al portal                 | FR-010, FR-011, NFR-001, NFR-002, NFR-004, NFR-006 |
| [US-002](../../../archive/user-stories/US-002-iniciar-nuevos-procesos/README.md)     | Iniciar nuevos procesos                          | FR-001                                             |
| [US-003](../../../archive/user-stories/US-003-mis-tareas-listado-sla/README.md)      | Mis tareas — listado y SLA                       | FR-002, FR-009, NFR-003                            |
| [US-004](../../../archive/user-stories/US-004-procesos-instancias/README.md)         | Procesos — instancias en ejecución y completadas | FR-006, FR-009, NFR-003                            |
| [US-005](../../../archive/user-stories/US-005-rendimiento-proceso/README.md)         | Rendimiento del proceso                          | FR-007, FR-009, NFR-003                            |
| [US-006](../../../archive/user-stories/US-006-rendimiento-equipo/README.md)          | Rendimiento del equipo                           | FR-008, FR-009, NFR-003                            |
| [US-007](../../../archive/user-stories/US-007-reclamar-completar-tarea/README.md)    | Reclamar y completar tarea                       | FR-003, FR-004, FR-005, BR-01                      |

## Observaciones

- Ninguna.

## Validación

### Definition of Ready (DoR)

| Criterio DoR                                      | Estado             | Notas                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack tecnológico resuelto                        | Cumple             | Frontend, backend, base de datos e infraestructura decididos; la URL de producción de la API de BAW se resolvió usando el ambiente de referencia como valor provisional parametrizado por ambiente (ver sección 3 y riesgo R-01).                                                                                                                                                                              |
| Repositorios y proyecto base definidos            | Cumple             | `frontend`, Nuevo, proyecto base `angular-base`.                                                                                                                                                                                                                                                                                                                                                               |
| Requisitos funcionales completos y priorizados    | Cumple             | 11 `FR-XXX` (se agregó FR-011, cierre de sesión, hallazgo de Ola 3), todos con categoría, prioridad y estado Aprobado.                                                                                                                                                                                                                                                                                         |
| Requisitos no funcionales revisados y priorizados | Cumple             | Cubre explícitamente Seguridad, Rendimiento, Fiabilidad/Disponibilidad y Usabilidad (NFR-006, breakpoints, hallazgo de Ola 3); el resto marcado No aplica con justificación.                                                                                                                                                                                                                                   |
| Interfaces externas revisadas                     | Cumple             | Usuario y software revisadas; hardware y comunicaciones declaradas explícitamente (No aplica / HTTPS).                                                                                                                                                                                                                                                                                                         |
| Requisitos de datos formalizados                  | Cumple (No aplica) | El portal no maneja datos propios; justificado.                                                                                                                                                                                                                                                                                                                                                                |
| Cumplimiento normativo trazado                    | Cumple (No aplica) | Sin normativa identificada; justificado.                                                                                                                                                                                                                                                                                                                                                                       |
| Diseño de interfaz revisado                       | Cumple             | 7 pantallas, todas en estado Aprobado (una con ajuste de Ola 3, ver tabla de la sección 12).                                                                                                                                                                                                                                                                                                                   |
| Verificación y trazabilidad completas             | Cumple             | Los 11 `FR-XXX` y los 5 `NFR-XXX` aplicables tienen origen, método y criterio de verificación.                                                                                                                                                                                                                                                                                                                 |
| Riesgos identificados                             | Cumple             | 4 riesgos registrados con probabilidad, impacto y mitigación.                                                                                                                                                                                                                                                                                                                                                  |
| Alcance y fuera de alcance claros                 | Cumple             | Sección 1.2 delimita alcance y fuera de alcance explícitamente.                                                                                                                                                                                                                                                                                                                                                |
| Sin aclaraciones pendientes                       | Cumple             | Observaciones sin pendientes.                                                                                                                                                                                                                                                                                                                                                                                  |
| Validación final (Ola 3) superada                 | Cumple             | Análisis de gaps, revisión cruzada y validación con subagente sin contexto de sesión ejecutados; los hallazgos (cierre de sesión, sesión expirada, comentario obligatorio al rechazar, casilla de preferencia retirada, alcance de tipos de campo, alcance de rendimiento por grupo, host de referencia, umbral de carga y breakpoints de responsividad) se resolvieron y quedaron reflejados en el documento. |
