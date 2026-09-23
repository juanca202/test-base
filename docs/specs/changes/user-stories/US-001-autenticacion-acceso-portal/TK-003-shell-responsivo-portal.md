# TK-003: Diseño responsivo del shell del portal

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-001: Autenticación y acceso al portal](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Adaptar el shell del portal —menú lateral, encabezado y área de contenido— y la pantalla de login a los tres rangos de ancho que exige la historia, con la navegación adaptada en cada uno. Es el layout transversal que heredan el resto de módulos del portal.

Hoy el shell no declara ningún punto de corte: el menú lateral tiene ancho fijo con un plegado manual accionado por el usuario, y los únicos cortes presentes son utilidades sueltas de la pantalla de login y del bloque de usuario del encabezado, en rangos que no corresponden con los de la historia.

**Comportamiento acordado por rango:**

| Rango      | Ancho      | Navegación                                                                                                                                                | Contenido                                                   |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Escritorio | ≥1280px    | Navegación completa visible: menú lateral desplegado con icono y etiqueta de cada módulo, tal como muestran los wireframes aprobados.                     | Junto al menú lateral.                                      |
| Tablet     | 768–1279px | Menú lateral colapsado a iconos, sin etiquetas de texto; se expande al hacer clic o tap y vuelve a colapsarse.                                            | Junto al menú lateral colapsado.                            |
| Móvil      | <768px     | Control tipo hamburguesa en el encabezado que abre un panel de navegación superpuesto sobre el contenido; se cierra al elegir un módulo o al descartarlo. | Ocupa todo el ancho disponible; el menú no reserva espacio. |

## Dependencias

- `MainLayout` (`shared/components/main-layout/`) — menú lateral, encabezado y área de contenido.
- Pantalla de login (`features/auth/components/login/`) — panel de marca y panel de formulario.
- Tailwind CSS v4 y los tokens de tema del repositorio (`src/theme/`) — origen de los puntos de corte y utilidades.
- `@factor_ec/ui` (`ft-icon`) — control de apertura del menú y iconos de navegación, ya en uso.

## Referencias

- **Diseño:** [Wireframe de Mis tareas](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/mis-tareas.md) · [Wireframe de Login](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/login.md) — aprobados; son la referencia del rango de escritorio. El comportamiento de tablet y móvil es el acordado en la tabla de la Descripción.
- **Arquitectura:** ADR-006 del repositorio `frontend` — presentación con Tailwind CSS ([`frontend/docs/adr/ADR-006-presentation-tailwind-css.md`](../../../../frontend/docs/adr/ADR-006-presentation-tailwind-css.md))

## Archivos afectados

```text
frontend/
└── src/app/
    ├── ~ shared/components/main-layout/main-layout.html   # navegación por rango y control de apertura
    ├── ~ shared/components/main-layout/main-layout.ts     # estado de apertura/colapso según el rango
    ├── ~ shared/components/main-layout/main-layout.css    # puntos de corte del shell
    ├── ~ shared/components/main-layout/main-layout.spec.ts
    └── ~ features/auth/components/login/login.html        # cortes del panel de marca y del formulario
```

## Plan de implementación

- [x] **IT-01** — Declarar los tres puntos de corte del shell
      ≥1280px, 768–1279px y <768px, definidos una sola vez con las utilidades y tokens de Tailwind del repositorio para que el resto de módulos los herede en lugar de repetirlos.
- [x] **IT-02** — Navegación completa en escritorio
      Menú lateral desplegado con icono y etiqueta por módulo, como en los wireframes aprobados.
- [x] **IT-03** — Menú colapsado a iconos en tablet
      Sin etiquetas de texto en reposo, expandible por clic o tap y con vuelta al estado colapsado. Cada entrada conserva un nombre accesible aunque la etiqueta no se muestre.
- [x] **IT-04** — Panel de navegación superpuesto en móvil
      Control tipo hamburguesa en el encabezado que abre el panel sobre el contenido, y cierre al elegir un módulo o al descartarlo.
- [x] **IT-05** — Contenido a ancho completo en móvil
      El área de contenido ocupa todo el ancho disponible y el menú deja de reservar espacio en ese rango.
- [x] **IT-06** — Reconciliar el plegado manual ya existente con los rangos
      El colapso accionado por el usuario y el corte actual del bloque de usuario del encabezado se integran en el comportamiento por rango, en lugar de coexistir con él.
- [x] **IT-07** — Ajustar la pantalla de login a los mismos rangos
      El panel de marca y el panel de formulario se reparten según los cortes acordados, sustituyendo las utilidades sueltas que hoy usan otro umbral.
- [x] **IT-08** — Cubrir el foco y el teclado del menú superpuesto
      Apertura, recorrido y cierre operables por teclado, con foco visible y contraste conforme a los mínimos WCAG AA declarados en `AGENTS.md` del repositorio `frontend`.
