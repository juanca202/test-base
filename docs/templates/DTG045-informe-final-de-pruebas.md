<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque, las secciones o filas que no apliquen y sustituir todos los {{…}} al publicar el documento final.
Las alternativas se escriben {{A | B}} (en celdas de tabla, {{A / B}}): conservar solo una.
-->

# Plantilla Informe final de pruebas — DTG045

**{{DTGXXX}} - {{Nombre del documento}}**  
**Responsable:** {{responsables}}  
**Fecha de elaboración:** {{dd/mm/aaaa}}  
**Requerimiento #:** {{nro-requerimiento}}  
**Aplicativo:** {{aplicativo}} - {{funcionalidad}}  
**Área:** {{nombre de area}}

| Versión | Descripción / Notas | Autor       | Fecha     | Aprobado por  | Fecha de aprobación |
| ------- | ------------------- | ----------- | --------- | ------------- | ------------------- |
| {{1.0}} | {{descripción}}     | {{autores}} | {{fecha}} | {{aprobador}} | {{fecha}}           |

### Datos generales

| Campo                              | Valor                    |
| ---------------------------------- | ------------------------ |
| División                           | {{Tecnología}}           |
| Área                               | {{Calidad}}              |
| Fecha                              | {{dd/mm/aaaa}}           |
| Nro. requerimiento                 | {{nro-requerimiento}}    |
| Descripción                        | {{nombre-funcionalidad}} |
| Gestor de calidad                  | {{nombre}}               |
| Analistas                          | {{nombres}}              |
| Fecha cronograma de paso a calidad | {{fecha}}                |
| Fecha real de paso a calidad       | {{fecha}}                |
| Fecha real de notificación a GSF   | {{fecha}}                |
| Fecha de inicio de pruebas         | {{fecha}}                |
| Fecha de fin de pruebas            | {{fecha}}                |
| Fecha de fin de documentación      | {{fecha}}                |
| Fecha cronograma de paso a GSF     | {{fecha}}                |

### Pruebas funcionales

| Métrica                       | Valor |
| ----------------------------- | ----: |
| Casos de prueba planificados  | {{n}} |
| Casos de prueba ejecutados    | {{n}} |
| Casos de prueba no ejecutados | {{n}} |
| Casos de prueba exitosos      | {{n}} |
| Casos de prueba fallidos      | {{n}} |
| Nro. de iteraciones           | {{n}} |

Observación sobre casos no ejecutados: {{motivo, p. ej. "no aplican"}}

### Resumen de incidencias de calidad

|                       | Crítico |  Alto | Medio |  Bajo | Observaciones |
| --------------------- | ------: | ----: | ----: | ----: | ------------- |
| Encontradas           |   {{n}} | {{n}} | {{n}} | {{n}} | {{obs}}       |
| Solucionadas          |   {{n}} | {{n}} | {{n}} | {{n}} | {{obs}}       |
| Cerradas sin solución |   {{n}} | {{n}} | {{n}} | {{n}} | {{obs}}       |
| Pendientes            |   {{n}} | {{n}} | {{n}} | {{n}} | {{obs}}       |
| Soportes              |   {{n}} | {{n}} | {{n}} | {{n}} | {{obs}}       |

### Observaciones y recomendaciones

- {{observación o "-"}}

**URL del progress report:** {{url}}
