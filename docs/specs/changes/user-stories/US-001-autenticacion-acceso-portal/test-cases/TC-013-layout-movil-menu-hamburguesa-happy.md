# TC-013 — Dado un usuario autenticado en una pantalla móvil (<768px), Cuando abre cualquier módulo del portal, Entonces el menú se muestra como icono de hamburguesa que abre un panel de navegación superpuesto

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
- El navegador permite fijar el ancho exacto del viewport o emular un dispositivo móvil.
- Existe una referencia visual aprobada del layout móvil contra la que comparar.

## Datos de prueba

| Campo             | Valor                                      | Notas                                            |
| ----------------- | ------------------------------------------ | ------------------------------------------------ |
| Ancho de viewport | `360px` y `767px` [propuesto]              | Ancho móvil habitual y borde superior del rango  |
| Alto de viewport  | `740px` [propuesto]                        | Se fija para estabilizar la comparación visual   |
| Módulos a revisar | Módulo inicial y `/mis-tareas` [propuesto] | La navegación es transversal a todos los módulos |

## Pasos de ejecución

| #   | Actor       | Acción                                                                   | Resultado esperado del paso                                                                                                                       |
| --- | ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verificador | Fija el ancho del viewport en 360px y abre el módulo inicial autenticado | El portal renderiza el layout del rango móvil                                                                                                     |
| 2   | Verificador | Observa el encabezado en su estado inicial                               | Se muestra un icono de hamburguesa; la navegación no ocupa espacio fijo en pantalla y el contenido del módulo usa todo el ancho disponible        |
| 3   | Usuario     | Activa el icono de hamburguesa                                           | Se abre un panel de navegación superpuesto sobre el contenido, con todos los destinos y sus etiquetas legibles                                    |
| 4   | Usuario     | Selecciona un destino del panel                                          | El portal navega al módulo correspondiente y el panel superpuesto se cierra                                                                       |
| 5   | Usuario     | Vuelve a abrir el panel y lo cierra sin elegir destino                   | El panel se cierra y el usuario permanece en el mismo módulo, sin pérdida de estado                                                               |
| 6   | Verificador | Compara las capturas con la referencia visual aprobada de móvil          | No hay diferencias visuales relevantes; no hay desborde horizontal ni controles inalcanzables, y los destinos del panel son operables con el dedo |
| 7   | Verificador | Repite los pasos 1 a 6 a 767px                                           | El comportamiento es el mismo en todo el rango móvil                                                                                              |

## Resultado esperado final

En anchos inferiores a 768px, el portal presenta la navegación tras un icono de hamburguesa que abre un panel superpuesto con todos los destinos; el panel permite navegar y cerrarse sin pérdida de estado, y el contenido del módulo se lee sin desborde horizontal en toda la franja móvil.

## Observaciones

Cierra la serie de [TC-011](./TC-011-layout-escritorio-navegacion-completa-happy.md) y [TC-012](./TC-012-layout-tablet-navegacion-colapsada-happy.md). El cambio de rango justo al cruzar 768px lo cubre [TC-014](./TC-014-breakpoints-768-1280-limite.md).
