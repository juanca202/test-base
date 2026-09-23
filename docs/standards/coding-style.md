---
name: Coding Style Standards
domain: coding-style
status: Active
last_update: 2026-09-22
source_adrs: []
tags: [coding-style, eslint, prettier, typescript]
---

# Coding Style Standards

Este estándar cubre el estilo y las herramientas de calidad del código del framework de QA: lint, formato, TypeScript, hooks de Git, nombres, errores, secretos y documentación.

## Linting

**ID:** eslint
**Estado:** Active

El código **DEBE** lintarse con ESLint en flat config (`eslint.config.js`).

Estas reglas **DEBEN** estar en severidad `error`: `@typescript-eslint/no-unused-vars`, `prefer-const` y `no-var`. `no-console` **DEBERÍA** estar en `warn`, y **PUEDE** desactivarse en los archivos de prueba.

### Excepciones

Ninguna.

## Formato

**ID:** formatting
**Estado:** Active

El código **DEBE** formatearse con Prettier (`.prettierrc`) con `singleQuote: true`, `trailingComma: 'es5'`, `printWidth: 80` y `tabWidth: 2`.

### Excepciones

Ninguna.

## TypeScript

**ID:** typescript
**Estado:** Active

TypeScript **DEBE** compilar en modo strict, con target ES2022 como mínimo. La cobertura de tipos **DEBE** ser al menos del 90 %.

### Excepciones

Ninguna.

## Hooks de Git

**ID:** git-hooks
**Estado:** Active

El pre-commit **DEBE** ejecutarse con Husky y lint-staged: ESLint y Prettier sobre `*.{ts,js}`, y Prettier sobre `*.{json,md}`.

### Excepciones

Ninguna.

## Nombres e imports

**ID:** naming
**Estado:** Active

Las clases **DEBEN** usar PascalCase. Las funciones y variables **DEBEN** usar camelCase. Las constantes **DEBEN** usar `UPPER_SNAKE_CASE`. Los miembros privados **DEBEN** llevar prefijo `_`.

Los imports **DEBEN** listar primero las librerías externas y después los módulos internos, agrupados por ubicación.

### Excepciones

Ninguna.

## Errores asíncronos

**ID:** async-errors
**Estado:** Active

El código asíncrono **DEBE** usar `async`/`await`. **NO DEBE** encadenar promesas con `.then()` y un `.catch(console.log)`.

Un error de dominio **PUEDE** ser una subclase de `Error` con `name` propio.

### Excepciones

Ninguna.

## Secretos

**ID:** secrets
**Estado:** Active

Las credenciales y los tokens **NO DEBEN** quedar hardcodeados. **DEBEN** leerse de variables de entorno, y la ausencia de una variable requerida **DEBE** fallar de forma explícita.

### Excepciones

Ninguna.

## Locators

**ID:** locators
**Estado:** Active

Un conjunto de elementos **DEBE** recorrerse con un locator y `nth()`. **NO DEBE** crearse un locator nuevo dentro de un bucle para cada índice.

Los browsers, contexts, listeners y watchers **DEBEN** cerrarse al terminar la operación.

### Excepciones

Ninguna.

## Validación de entradas

**ID:** input-validation
**Estado:** Active

Una entrada **DEBE** validarse antes de usarse.

### Excepciones

Ninguna.

## Documentación de código

**ID:** code-docs
**Estado:** Active

Los métodos públicos **DEBEN** documentarse con JSDoc. La lógica compleja **DEBE** llevar un comentario inline. Los tipos **DEBEN** ser descriptivos.

El README del proyecto **DEBE** incluir instrucciones de setup, ejemplos de uso, problemas frecuentes y una vista de la arquitectura.

### Excepciones

Ninguna.

## Criterios de cumplimiento

| ID  | Requisito | Descripción | Automatizable | Enfoque | Verificación |
| --- | --------- | ----------- | ------------- | ------- | ------------ |

## Referencias

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)
