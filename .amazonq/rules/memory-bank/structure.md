# Project Structure

## Architecture Overview

Wildlander Launcher is an Electron-based desktop application following a multi-process architecture with clear separation between main process, renderer process, and preload scripts. The project uses TypeScript throughout and Vue 3 for the UI layer.

## Directory Structure

### Root Configuration
```
/
├── .amazonq/              # Amazon Q AI assistant configuration
│   ├── plans/            # Development plans and task tracking
│   ├── rules/            # Project-specific AI guidelines
│   └── templates/        # Plan templates
├── .github/              # GitHub configuration
│   ├── workflows/        # CI/CD pipelines
│   └── ISSUE_TEMPLATE/   # Issue templates
├── public/               # Static assets
│   └── images/          # Application images and logos
├── resources/            # Build resources
│   └── tools/           # External tools (QRes.exe)
└── mock-files/          # Test fixtures and mock data
```

### Source Code (`src/`)

#### Main Process (`src/main/`)
The Electron main process handles system-level operations and business logic:
- `application.ts` - Main application entry point and lifecycle management
- `logger.ts` - Centralized logging configuration
- `bindings/` - Dependency injection bindings (LoopBack)
- `controllers/` - IPC communication controllers
- `decorators/` - Custom TypeScript decorators
- `services/` - Business logic services
- `types/` - TypeScript type definitions

#### Renderer Process (`src/renderer/`)
The Vue 3-based UI layer:
- `src/` - Vue application source
  - `components/` - Vue components
  - `router/` - Vue Router configuration
  - `store/` - State management
  - `views/` - Page-level components
- `index.html` - HTML entry point
- `shims.d.ts` - TypeScript shims for Vue

#### Preload Scripts (`src/preload/`)
Bridge between main and renderer processes:
- `index.ts` - Exposes safe APIs to renderer

#### Shared Code (`src/shared/`)
Code shared between main and renderer:
- `enums/` - Enumeration types
- `errors/` - Custom error classes
- `types/` - Shared TypeScript types
- `util/` - Utility functions
- `wildlander/` - Wildlander-specific logic

### Testing (`src/__tests__/`)

#### Unit Tests (`src/__tests__/unit/`)
- `main/` - Main process unit tests
  - `services/` - Service layer tests
  - `decorators/` - Decorator tests
- `renderer/` - Renderer process unit tests
  - Component tests using Jest and Vue Test Utils

#### E2E Tests (`src/__tests__/e2e/`)
- Playwright-based end-to-end tests
- `util/` - Test utilities and fixtures
- Page object models for UI testing

### Build Output

#### Development
- `.playwright/` - Playwright test artifacts
  - `coverage/` - E2E test coverage
  - `dist-instrumented/` - Instrumented code for coverage
  - `test-results/` - Test execution results

#### Production
- `dist/` - Compiled TypeScript output
- `out/` - Electron build output
- `coverage/` - Unit test coverage reports

## Core Components and Relationships

### Dependency Injection (LoopBack)
The application uses LoopBack's IoC container for dependency management:
- Services are bound in `src/main/bindings/`
- Controllers consume services via constructor injection
- Decorators provide metadata for binding resolution

### IPC Communication Pattern
```
Renderer Process (Vue)
    ↓ (invoke via preload)
Preload Script (contextBridge)
    ↓ (ipcRenderer)
Main Process Controller
    ↓ (service injection)
Service Layer
    ↓ (system APIs)
Operating System
```

### Service Layer Architecture
Services are organized by domain:
- `enb.service.ts` - ENB preset management
- `resolution.service.ts` - Display resolution handling
- `file.service.ts` - File system operations
- `config.service.ts` - Configuration management
- `update.service.ts` - Auto-update functionality

### Vue Component Hierarchy
```
App.vue
├── TheHeader.vue
├── TheNavigation.vue
│   └── NavigationItem.vue
└── Router Views
    ├── Home.vue
    ├── Settings.vue
    └── [Other Pages]
```

## Architectural Patterns

### Multi-Process Architecture
- **Main Process**: Node.js environment with full system access
- **Renderer Process**: Chromium-based UI with restricted access
- **Preload Scripts**: Secure bridge using contextBridge API

### Dependency Injection
- LoopBack IoC container for service management
- Constructor-based injection
- Singleton service instances

### Service-Oriented Design
- Business logic encapsulated in services
- Controllers act as thin IPC handlers
- Services are testable in isolation

### Component-Based UI
- Vue 3 Composition API and Options API
- Reusable base components
- Feature-specific components
- Layout components for structure

### Configuration Management
- electron-store for persistent settings
- INI file parsing for game configurations
- Environment-specific configuration

### Testing Strategy
- Unit tests for services and utilities
- Component tests for Vue components
- E2E tests for critical user workflows
- Code coverage tracking with NYC and Istanbul

## Build System

### Development
- electron-vite for fast development builds
- Hot module replacement for renderer
- TypeScript compilation with path aliases

### Production
- electron-builder for packaging
- Multi-platform builds (Windows, macOS, Linux)
- Auto-update integration
- Code signing support

### Testing
- Jest for unit tests (renderer)
- Mocha for unit tests (main)
- Playwright for E2E tests
- Docker for consistent E2E test environment
