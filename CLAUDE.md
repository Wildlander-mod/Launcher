# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wildlander Launcher is an **Electron desktop application** that simplifies installation of the Wildlander Wabbajack modpack for Skyrim. It uses **Vue 3 + TypeScript** for the UI and **LoopBack 5** for dependency injection in the main process.

## Common Commands

### Development
```bash
npm run dev          # Start in development mode (electron-vite)
```

### Building
```bash
npm run build        # Build the app
npm run compile      # TypeScript compilation only
```

### Linting
```bash
npm run lint         # Run all lint checks
npm run lint:fix     # Run all lint checks with auto-fix
```

### Testing
```bash
npm run test                    # Run all tests (unit + e2e)
npm run test:unit               # Run all unit tests
npm run test:unit:renderer      # Jest tests for renderer (Vue components)
npm run test:unit:main          # Mocha tests for main process
npm run test:e2e                # Playwright e2e tests
```

To run a single renderer unit test file:
```bash
npx jest path/to/test.test.ts
```

To run a single main process test file, configure `.mocharc.json` or use the spec pattern directly.

## Architecture

### Three-Process Electron Structure

```
src/
├── main/           # Main process — LoopBack application, services, IPC controllers
├── preload/        # Context bridge — exposes safe IPC API to renderer
└── renderer/src/   # Renderer process — Vue 3 UI components
```

**Main Process (`src/main/`):** Built on LoopBack 5 dependency injection. `LauncherApplication` boots services and controllers. Services handle business logic (e.g. `startup.service.ts`, `config.service.ts`, `enb.service.ts`). Controllers act as IPC handlers for renderer requests.

**Preload (`src/preload/index.ts`):** Uses Electron's `contextBridge` to expose `ipcRenderer.invoke()` and `ipcRenderer.on()` to the renderer without granting full node access.

**Renderer (`src/renderer/src/`):** Vue 3 components communicate with the main process via the preload bridge using `window.ipcRenderer.invoke(channel, data)`.

**Shared (`src/shared/`):** Types, enums, errors, and utility functions shared between main and renderer processes.

### IPC Pattern

Renderer calls main via the preload bridge → main process controllers handle the request → response returned to renderer.

## Testing Structure

| Test Type | Framework | Location | Command |
|-----------|-----------|----------|---------|
| Renderer unit | Jest + jsdom | `src/__tests__/unit/renderer/` | `test:unit:renderer` |
| Main unit | Mocha + NYC | `src/__tests__/unit/main/` | `test:unit:main` |
| E2E | Playwright | `src/__tests__/e2e/` | `test:e2e` |

Renderer tests use `vue-jest` and `ts-jest`. The `@/` path alias maps to `src/renderer/src/`. Coverage is collected from `src/renderer/**/*.{js,ts,vue}`.

## TypeScript Configuration

There are separate TypeScript configs per process:
- `tsconfig.base.json` — shared settings, path aliases (`@/*`)
- `tsconfig.main.json` — CommonJS modules for main process
- `tsconfig.renderer.json` — DOM/ESNext libs for renderer

**Never use type assertions** (`as` keyword). Use type guards and predicates instead. See `.claude/rules/typescript.md`.

## Development Rules

All project-specific rules are in `.claude/rules/`:
- `planning.md` — when/how to create and manage implementation plans
- `environment.md` — branch naming convention (`{type}/{jira-id}_{description}`)
- `typescript.md` — no type assertions
- `wallaby.md` — mandatory test verification via Wallaby MCP after changes
- `wallaby-fallback.md` — fallback when Wallaby MCP returns empty results
- `webstorm-verification.md` — code verification via WebStorm MCP after changes
