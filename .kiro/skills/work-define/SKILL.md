---
name: work-define
description: Sincronizar work items de Azure DevOps con especificaciones locales del proyecto. Utilizar cuando se necesite sincronizar un work item desde Azure DevOps hacia la estructura de especificaciones local del proyecto. Activar con /work-define sync {id} para sincronizar un work item específico.
triggers:
  - work-define
  - work-define sync
  - sync work item
  - sincronizar work item
  - sincronizar azure devops
---

# Work Define Skill - Azure DevOps Sync

Sincroniza work items de Azure DevOps con las especificaciones locales del proyecto, mapeando la información del work item hacia la estructura estándar del proyecto.

## Capacidades

- Sincronización de work items desde Azure DevOps hacia especificaciones locales
- Mapeo de campos de Azure DevOps a la estructura local del proyecto
- Creación de historias de usuario basadas en work items de Azure DevOps
- Preservación de la trazabilidad entre Azure DevOps y el repositorio local

## Configuración requerida

Este skill requiere:

- MCP de Azure DevOps configurado como servidor "ado"
- Configuración del proyecto en `.sdd-devkit/settings.json`
- Estructura de carpetas `docs/specs/changes/` configurada

## Comando principal: sync

**Sintaxis:** `/work-define sync {work-item-id}`

**Ejemplo:** `/work-define sync 29799`

### Proceso de sincronización

1. **Obtener work item de Azure DevOps**
   - Conectar al MCP "ado" configurado
   - Recuperar el work item por ID usando las herramientas disponibles del MCP
   - Obtener campos principales: título, descripción, estado, tipo, asignado, etc.
   - Recuperar relaciones: parent, child, related work items
   - Obtener historial de cambios si está disponible

2. **Mapear campos a estructura local**

   | Campo Azure DevOps  | Campo local                             |
   | ------------------- | --------------------------------------- |
   | ID                  | Work Item (ADO) en cabecera             |
   | Title               | Título de la historia/requerimiento     |
   | Description         | Descripción base                        |
   | Work Item Type      | Tipo de artefacto (User Story → US-XXX) |
   | State               | Estado                                  |
   | Assigned To         | Responsable                             |
   | Area Path           | Área/Módulo                             |
   | Iteration Path      | Sprint/Iteración                        |
   | Tags                | Etiquetas                               |
   | Acceptance Criteria | Criterios de aceptación AC-XXX          |

3. **Crear estructura local**
   - Determinar el siguiente ID disponible (US-XXX para User Stories)
   - Crear carpeta en `docs/specs/changes/user-stories/US-XXX-{slug}/`
   - Generar `README.md` con la estructura estándar
   - Incluir referencia al work item original en la cabecera
   - Mapear criterios de aceptación si están definidos
   - Establecer estado inicial basado en el estado de Azure DevOps

4. **Configurar trazabilidad**
   - Mantener referencia bidireccional entre work item y artefacto local
   - Documentar la fecha de sincronización
   - Registrar el origen de los datos en la sección de observaciones

## Mapeo de tipos de work item

| Azure DevOps Type    | Artefacto local                                   |
| -------------------- | ------------------------------------------------- |
| User Story           | Historia de Usuario (US-XXX)                      |
| Product Backlog Item | Historia de Usuario (US-XXX)                      |
| Bug                  | Bug report en estructura de US                    |
| Task                 | Tarea técnica (TK-XXX) - requiere skill work-plan |
| Feature              | Epic/Feature - estructura específica              |

## Estados mapeados

| Azure DevOps State | Estado local |
| ------------------ | ------------ |
| New/Proposed       | Draft        |
| Active/Approved    | Ready        |
| Committed          | In Progress  |
| Done/Closed        | Completed    |

## Configuración del proyecto

El skill lee la configuración de `.sdd-devkit/settings.json`:

```json
{
  "projectManagement": {
    "enabled": true,
    "provider": "azure-devops",
    "host": "https://dev.azure.com/BayteqDev",
    "workspace": "BayteqDev",
    "project": "Bayteq - Sistema de Gestión Normativas"
  },
  "language": "es"
}
```

## Ejemplo de uso

```
Usuario: /work-define sync 29799
```

El skill:

1. Conecta a Azure DevOps usando el MCP "ado"
2. Obtiene el work item 29799
3. Lo mapea a una historia de usuario local
4. Crea US-XXX-{slug} con toda la información
5. Mantiene la referencia al work item original

## Herramientas del MCP requeridas

El skill espera que el MCP de Azure DevOps exponga herramientas para:

- Obtener work items por ID
- Leer campos y propiedades
- Obtener relaciones entre work items
- Acceder a criterios de aceptación y descripciones detalladas

## Validaciones

- Verificar que el work item existe en Azure DevOps
- Confirmar que no existe ya una sincronización previa del mismo work item
- Validar que la configuración de Azure DevOps está completa
- Verificar conectividad con el MCP "ado"

## Estructura del README.md generado

El artefacto local sigue la estructura estándar del proyecto:

```markdown
# US-XXX - {Título del work item}

**Work Item (ADO):** [{ID}]({URL del work item})
**Estado:** {Estado mapeado}
**Última actualización:** {fecha de sync}

## Descripción

{Descripción del work item de Azure DevOps}

## Criterios de aceptación

{Mapeo de acceptance criteria si están definidos en Azure DevOps}

## Referencias

- Work Item original: [{ID}]({URL})
- Sincronizado el: {fecha/hora}

## Observaciones

- Sincronizado desde Azure DevOps work item {ID}
- Datos originales preservados en la referencia
- {Notas adicionales del mapeo}
```

## Handoffs y próximos pasos

Después de la sincronización, sugerir:

- Refinar criterios de aceptación con `/work-define update`
- Definir casos de prueba con `/test-define`
- Crear tareas técnicas con `/work-plan`

## Limitaciones

- Solo sincroniza desde Azure DevOps hacia local (unidireccional)
- No actualiza automáticamente cambios posteriores en Azure DevOps
- Requiere re-sincronización manual para actualizaciones
- Dependiente de la disponibilidad y configuración del MCP "ado"
