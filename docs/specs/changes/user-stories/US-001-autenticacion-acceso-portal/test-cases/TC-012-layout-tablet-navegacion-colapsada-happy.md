# TC-012 — Dado un usuario autenticado en una pantalla de tablet (768–1279px), Cuando abre cualquier módulo del portal, Entonces la navegación se muestra colapsada a iconos y se expande al interactuar con ella

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
- El navegador permite fijar el ancho exacto del viewport.
- Existe una referencia visual aprobada del layout de tablet contra la que comparar.

## Datos de prueba

| Campo             | Valor                                      | Notas                                                                      |
| ----------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| Ancho de viewport | `768px`, `1024px` y `1279px` [propuesto]   | Borde inferior, ancho intermedio representativo y borde superior del rango |
| Alto de viewport  | `1024px` [propuesto]                       | Se fija para estabilizar la comparación visual                             |
| Módulos a revisar | Módulo inicial y `/mis-tareas` [propuesto] | La navegación es transversal a todos los módulos                           |

## Pasos de ejecución

| #   | Actor       | Acción                                                                                                | Resultado esperado del paso                                                                                                 |
| --- | ----------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verificador | Fija el ancho del viewport en 1024px y abre el módulo inicial autenticado                             | El portal renderiza el layout del rango de tablet                                                                           |
| 2   | Verificador | Observa el área de navegación en su estado inicial                                                    | La navegación se muestra colapsada a iconos: cada destino sigue presente y accesible, con su etiqueta de texto oculta       |
| 3   | Usuario     | Interactúa con la navegación colapsada para expandirla                                                | La navegación se expande y muestra las etiquetas de texto de cada destino                                                   |
| 4   | Usuario     | Selecciona un destino desde la navegación expandida                                                   | El portal navega al módulo correspondiente y la navegación vuelve a su estado colapsado                                     |
| 5   | Verificador | Compara las capturas de los estados colapsado y expandido con la referencia visual aprobada de tablet | No hay diferencias visuales relevantes; la navegación expandida no oculta contenido esencial ni provoca desborde horizontal |
| 6   | Verificador | Repite los pasos 1 a 5 a 768px y a 1279px                                                             | El comportamiento es el mismo en todo el rango de tablet                                                                    |

## Resultado esperado final

En anchos entre 768px y 1279px, la navegación aparece colapsada a iconos con todos los destinos accesibles, se expande al interactuar mostrando sus etiquetas, permite navegar y vuelve a colapsarse. El contenido del módulo sigue legible y no se produce desborde horizontal en ningún estado.

## Observaciones

Forma serie con [TC-011](./TC-011-layout-escritorio-navegacion-completa-happy.md) (escritorio) y [TC-013](./TC-013-layout-movil-menu-hamburguesa-happy.md) (móvil). A 1279px y a 768px este caso comprueba que el layout es el de tablet; que el cambio entre rangos sea limpio al cruzar esos anchos lo cubre [TC-014](./TC-014-breakpoints-768-1280-limite.md).
