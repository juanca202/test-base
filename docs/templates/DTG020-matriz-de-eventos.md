<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque, las secciones o filas que no apliquen y sustituir todos los {{…}} al publicar el documento final.
Las alternativas se escriben {{A | B}} (en celdas de tabla, {{A / B}}): conservar solo una.
-->

# Plantilla Matriz de eventos (casos de prueba) — DTG020

**{{DTGXXX}} - {{Nombre del documento}}**  
**Responsable:** {{responsables}}  
**Fecha de elaboración:** {{dd/mm/aaaa}}  
**Requerimiento #:** {{nro-requerimiento}}  
**Aplicativo:** {{aplicativo}} - {{funcionalidad}}  
**Área:** {{nombre de area}}

| Versión | Descripción / Notas | Autor       | Fecha     | Aprobado por  | Fecha de aprobación |
| ------- | ------------------- | ----------- | --------- | ------------- | ------------------- |
| {{1.0}} | {{descripción}}     | {{autores}} | {{fecha}} | {{aprobador}} | {{fecha}}           |

Un bloque por historia de usuario / suite de pruebas. Se exporta desde la herramienta de gestión de pruebas (Azure Test Plans).

**Hojas por plataforma y tipo:** `{{id-HU}} UX {{Android | iOS}}` · `{{id-HU}} FUNC {{Android | iOS}}`

### Suite {{id-HU}} — {{título de la historia}} ({{UX | Funcional}} · {{Android | iOS}})

| ID        | Tipo      | Título              | Área             | Asignado a   | Estado                      |
| --------- | --------- | ------------------- | ---------------- | ------------ | --------------------------- |
| {{id-TC}} | Test Case | {{título del caso}} | {{ruta-de-área}} | {{analista}} | {{Design / Ready / Closed}} |

**Pasos del caso {{id-TC}}**

| Paso | Acción     | Resultado esperado     |
| :--: | ---------- | ---------------------- |
|  1   | {{acción}} | {{resultado esperado}} |
|  2   | {{acción}} | {{resultado esperado}} |

Categorías de casos habituales: acceso desde cada punto de entrada, visibilidad por perfil, consistencia UX frente a la maqueta, validaciones de datos, fallos de servicio y reintentos, perfiles no autorizados, productos en estado no válido, acceso sin conexión.
