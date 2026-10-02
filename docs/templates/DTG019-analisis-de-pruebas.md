<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque, las secciones o filas que no apliquen y sustituir todos los {{…}} al publicar el documento final.
Las alternativas se escriben {{A | B}} (en celdas de tabla, {{A / B}}): conservar solo una.
-->

# Plantilla Análisis de pruebas — DTG019

**{{DTGXXX}} - {{Nombre del documento}}**  
**Responsable:** {{responsables}}  
**Fecha de elaboración:** {{dd/mm/aaaa}}  
**Requerimiento #:** {{nro-requerimiento}}  
**Aplicativo:** {{aplicativo}} - {{funcionalidad}}  
**Área:** {{nombre de area}}

| Versión | Descripción / Notas | Autor       | Fecha     | Aprobado por  | Fecha de aprobación |
| ------- | ------------------- | ----------- | --------- | ------------- | ------------------- |
| {{1.0}} | {{descripción}}     | {{autores}} | {{fecha}} | {{aprobador}} | {{fecha}}           |

| Campo                 | Valor                                                                |
| --------------------- | -------------------------------------------------------------------- |
| Requerimiento #       | {{nro-requerimiento}} (versión {{n}}: {{nro-requerimiento-versión}}) |
| Aplicativo            | {{aplicativo}}                                                       |
| Módulo                | {{módulo}}                                                           |
| Responsable           | {{responsables}}                                                     |
| Fecha de creación     | {{fecha}}                                                            |
| Fecha de caducidad    | {{fecha}}                                                            |
| Fecha de cumplimiento | {{fecha}}                                                            |

### Resumen

{{Descripción breve de la funcionalidad del requerimiento y, si aplica, de lo nuevo en cada versión.}}

### Contenido

1. Introducción
   - 1.1 Documentos relacionados
2. Estrategias y alcance
   - 2.1 Alcance
     - 2.1.1 Flujo del proceso propuesto
     - 2.1.2 Generar pruebas de flujo propuesto
     - 2.1.3 Entidades afectadas
     - 2.1.4 Marcas afectadas
     - 2.1.5 Productos impactados
     - 2.1.6 Aplicativos impactados
     - 2.1.7 Funcionalidad a probar
     - 2.1.8 Pruebas colaterales y otros impactos a considerar
     - 2.1.9 Alerta de funcionalidad que no es parte del alcance
     - 2.1.10 Disposiciones legales o regulatorias
   - 2.2 Estrategias
   - 2.3 Riesgos a considerar
   - 2.4 Documentación
   - 2.5 Equipo de trabajo
3. Glosario de términos
4. Aprobación

### 1. Introducción

{{Contexto de negocio: necesidad, situación actual y qué propone el requerimiento. Si hay versiones, añadir un subapartado por versión.}}

#### 1.1 Documentos relacionados

| No. | Documento            | Versión     | Fecha     |
| --- | -------------------- | ----------- | --------- |
| 1   | {{código-documento}} | {{versión}} | {{fecha}} |

### 2. Estrategias y alcance

#### 2.1 Alcance

##### 2.1.1 Flujo del proceso propuesto

- **Flujo actual:** {{descripción o "No aplica, es una funcionalidad nueva"}}
- **Flujo propuesto:** {{diagrama de proceso o imagen}}

##### 2.1.2 Generar pruebas de flujo propuesto

1. {{Paso de extremo a extremo 1 (acceso a la funcionalidad)}}
2. {{Paso 2}}
3. {{Paso n (validación en sistemas de respaldo, conciliación, facturación, etc.)}}

**Objetivo de la prueba:** {{objetivo}}

##### 2.1.3 Entidades afectadas

| Entidad     | Requerimiento | Colateral |
| ----------- | :-----------: | :-------: |
| {{entidad}} |     {{X}}     |   {{X}}   |

##### 2.1.4 Marcas afectadas

| Marca     | Requerimiento | Colateral |
| --------- | :-----------: | :-------: |
| {{marca}} |     {{X}}     |   {{X}}   |

##### 2.1.5 Productos impactados

- {{Productos personales / empresariales: tipos de cuenta y tarjeta, principales y adicionales}}

##### 2.1.6 Aplicativos impactados

| Aplicación     | Opción del sistema |
| -------------- | ------------------ |
| {{aplicación}} | {{opción}}         |

##### 2.1.7 Funcionalidad a probar

**Detalle de la funcionalidad a probar**

{{Descripción funcional por flujo y pantalla: datos de entrada, validaciones, botones, mensajes y resultados.}}

**Parametrizaciones requeridas**

| Parámetro     | Valor     | Dónde se configura                    |
| ------------- | --------- | ------------------------------------- |
| {{parámetro}} | {{valor}} | {{administrador web / base de datos}} |

**Funcionalidades modificadas de cara al usuario**

- {{funcionalidad}}

**Funcionalidades modificadas en sus componentes internos**

- {{componente | servicio}}

##### 2.1.8 Pruebas colaterales y otros impactos a considerar

- **Pruebas colaterales:** {{funcionalidades existentes que podrían afectarse}}
- **Otros impactos:** {{impactos}}

##### 2.1.9 Alerta de funcionalidad que no es parte del alcance

- {{funcionalidad fuera de alcance}}

##### 2.1.10 Disposiciones legales o regulatorias

- {{normativa aplicable o "No aplica"}}

#### 2.2 Estrategias

##### 2.2.1 Historias de usuario de calidad

| ID     | Historia de usuario | Criterios de aceptación | Plataforma / tipo de prueba              |
| ------ | ------------------- | ----------------------- | ---------------------------------------- |
| {{id}} | {{historia}}        | {{criterios}}           | {{UX / Funcional · Android / iOS / Web}} |

##### 2.2.2 Casos de uso

- {{caso de uso o "No aplica"}}

##### 2.2.3 Casos de prueba prediseñados a considerar

- {{casos de prueba reutilizables}}

##### 2.2.4 Coordinación con externos

| Externo              | Responsable | Actividad / acuerdo |
| -------------------- | ----------- | ------------------- |
| {{área / proveedor}} | {{nombre}}  | {{actividad}}       |

##### 2.2.5 Prerrequisitos para la ejecución de pruebas

- {{ambiente, accesos, versión del aplicativo, usuarios, servicios disponibles}}

##### 2.2.6 Generación de data para pruebas

- {{perfiles, productos y datos necesarios; origen del set de datos (DTG021)}}

#### 2.3 Riesgos a considerar

| Riesgo     | Probabilidad        | Impacto             | Mitigación |
| ---------- | ------------------- | ------------------- | ---------- |
| {{riesgo}} | {{alta/media/baja}} | {{alto/medio/bajo}} | {{acción}} |

##### 2.3.1 Puntos críticos de control

- {{punto crítico}}

#### 2.4 Documentación

- {{documentos que se generarán: DTG018, DTG020, DTG022, DTG045}}

#### 2.5 Equipo de trabajo

| Nombre     | Rol     |
| ---------- | ------- |
| {{nombre}} | {{rol}} |

### 3. Glosario de términos

| Término     | Definición     |
| ----------- | -------------- |
| {{término}} | {{definición}} |

### 4. Aprobación

| Nombre     | Cargo     | Fecha     | Firma     |
| ---------- | --------- | --------- | --------- |
| {{nombre}} | {{cargo}} | {{fecha}} | {{firma}} |
