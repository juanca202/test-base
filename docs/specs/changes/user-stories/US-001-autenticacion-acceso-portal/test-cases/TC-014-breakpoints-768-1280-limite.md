# TC-014 — Dado el portal abierto en un módulo autenticado, Cuando el ancho de la ventana cruza exactamente 768px y 1280px, Entonces el layout cambia de rango de forma limpia, sin quedar en un estado intermedio roto

**Perspectiva:** Límite
**Tipo de prueba:** Visual Test
**Prioridad:** Baja
**Criterio de aceptación:** AC-007 (Usabilidad) — Diseño adaptado a escritorio, tablet y móvil con navegación adaptada
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=Visual Test · criterion=AC-007 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El navegador permite fijar el ancho del viewport al píxel exacto y redimensionarlo de forma continua.
- Están definidas las referencias visuales aprobadas de los tres rangos (móvil, tablet y escritorio).

## Datos de prueba

| Campo                              | Valor                        | Notas                                                     |
| ---------------------------------- | ---------------------------- | --------------------------------------------------------- |
| Anchos del borde móvil/tablet      | `767px`, `768px`, `769px`    | 768px pertenece al rango de tablet según AC-007           |
| Anchos del borde tablet/escritorio | `1279px`, `1280px`, `1281px` | 1280px pertenece al rango de escritorio según AC-007      |
| Módulo de prueba                   | `/mis-tareas` [propuesto]    | Módulo con contenido suficiente para evidenciar desbordes |
| Alto de viewport                   | `900px` [propuesto]          | Se fija para aislar la variable de ancho                  |

## Pasos de ejecución

| #   | Actor       | Acción                                                                                              | Resultado esperado del paso                                                                                                                                         |
| --- | ----------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verificador | Fija el ancho en 767px y captura el layout                                                          | Se muestra el layout móvil: icono de hamburguesa y panel superpuesto                                                                                                |
| 2   | Verificador | Fija el ancho en 768px y captura el layout                                                          | El layout ya es el de tablet: navegación colapsada a iconos, sin icono de hamburguesa. 768px no se queda en el rango móvil                                          |
| 3   | Verificador | Fija el ancho en 769px y captura el layout                                                          | Se mantiene el layout de tablet, idéntico al de 768px                                                                                                               |
| 4   | Verificador | Fija el ancho en 1279px y captura el layout                                                         | Sigue siendo el layout de tablet: navegación colapsada a iconos                                                                                                     |
| 5   | Verificador | Fija el ancho en 1280px y captura el layout                                                         | El layout ya es el de escritorio: navegación completa con etiquetas visibles. 1280px no se queda en el rango de tablet                                              |
| 6   | Verificador | Fija el ancho en 1281px y captura el layout                                                         | Se mantiene el layout de escritorio, idéntico al de 1280px                                                                                                          |
| 7   | Verificador | Redimensiona la ventana de forma continua de 360px a 1920px y a la inversa, observando ambos cruces | El layout pasa de un rango al siguiente sin estados intermedios: no aparecen a la vez la navegación completa y el icono de hamburguesa, ni se duplica la navegación |
| 8   | Verificador | Revisa cada captura y el recorrido continuo en busca de defectos de maquetación                     | En ningún ancho hay desborde horizontal, texto cortado, solapamientos ni controles inalcanzables                                                                    |

## Resultado esperado final

En cada uno de los seis anchos exactos, el layout corresponde inequívocamente a un único rango de los tres definidos por AC-007, con 768px en tablet y 1280px en escritorio. Durante el redimensionado continuo el cambio entre rangos es limpio: nunca coexisten elementos de navegación de dos rangos distintos ni queda un estado de maquetación roto.

## Observaciones

Este caso solo verifica los bordes; el comportamiento pleno de cada rango lo cubren [TC-011](./TC-011-layout-escritorio-navegacion-completa-happy.md), [TC-012](./TC-012-layout-tablet-navegacion-colapsada-happy.md) y [TC-013](./TC-013-layout-movil-menu-hamburguesa-happy.md). Si la implementación expresa los cortes en `em` o `rem` en vez de píxeles, el ancho efectivo puede desplazarse según el tamaño de fuente raíz: en ese caso hay que recalcular los seis valores y dejarlo anotado, no relajar la comprobación.
