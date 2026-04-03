# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wildlander Launcher is an **Electron desktop application** that simplifies installation of the Wildlander Wabbajack modpack for Skyrim. It uses **Vue 3 + TypeScript** for the UI and **LoopBack 5** for dependency injection in the main process.

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

## Development Rules

All project-specific rules are in `.claude/rules/`:
- `planning.md` — when/how to create and manage implementation plans
- `environment.md` — branch naming convention (`{type}/{jira-id}_{description}`)
- `typescript.md` — no type assertions
- `wallaby.md` — Wallaby MCP test verification and empty-result fallback
- `webstorm-verification.md` — code verification via WebStorm MCP after changes
