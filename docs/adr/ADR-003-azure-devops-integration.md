---
id: ADR-003
status: Accepted
last_update: 2026-09-22
deciders: [Equipo de QA]
tags: [azure-devops, testing, traceability]
supersedes: null
superseded_by: null
emits: []
---

# ADR-003: Integración Directa con Azure DevOps Test Cases

## Contexto

Necesitamos establecer trazabilidad entre test cases manuales y pruebas automatizadas, así como generar reportes que sean útiles para stakeholders técnicos y no técnicos. La organización ya utiliza Azure DevOps para gestión de proyectos y test cases.

Drivers de la elección:

- Conexión directa entre test cases manuales y automatizados.
- Aprovecha una herramienta ya establecida en la organización.
- Los reportes llegan a stakeholders no técnicos.
- La integración encaja con Azure Pipelines.
- Facilita auditorías y el seguimiento de la cobertura de testing.
- Mejora la comunicación entre QA y desarrollo.

## Decisión

Implementamos **integración directa con Azure DevOps Test Cases** para mapear resultados de testing automatizado con test cases existentes.

## Alternativas consideradas

- **TestRail**: herramienta adicional que requiere otra integración.
- **Zephyr**: costo adicional y curva de aprendizaje.
- **Excel o seguimiento manual**: no escala y es propenso a errores.
- **Solución a medida**: overhead de desarrollo y mantenimiento.

## Consecuencias

### Positivas

- Visibilidad de la cobertura de test cases.
- El reporting y las métricas se automatizan.
- Mejor colaboración entre equipos.
- Aprovecha la inversión existente en Azure DevOps.
- Facilita compliance y auditorías.

### Negativas / trade-offs

- Dependencia de Azure DevOps para la evolución de las capacidades.
- Hay que mantener sincronizados el código de las pruebas y los test cases.
- El alcance queda limitado por las APIs de Azure DevOps.
- El arranque exige configurar APIs y autenticación.
- El equipo necesita formación para usar la integración.

## Referencias

- [Azure DevOps REST API](https://learn.microsoft.com/en-us/rest/api/azure/devops/)
- [Estándar de Testing](../standards/testing.md)
