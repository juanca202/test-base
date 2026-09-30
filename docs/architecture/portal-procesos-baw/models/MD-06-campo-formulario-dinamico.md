<a id="md-06"></a>

# MD-06: Campo de formulario dinámico

Descriptor genérico de un campo del formulario de una tarea (FR-004, riesgo R-03). Es el **contrato del motor de renderizado del portal**, no un objeto de BAW. **Estado de validación: Confirmado** en lo que BAW aporta; **Confirmado (ausente)** en los metadatos de presentación.

**Lo que BAW entrega realmente** es `data_object`, y es todo:

| Campo | Tipo   | Requerido | Descripción                                       |
| ----- | ------ | --------- | ------------------------------------------------- |
| name  | string | **Sí**    | Nombre de la variable                             |
| data  | object | **Sí**    | Valor. Tipo simple o tipo definido por el usuario |

**Lo que el motor de formulario necesita** ([MD-06](MD-06-campo-formulario-dinamico.md) propiamente dicho):

| Campo    | Tipo                 | Requerido | Descripción                                                                   | Origen                                         |
| -------- | -------------------- | --------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| name     | string               | Sí        | Nombre de la variable; clave de correlación al completar                      | **BAW** (`data_object.name`)                   |
| value    | unknown              | No        | Valor actual                                                                  | **BAW** (`data_object.data`)                   |
| type     | enum                 | Sí        | `text` \| `number` \| `boolean` \| `date` \| `datetime` \| `select` \| `file` | **Inferido o configurado**                     |
| label    | string               | Sí        | Etiqueta visible                                                              | **Inferido** (`name` humanizado) o configurado |
| required | boolean              | Sí        | Obligatoriedad                                                                | **Configurado**; por defecto `false`           |
| readOnly | boolean              | Sí        | Solo lectura                                                                  | **Configurado**; por defecto `false`           |
| options  | `{ value, label }[]` | No        | Valores admitidos                                                             | **Configurado**. Requerido si `type = select`  |
| group    | string               | No        | Sección visual                                                                | **Configurado**                                |
| order    | integer              | No        | Orden de presentación                                                         | **Configurado**; si falta, orden de llegada    |

**Inferencia de `type` desde el tipo JavaScript de `data`** (única vía automática): `string` → `text`; `number` → `number`; `boolean` → `boolean`; `string` con forma ISO de fecha → `date` / `datetime`; `object` u `array` → **no soportado**, renderizar de solo lectura.

**Relaciones:** Campo N—1 Tarea ([MD-04](MD-04-tarea.md)).

> **Confirmado: BAW no expone el esquema del Coach.** Se revisó la definición OpenAPI completa y el único portador de datos de tarea es `data_object` = `{ name, data }`. No hay tipo declarado, ni etiqueta, ni obligatoriedad, ni lista de opciones, ni orden, ni agrupación. Los Coaches son artefactos de interfaz que BAW renderiza por su cuenta y que esta API no describe.
>
> **Los dos tipos señalados por R-03 son justamente los no inferibles.** `select` no lo es —una cadena no revela su lista de valores— y `file` tampoco —un adjunto no se distingue de un texto sin metadatos—. Con inferencia pura, el portal soporta texto, número, booleano y fecha, que es exactamente el alcance que R-03 proponía como base. Cubrir `select` y `file` **exige una configuración propia del portal por proceso**, con el coste de mantenimiento que eso implica cada vez que un proceso cambie en BAW.
