# Progreso

## US-007-reclamar-completar-tarea

<!-- work:id=US-007 · status=Done -->

**Estado:** Done
**Tipo:** historia de usuario
**Fecha de creación:** 2026-09-13 22:34
**Ultima actualizacion:** 2026-09-14 00:11

## Unidades

### TK-001: Formulario dinámico de detalle de tarea

<!-- unit:id=TK-001 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-13 22:40
**Finalizado:** 2026-09-14 04:31
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- src/app/features/baw-processes/models/task-form-field.ts
  ~ src/app/features/baw-processes/models/user-task.ts
- src/app/features/baw-processes/services/task-detail-repository.ts
- src/app/features/baw-processes/services/task-detail-repository.spec.ts
  ~ src/app/features/baw-processes/utils/task-mapper.ts
  ~ src/app/features/baw-processes/utils/task-mapper.spec.ts
- src/app/features/baw-processes/components/task-detail/task-detail.ts
- src/app/features/baw-processes/components/task-detail/task-detail.html
- src/app/features/baw-processes/components/task-detail/task-detail.spec.ts
- src/app/features/baw-processes/components/task-detail/dynamic-task-form/dynamic-task-form.ts
- src/app/features/baw-processes/components/task-detail/dynamic-task-form/dynamic-task-form.html
- src/app/features/baw-processes/components/task-detail/dynamic-task-form/dynamic-task-form.spec.ts
  ~ src/app/features/baw-processes/baw-processes-routes.ts
  ~ src/app/features/baw-processes/components/tasks/tasks.ts
  ~ src/app/features/baw-processes/components/tasks/tasks.html
  ~ src/app/features/baw-processes/components/tasks/tasks.spec.ts
- src/mocks/tasks/user-task-detail.handlers.ts
- src/mocks/tasks/user-task-detail.handlers.spec.ts
  ~ src/mocks/handlers.ts
  `

**Notas:**

- Al validar en la rama del artefacto tras el merge: typecheck limpio, `eslint` limpio sobre los archivos afectados, y tests acotados en verde (78/80) — las 2 fallas restantes (`tasks.spec.ts` e `sla-summary.spec.ts`, ambas sobre el texto "página cargada/página") son preexistentes de US-003/TK-004, no tocan ningún archivo de esta unidad, y se reprodujeron igual contra el `HEAD` previo a este trabajo.

**Decisiones adicionales:**

- `task-detail` sin capa Manager: usa `getResource()` directo sobre `TaskDetailRepository` en el propio componente (fetch simple por id; ADR-011 solo exige Manager si hay orquestación real).
- `DynamicTaskForm` arma el `FieldTree` de Signal Forms una sola vez (`ngOnInit`), no de forma reactiva vía `computed()`: `form()` registra un `effect()` interno que no puede ejecutarse dentro de otro reactivo (`NG0602`); el conjunto de campos de una tarea no cambia en la vida del componente, así que es seguro.
- Cada campo del formulario se siembra con un valor por defecto tipado (`''`/`null`/`false` según `type`) en vez de dejar pasar `value` indefinido: un valor `undefined` hace que Signal Forms trate la clave como ausente y no materialice el nodo del campo.
- Controles nativos (`input`/`select`), no Angular Material, dentro de `DynamicTaskForm`: son los únicos tipos de elemento con soporte nativo bien documentado para `[formField]` de Signal Forms en esta versión.
- `required`/`readOnly` se declaran vía el schema de Signal Forms (`required()`, `readonly()`, `disabled()`) en vez de bindings manuales, que el compilador prohíbe junto a `[formField]`; los campos `readOnly` de tipo `boolean`/`select` usan `disabled()` en vez de `readonly()` porque el atributo HTML `readonly` no afecta checkboxes/selects nativos.
- Campos `type: 'file'` siempre de solo lectura: un navegador no permite fijar el valor de un `<input type="file">` por script, y la carga real de adjuntos es alcance de TK-002/TK-003.
- `tasks.ts` se modificó además de `tasks.html` (no estaba en el árbol original del TK): Angular exige declarar `RouterLink` en `imports` del componente standalone para usar `[routerLink]` en su plantilla.

### TK-002: Reclamar tarea

<!-- unit:id=TK-002 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-14 04:32
**Finalizado:** 2026-09-14 04:52
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- src/mocks/tasks/user-task-claim.handlers.ts
- src/mocks/tasks/user-task-claim.handlers.spec.ts
  ~ src/mocks/handlers.ts
  ~ src/app/features/baw-processes/services/task-detail-repository.ts
  ~ src/app/features/baw-processes/services/task-detail-repository.spec.ts
- src/app/features/baw-processes/components/task-detail/claim-task-dialog/claim-task-dialog.ts
- src/app/features/baw-processes/components/task-detail/claim-task-dialog/claim-task-dialog.html
- src/app/features/baw-processes/components/task-detail/claim-task-dialog/claim-task-dialog.spec.ts
  ~ src/app/features/baw-processes/components/task-detail/task-detail.ts
  ~ src/app/features/baw-processes/components/task-detail/task-detail.html
  ~ src/app/features/baw-processes/components/task-detail/task-detail.spec.ts
  `

**Notas:**

- Verificación en la rama del artefacto tras el merge: typecheck limpio, lint limpio, 73/75 tests acotados en verde (mismas 2 fallas preexistentes de US-003 documentadas en TK-001).
- El subagente reportó `npm run arch` (gate completo) en 17/18 criterios PASS; el único FAIL es cobertura global arrastrada por las mismas 2 fallas preexistentes, no por esta unidad.
- Fuera del plan de TK-002, para poder probar manualmente en el navegador (pedido del usuario): se habilitó el arranque del worker MSW en modo desarrollo (`src/main.ts`, `isDevMode()` + `onUnhandledRequest: 'bypass'`), se conectó el botón "Ejecutar" del listado "Mis tareas" (antes deshabilitado con un comentario obsoleto de "US-007 aún Draft") a la misma ruta `tasks/:id` que ya usaba el nombre de la tarea, y se agregó un id reservado `UNCLAIMED_TASK_ID` (`task-unclaimed`) al mock de detalle para poder ver el diálogo de reclamo sin tocar la lista real. Ver commits `e1f82da` y `c74509f`.

**Decisiones adicionales:**

- No se tocó `tasks-manager.ts`: ya exponía `reload()` público, reusado para refrescar el listado tras un 409.
- `claim()` del repositorio devuelve un resultado discriminado (`{status:'claimed'|'conflict', ...}`) en vez de lanzar excepción para el 409, ya que FL-03/API-07 lo documentan como caso normal.
- El éxito del reclamo reutiliza el detalle completo que ya devuelve la propia respuesta de `claim` (API-07), sin una segunda `GET`.
- "Cancelar" en el diálogo navega a `/tasks` (sin tarea reclamada no hay nada más que mostrar).
- `ClaimTaskDialog` es presentacional, renderizado inline vía `@if` (no `MatDialog`/CDK, para no introducir un segundo mecanismo de diálogos); usa una directiva de autofocus ya existente, `role="dialog"`/`aria-modal`/`aria-labelledby`, y `Escape` equivalente a "Cancelar".
- La notificación del 409 usa nivel `warning`, no `error`, acorde a "no tratarlo como error inesperado".

### TK-003: Completar tarea con comentario condicional

<!-- unit:id=TK-003 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-14 04:53
**Finalizado:** 2026-09-14 00:11
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- src/app/features/baw-processes/models/task-action.ts
  ~ src/app/features/baw-processes/models/user-task.ts
  ~ src/app/features/baw-processes/utils/task-mapper.ts
  ~ src/app/features/baw-processes/utils/task-mapper.spec.ts
  ~ src/app/features/baw-processes/services/task-detail-repository.ts
  ~ src/app/features/baw-processes/services/task-detail-repository.spec.ts
- src/app/features/baw-processes/components/task-detail/task-action-bar/task-action-bar.ts
- src/app/features/baw-processes/components/task-detail/task-action-bar/task-action-bar.html
- src/app/features/baw-processes/components/task-detail/task-action-bar/task-action-bar.spec.ts
  ~ src/app/features/baw-processes/components/task-detail/task-detail.ts
  ~ src/app/features/baw-processes/components/task-detail/task-detail.html
  ~ src/app/features/baw-processes/components/task-detail/task-detail.spec.ts
  ~ src/app/features/baw-processes/components/task-detail/dynamic-task-form/dynamic-task-form.ts
  ~ src/app/features/baw-processes/components/task-detail/dynamic-task-form/dynamic-task-form.spec.ts
  ~ src/app/features/baw-processes/components/task-detail/claim-task-dialog/claim-task-dialog.spec.ts
  ~ src/mocks/tasks/user-task-detail.handlers.ts
  ~ src/mocks/tasks/user-task-detail.handlers.spec.ts
  ~ src/mocks/tasks/user-task-claim.handlers.ts
- src/mocks/tasks/user-task-complete.handlers.ts
- src/mocks/tasks/user-task-complete.handlers.spec.ts
  ~ src/mocks/handlers.ts
  `

**Notas:**

- Verificación en la rama del artefacto tras el merge (las 3 TK ya integradas): typecheck limpio, lint limpio, 171/173 tests acotados a `baw-processes` + `mocks` en verde — mismas 2 fallas preexistentes de US-003 documentadas en TK-001/TK-002, no relacionadas.
- El subagente reportó, sobre su propio worktree: suite completa 468/470 en verde y `npm run arch` en 17/18 criterios PASS (el único FAIL es la cobertura global, arrastrada por las mismas 2 fallas preexistentes).
- El repo no tiene pruebas e2e para este feature (solo `e2e/example.spec.ts` de plantilla); ninguna de las 3 TK de esta historia definió un escenario E2E, así que no hay nada que ejecutar en el cierre a ese nivel.

**Retrabajo de cierre (2026-09-14, delegado desde `quality-check` al cerrar US-003):** `task-detail.html` nunca renderizaba `<app-task-action-bar>` (el `viewChild(TaskActionBar)` siempre resolvía `undefined`), rompiendo 12 tests de `task-detail.spec.ts` con `TypeError: trackAction`. Se restructuró la plantilla (los dos `@if(showClaimDialog())/@else` de `mat-dialog-content` y `mat-dialog-actions` se unieron en uno solo) para que `<app-task-action-bar [submitting]="completing()" (confirmed)="onActionConfirm($event, dynamicForm.values())" />` comparta el scope de `#dynamicForm`, tal como ya documentaba el docstring de `onActionConfirm`. No se tocó ninguna aserción de test. El commit con este arreglo (aún sin comitear al escribir esta nota) va en la rama `feature/US-003-mis-tareas-listado-sla`, no en una rama propia de US-007 — quedó ahí porque el defecto solo se detectó al correr `quality-check` en el cierre de US-003.

**Decisiones adicionales:**

- Payload de `complete()`: un único objeto plano de variables de negocio `{ variables: { ...formValues, [action.name]: action.value, comment } }`, consistente con MD-07/API-08 y con el alcance reducido de US-007 (el comentario viaja como variable, no vía el mecanismo nativo de BAW).
- `TaskAction` se usa como shape único para el DTO del mock y el modelo de dominio, pasando igual por `TaskMapper.mapActionDtoToAction` (aunque hoy sea 1:1) para mantener el punto único de normalización por entidad (ADR-012).
- `DynamicTaskForm` expone un signal `values` (computed sobre el árbol de Signal Forms) en vez de un `output()`, de solo lectura, consultado puntualmente al confirmar una acción.
- `TaskActionBar` no tiene un paso de "selección" separado: cada botón elige y confirma su propio outcome; el gating de comentario obligatorio (BR-01) se evalúa por botón.
