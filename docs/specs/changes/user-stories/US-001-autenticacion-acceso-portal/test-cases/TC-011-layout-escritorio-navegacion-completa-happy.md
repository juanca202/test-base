# TC-011 — Dado un usuario autenticado en una pantalla de escritorio (≥1280px), Cuando abre cualquier módulo del portal, Entonces la navegación se muestra completa, con etiquetas visibles y sin colapsar

**Perspectiva:** Happy Path
**Tipo de prueba:** Visual Test
**Prioridad:** Media
**Criterio de aceptación:** AC-007 (Usabilidad) — Diseño adaptado a escritorio, tablet y móvil con navegación adaptada
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=Visual Test · criterion=AC-007 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El navegador permite fijar el ancho exacto de la ventana o del viewport.
- Existe una referencia visual aprobada del layout de escritorio contra la que comparar.

## Datos de prueba

| Campo             | Valor                                      | Notas                                                                  |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| Ancho de viewport | `1280px` y `1920px` [propuesto]            | Borde inferior del rango y un ancho amplio representativo              |
| Alto de viewport  | `900px` [propuesto]                        | No influye en el rango, se fija para estabilizar la comparación visual |
| Módulos a revisar | Módulo inicial y `/mis-tareas` [propuesto] | La navegación es transversal a todos los módulos                       |

## Pasos de ejecución

| #   | Actor       | Acción                                                                    | Resultado esperado del paso                                                                             |
| --- | ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Verificador | Fija el ancho del viewport en 1280px y abre el módulo inicial autenticado | El portal renderiza el layout del rango de escritorio                                                   |
| 2   | Verificador | Observa el área de navegación                                             | La navegación se muestra completa: cada destino visible con su etiqueta de texto, sin colapsar a iconos |
| 3   | Verificador | Comprueba que no existe control de expansión                              | No se muestra icono de hamburguesa ni control para desplegar la navegación: no hace falta               |
| 4   | Verificador | Compara la captura con la referencia visual aprobada de escritorio        | No hay diferencias visuales relevantes; no hay texto cortado, solapamientos ni desbordes horizontales   |
| 5   | Verificador | Repite los pasos 1 a 4 a 1920px y en el segundo módulo                    | El layout se mantiene en el rango de escritorio, con la navegación igualmente completa                  |

## Resultado esperado final

En anchos de 1280px o superiores, el portal muestra la navegación completa y expandida, con todas las etiquetas legibles, sin controles de expansión ni desbordes horizontales, y de forma consistente en todos los módulos autenticados.

## Observaciones

Forma serie con [TC-012](./TC-012-layout-tablet-navegacion-colapsada-happy.md) (tablet) y [TC-013](./TC-013-layout-movil-menu-hamburguesa-happy.md) (móvil); el comportamiento justo en los anchos de cambio lo cubre [TC-014](./TC-014-breakpoints-768-1280-limite.md).
