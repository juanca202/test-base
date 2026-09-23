# Proyecto Base de QA

Este es un framework de pruebas automatizadas diseñado para realizar testing de aplicaciones web y APIs REST sin acceso al código fuente. Proporciona una base sólida para implementar pruebas E2E y API testing.

El framework está construido con Playwright + TypeScript y sigue las mejores prácticas de la industria para testing de aplicaciones externas, incluyendo patrones de Page Object Model, configuración multi-ambiente y reportería avanzada con Allure.

## Características principales

- 🎭 **Playwright + TypeScript**: Framework moderno para testing E2E y API
- 📊 **Allure Reports**: Reportería avanzada con categorización de fallos
- 🌐 **Multi-browser**: Soporte para Chromium, Firefox, Safari y móviles
- 🔧 **Configuración flexible**: Variables por ambiente y configuración modular
- 🎯 **Page Object Model**: Estructura mantenible y reutilizable
- 🚀 **CI/CD Ready**: Preparado para pipelines de integración continua

## Estructura del proyecto

```
├── src/                    # Código fuente del framework
│   ├── pages/             # Page Object Models
│   ├── fixtures/          # Datos de prueba y configuraciones
│   └── helpers/           # Utilidades y helpers
├── tests/                 # Test suites
│   ├── e2e/              # Pruebas End-to-End
│   ├── api/              # Pruebas de API
│   ├── setup/            # Configuración global
│   └── utils/            # Utilidades de testing
├── docs/                 # Documentación técnica
│   ├── adr/              # Architectural Decision Records
│   └── standards/        # Estándares técnicos
└── .sdd-devkit/          # Configuración SDD DevKit
```

## Primeros pasos

1. **Instalar dependencias**:

   ```bash
   npm install
   npm run install:browsers
   ```

2. **Configurar variables de ambiente**:

   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Ejecutar pruebas de ejemplo**:

   ```bash
   npm test                    # Todas las pruebas
   npm run test:e2e           # Solo E2E
   npm run test:api           # Solo API
   ```

4. **Ver reportes**:
   ```bash
   npm run allure:serve       # Servidor local de Allure
   npm run test:report        # Reporte HTML de Playwright
   ```

## Scripts disponibles

- `npm test` - Ejecutar todas las pruebas
- `npm run test:headed` - Ejecutar con browser visible
- `npm run test:ui` - Interfaz interactiva de Playwright
- `npm run test:debug` - Modo debug
- `npm run lint` - Ejecutar ESLint
- `npm run format` - Formatear código con Prettier
- `npm run allure:generate` - Generar reporte Allure
