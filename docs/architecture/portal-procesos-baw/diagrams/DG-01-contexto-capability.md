<a id="dg-01"></a>

# DG-01: Contexto de la capability

- **Tipo:** Contexto (C4)
- **Alcance:** Actores y sistemas que intervienen. No cubre el detalle interno del frontend (ver [DG-02](DG-02-componentes-frontend.md)) ni la arquitectura interna de BAW.

```mermaid
C4Context
  Person(usuario, "Usuario", "Empleado que inicia procesos, gestiona sus tareas y consulta rendimiento")
  System(portal, "Portal de procesos", "SPA Angular 22. Sin backend ni almacenamiento propio")
  System_Ext(baw, "IBM BAW 8.6.1", "Process REST Interface. Login, instancias y tareas")
  Rel(usuario, portal, "Usa desde el navegador", "HTTPS")
  Rel(portal, baw, "Consulta en vivo", "HTTPS/REST + cookie + BPMCSRFToken")
  Rel(baw, portal, "Cookie de sesión y datos de procesos", "HTTPS")
```

**Notas**

- **No hay backend propio ni base de datos:** el navegador habla directamente con BAW. El portal solo retiene `csrf_token` y `username` en almacenamiento efímero ([MD-01](../models/MD-01-sesion-credenciales.md)).
- La disponibilidad del portal es la de BAW (NFR-004, riesgo R-04): no hay caché ni degradación offline.
- En desarrollo la comunicación pasa por el proxy del frontend; en producción cruzaría orígenes. Ver [Observaciones](../README.md#observaciones), punto 8.
