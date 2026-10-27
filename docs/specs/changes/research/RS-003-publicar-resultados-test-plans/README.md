# RS-003 — Publicar resultados de corrida en Azure Test Plans

<!-- rs:status=Ready -->

**Estado:** Ready
**Fecha:** 2026-10-26
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202

## Pregunta de investigación

¿Cómo publicar, cuando se decida, una corrida local de Playwright o Maestro dentro de un Test Plan de Azure DevOps?

## Contexto

La necesidad es una corrida hecha en la máquina de quien prueba, subida al Test Plan solo cuando esa persona lo pide. Cada `npm test` no publica, y el pipeline no es el disparador.

[ADR-008](../../../../adr/ADR-008-azure-devops-test-case-traceability.md) y el requisito `azure-devops-traceability` del [estándar de Testing](../../../../standards/testing.md) hablan de otra obligación: el pipeline asocia cada resultado con su Test Case por API. [CR-012](../../../../standards/testing.md) sigue en `Pending`. Esa obligación del pipeline queda aparte. Este informe responde la publicación local y voluntaria.

[azure-pipelines.yml](../../../../../azure-pipelines.yml) ya publica `test-results/junit.xml` y `test-results/maestro/junit.xml` con `PublishTestResults@2`. Esa tarea llena la pestaña Tests del build. No crea una corrida dentro de un Test Plan.

Playwright 1.63 escribe el JUnit en cada ejecución, también en local, porque [playwright.config.ts](../../../../../playwright.config.ts) declara el reporter con `outputFile: 'test-results/junit.xml'` y sin `includeProjectInTestName`. Maestro lo escribe desde [scripts/maestro/run.mjs](../../../../../scripts/maestro/run.mjs) en `test-results/maestro/junit.xml`. En `tests/maestro/` no hay flujos YAML. `npm run clean:results` borra Allure y deja `test-results/` intacto, así que el JUnit de la última corrida sigue disponible para publicarlo después.

El repositorio no declara organización, proyecto ni plan. [`.env.example`](../../../../../.env.example) no tiene variables de Azure DevOps. `.env` está en [`.gitignore`](../../../../../.gitignore). [`.mcp.json`](../../../../../.mcp.json) registra Playwright y Maestro. El MCP de Azure DevOps de esta sesión es el servidor local.

## Hallazgos

### Dos destinos distintos

Azure DevOps separa la pestaña Tests del build y el progreso de un Test Plan.

`PublishTestResults@2` admite JUnit y muestra la corrida en el resumen del pipeline. Sus parámetros no incluyen plan, suite ni Test Case. La documentación de la tarea, consultada el 2026-10-26, describe ese destino como Azure Pipelines. Una corrida local no pasa por esa tarea.

El progreso de un Test Plan se calcula sobre test points: cada point es un Test Case del plan emparejado con una configuración. Una corrida de plan es un conjunto de esos points, y el resultado es el desenlace de ejecutarlos. Para que el plan cambie hace falta una corrida vinculada al plan, o una actualización directa del point.

La asociación manual «Associate Test Case» deja un solo método automatizado por Test Case. [ADR-008](../../../../adr/ADR-008-azure-devops-test-case-traceability.md) permite varias pruebas por caso, y el estándar rechaza el paso manual.

La API de Test Management (versión 7.1, vigente al consultar el 2026-10-26) cubre el plan:

- `POST .../_apis/test/runs` crea la corrida. El cuerpo puede indicar `plan`, `pointIds` y `automated`. La referencia al build es opcional: una corrida local se crea sin `Build.BuildId` y aparece en el plan con el nombre y la fecha que le ponga quien publica.
- `POST .../_apis/test/runs/{runId}/results` agrega cada resultado con el Test Case, el point y el outcome.
- Completar la corrida cierra el ciclo. El point conserva ese resultado como último desenlace.
- `PATCH` del test point marca el outcome y no guarda la corrida con duración y error.

El alcance OAuth documentado para escribir corridas y points es `vso.test_write`. Marcar desenlaces sobre un plan que ya existe cabe en el acceso Basic. Crear y administrar planes exige Basic + Test Plans.

### Corrida local, bajo demanda

El JUnit de la última ejecución local es la corrida que se sube. Quien publica lanza un comando distinto de `npm test`, cuando ya vio el resultado y quiere dejarlo en su plan. Una corrida parcial (`playwright test` sobre unos archivos, o un flujo de Maestro) reescribe el XML con esos casos: al publicarlo, el plan recibe solo esos `TC-<id>`. Los points que no vienen en el archivo conservan el desenlace anterior.

En local no hay token del pipeline. La llamada usa un PAT con escritura de pruebas, leído desde `.env` por el mismo `dotenv` que ya usa [playwright.config.ts](../../../../../playwright.config.ts). Organización, proyecto e identificador del plan van en ese archivo, y los nombres sin valor van a [`.env.example`](../../../../../.env.example). El PAT no se commitea.

`package.json` no depende de un cliente de Azure DevOps. Node.js 20 incluye `fetch`. El comando puede llamar la API sin una librería nueva.

### Lo que ya produce el JUnit

El reporter JUnit de Playwright 1.63 (etiqueta `release-1.63`) escribe en cada `testcase` un `name` igual a `test.titlePath().slice(3)` unido con `›`. Ese corte quita la raíz, el proyecto y el archivo. Con `acceptanceCriterion()`, el `name` queda como `US-<id>: … › AC-<id>: … › TC-<id>: …`. El identificador se busca dentro del nombre, no al inicio. `classname` es el archivo. El proyecto va en `hostname` del `testsuite`.

Los proyectos `chromium` y `Mobile Chrome` ejecutan los mismos specs E2E. El mismo `TC-<id>` sale dos veces, con el mismo `name`. Las pruebas API salen una vez, en `api-tests`. La suite `@human` no forma parte de `npm test`.

Maestro entra por el mismo lector cuando el nombre del flujo lleva `TC-<id>:`. Hoy no hay flujos ni un XML de ejemplo en el repo.

### MCP de Azure DevOps

El servidor local (`docs/TOOLSET.md` de `microsoft/azure-devops-mcp`, rama `main`, consultada el 2026-10-26) y el MCP de esta sesión listan planes, suites y casos, los crean y leen resultados de un build. No crean corridas ni escriben outcomes.

El servidor remoto (`https://mcp.dev.azure.com`, documentación con `ms.date` 2026-09-21) añade `testplan_test_run_write`: `create_run` (descrita como corrida de ejecución manual), `update_results`, `complete_run` y `update_test_point_outcome`. El issue 1177, cerrado el 2026-07-14, sitúa esas acciones en el remoto. El catálogo local de `main` sigue sin ellas. El remoto no está en [`.mcp.json`](../../../../../.mcp.json), pide un registro de aplicación en Microsoft Entra y opera una corrida o un point por llamada. No ingiere un JUnit. Publicar exigiría una sesión de agente cada vez que se decide subir una corrida local.

### Opciones de terceros

`PublishTestPlanResults` y `ado-sync` crean corridas y emparejan por nombre de prueba o por un formato propio. Aquí el vínculo estable es `TC-<id>:` dentro de un `name` que también lleva historia y criterio. Esas herramientas añaden otro emparejamiento y una dependencia externa.

## Decisiones pendientes / opciones evaluadas

- **Mecanismo** — opciones: comando local que lee el JUnit y llama la API / publicar en cada `npm test` / `PublishTestResults@2` / MCP local / MCP remoto / CLI de terceros. Recomendación: un comando local aparte, lanzado cuando se quiere subir la última corrida al plan. `npm test` solo genera el JUnit. `PublishTestResults@2` sigue en el pipeline para la pestaña Tests del build. El MCP no escribe el JUnit de una corrida local.
- **Desenlace cuando un Test Case tiene varias pruebas en esa corrida** — opciones: Failed si alguna falla / el último resultado escrito / un point por proyecto. Recomendación: Failed si alguna prueba de ese `TC-<id>` falló en el archivo que se publica, Passed solo si todas pasaron. Escritorio y móvil comparten identificador en una corrida completa.

## Conclusión y recomendación

La publicación cabe en un comando local. Se lanza después de la corrida, solo cuando se quiere dejar esa corrida dentro del Test Plan.

El comando lee `test-results/junit.xml` y, si existe, `test-results/maestro/junit.xml`. Extrae cada `TC-<id>:`. Con organización, proyecto y plan tomados de `.env`, y un PAT de escritura de pruebas en el mismo archivo, resuelve los test points de ese plan, abre una corrida automatizada sin build, carga un resultado por prueba y la completa. Si un `TC-<id>` del archivo no está en el plan, lo anota en el log y sigue. El comando falla si falla la API.

Los points que no vienen en ese JUnit no se tocan. Así una corrida parcial actualiza solo lo que se ejecutó.

`PublishTestResults@2` se queda en [azure-pipelines.yml](../../../../../azure-pipelines.yml) para la pestaña Tests de CI. No es el camino de esta corrida local, y tampoco cumple [CR-012](../../../../standards/testing.md).

El MCP queda para consultar planes y resultados. No es el publicador.

El trabajo siguiente es ese comando en este repositorio de pruebas. [ADR-008](../../../../adr/ADR-008-azure-devops-test-case-traceability.md) sigue describiendo la asociación del pipeline; la corrida local voluntaria es un camino adicional y, si se quiere dejarlo en la decisión, el ajuste es de `arch-manage`.

## Impacto en el artefacto / próximo paso

N/A — investigación independiente

## Fuentes

- [PublishTestResults@2](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-test-results-v2?view=azure-pipelines), consultada el 2026-10-26. Publica en Azure Pipelines; no recibe plan ni Test Case.
- [Associate automated tests with test cases](https://learn.microsoft.com/en-us/azure/devops/test/associate-automated-test-with-test-case?view=azure-devops), consultada el 2026-10-26. Asociación manual; un Test Case, un método.
- [Runs - Create, API 7.1](https://learn.microsoft.com/en-us/rest/api/azure/devops/test/runs/create?view=azure-devops-rest-7.1), consultada el 2026-10-26. Corrida con `plan` y `pointIds`. La referencia al build es opcional.
- [Test Management](https://learn.microsoft.com/en-us/rest/api/azure/devops/test/?view=azure-devops-rest-7.0), consultada el 2026-10-26. Una corrida es un conjunto de test points.
- [Test Point - Update, API 7.1](https://learn.microsoft.com/en-us/rest/api/azure/devops/testplan/test-point/update?view=azure-devops-rest-7.1), consultada el 2026-10-26. Alcance `vso.test_write`.
- [Manual test access and permissions](https://learn.microsoft.com/en-us/azure/devops/test/manual-test-permissions?view=azure-devops), consultada el 2026-10-26. Marcar desenlaces con acceso Basic; administrar planes con Basic + Test Plans.
- [Remote Azure DevOps MCP Server](https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops), `ms.date` 2026-09-21. Acciones `testplan_test_run_write`.
- [TOOLSET.md del MCP local](https://github.com/microsoft/azure-devops-mcp/blob/main/docs/TOOLSET.md), rama `main`, consultada el 2026-10-26. Sin escritura de corridas.
- [Issue 1177, azure-devops-mcp](https://github.com/microsoft/azure-devops-mcp/issues/1177), cerrado el 2026-07-14. Las acciones de corrida quedaron en el servidor remoto.
- [Reporter JUnit de Playwright 1.63](https://github.com/microsoft/playwright/blob/release-1.63/packages/playwright/src/reporters/junit.ts), `name` = `titlePath().slice(3)`.
- [Reporters de Playwright](https://playwright.dev/docs/test-reporters), opción `includeProjectInTestName`.
