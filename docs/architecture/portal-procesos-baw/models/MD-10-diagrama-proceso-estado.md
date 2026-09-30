<a id="md-10"></a>

# MD-10: Diagrama de proceso con estado

Diagrama del proceso con el estado de sus tareas superpuesto (FR-007, pestaña «Diagrama»). **Estado de validación: Confirmado (ausente)** en esta familia de API.

| Campo     | Tipo                    | Requerido | Descripción               | Validaciones / restricciones                                         |
| --------- | ----------------------- | --------- | ------------------------- | -------------------------------------------------------------------- |
| processId | string                  | Sí        | Instancia representada    | —                                                                    |
| format    | enum                    | Sí        | Formato entregado por BAW | `svg` \| `json` — **desconocido**; condiciona toda la implementación |
| content   | string                  | Sí        | Diagrama serializado      | Según `format`                                                       |
| nodes     | `{ id, name, state }[]` | No        | Estado por nodo           | Para la superposición                                                |

**Relaciones:** Diagrama N—1 Instancia ([MD-03](MD-03-instancia-proceso.md)).

> **Ninguna de las siete operaciones devuelve un diagrama.** La familia clásica sí lo documenta (el BPD de una instancia con sus tokens y tareas), pero no se ha validado. El formato sigue decidiendo el esfuerzo: SVG incrustable es incrustarlo; un modelo de nodos obliga a dibujarlo, con una decisión de librería detrás y un orden de magnitud más de trabajo.
