# Technology Stack

## Programming Languages

### TypeScript 4.9.5
- Primary language for all application code
- Strict type checking enabled
- Path aliases for clean imports (`@/`, `@renderer/`)
- Configured via multiple tsconfig files:
  - `tsconfig.base.json` - Base configuration
  - `tsconfig.main.json` - Main process
  - `tsconfig.renderer.json` - Renderer process

### JavaScript
- Configuration files (babel, jest, etc.)
- Build scripts and tooling

### SCSS/CSS
- Styling with Sass preprocessor
- Component-scoped styles in Vue SFCs

## Core Frameworks

### Electron 16.0.5
- Desktop application framework
- Multi-process architecture (main, renderer, preload)
- Native system integration
- Auto-update support via electron-updater

### Vue 3.2.31
- Progressive JavaScript framework for UI
- Composition API and Options API support
- Single File Components (SFC)
- TypeScript integration

### LoopBack
- Dependency injection container
- Service-oriented architecture
- Decorator-based metadata

## Build System

### electron-vite 3.1.0
- Fast Vite-based build tool for Electron
- Hot module replacement in development
- Optimized production builds
- Configuration: `electron.vite.config.ts`

### Vite 6.3.5
- Next-generation frontend tooling
- Fast development server
- Optimized bundling

### TypeScript Compiler
- `tsc` for type checking and compilation
- `tsc-alias` for path alias resolution
- Multiple build targets (main, renderer)

### electron-builder
- Application packaging and distribution
- Multi-platform builds
- Auto-update integration
- Code signing support

## Testing Frameworks

### Unit Testing

#### Jest 26.6.3 (Renderer)
- Test runner for renderer process
- Vue component testing with @vue/test-utils
- Configuration: `jest.config.ts`
- Coverage reporting

#### Mocha 10.2.0 (Main)
- Test runner for main process
- Used with @loopback/testlab
- Configuration: `.mocharc.json`

### E2E Testing

#### Playwright 1.52.0
- Browser automation for E2E tests
- Multi-browser support
- Screenshot comparison
- Configuration: `playwright.config.ts`
- Docker-based test environment

### Coverage Tools

#### NYC/Istanbul
- Code coverage for main process
- Configuration: `.nycrc`
- HTML and LCOV reports

#### Istanbul (via Jest)
- Code coverage for renderer process
- Integrated with Jest

## UI Libraries

### Vue Router 4.1.3
- Official routing library for Vue
- Navigation management
- Route guards

### vue-final-modal 3.4.4
- Modal dialog management
- Programmatic and declarative APIs

### @vueform/toggle 2.1.1
- Toggle switch component

### vue3-popper 1.5.0
- Tooltip and popover positioning

### vue3-click-away 1.2.4
- Click outside detection

## Electron Ecosystem

### electron-store 8.1.0
- Persistent configuration storage
- JSON-based settings

### electron-log 5.4.2
- Logging for main and renderer
- File and console transports

### electron-updater 4.6.5
- Auto-update functionality
- GitHub releases integration

### electron-context-menu 3.4.0
- Custom context menus

### electron-shutdown-command 2.0.1
- System shutdown commands

## Utilities

### File System
- `fs-extra 11.1.1` - Enhanced file system operations
- `junk 3.1.0` - Filter junk files

### Configuration
- `js-ini 1.6.0` - INI file parsing
- `electron-store` - Settings persistence

### Process Management
- `ps-list 7.2.0` - List running processes

### HTTP
- `node-fetch 2.6.7` - HTTP client

### Event Bus
- `mitt 3.0.0` - Event emitter

### System Information
- `fetch-installed-software 0.0.7` - Detect installed software

## Development Tools

### Linting

#### ESLint 8.42.0
- JavaScript/TypeScript linting
- Vue plugin support
- Configuration: `.eslintrc.js`
- Multiple config files for different contexts

#### Stylelint 13.12.0
- CSS/SCSS linting
- Configuration: `.stylelintrc.json`

#### Prettier 2.8.7
- Code formatting
- Configuration: `.prettierrc.json`

### Git Hooks

#### lint-staged 12.1.3
- Run linters on staged files
- Configuration: `lint-staged.config.js`

#### commitlint 15.0.0
- Enforce conventional commits
- Configuration in package.json

### Development Utilities

#### nodemon 2.0.15
- Auto-restart on file changes
- Configuration in package.json

#### ts-node 10.9.1
- TypeScript execution without compilation

#### cross-env 7.0.3
- Cross-platform environment variables

## Development Commands

### Building
```bash
npm run compile          # Compile TypeScript
npm run build           # Build production app
npm run clean           # Clean build artifacts
```

### Development
```bash
npm run dev             # Start development mode
npm run start:old       # Legacy start command
```

### Testing
```bash
npm test                # Run all tests
npm run test:unit       # Run unit tests
npm run test:unit:main  # Main process unit tests
npm run test:unit:renderer  # Renderer unit tests
npm run test:e2e        # Run E2E tests
npm run test:e2e:screenshot  # E2E with screenshots
```

### Linting
```bash
npm run lint            # Run all linters
npm run lint:fix        # Fix linting issues
npm run lint:eslint     # ESLint only
npm run lint:styles     # Stylelint only
npm run lint:typescript # TypeScript check
npm run lint:prettier   # Prettier check
```

### Debugging
```bash
npm run electron:debug:main      # Debug main process
npm run electron:debug:renderer  # Debug renderer process
```

## Dependencies Management

### Package Manager
- npm (lockfile: package-lock.json)
- Node version specified in `.nvmrc`

### Dependency Categories
- **Production**: Runtime dependencies
- **Development**: Build tools, testing, linting
- **Peer**: Framework requirements

## Version Control

### Git
- Repository: https://github.com/Wildlander-mod/Launcher
- Conventional commits enforced
- Branch protection via CI/CD

### CI/CD (GitHub Actions)
- `.github/workflows/pre-merge.yml` - Pre-merge checks
- `.github/workflows/release.yml` - Release automation
- `.github/workflows/version.yml` - Version management
- `.github/workflows/codeql-analysis.yml` - Security scanning
- `.github/workflows/rebase.yml` - Automated rebasing

## Configuration Files

### TypeScript
- `tsconfig.base.json` - Shared configuration
- `tsconfig.json` - Root configuration
- `tsconfig.main.json` - Main process
- `tsconfig.renderer.json` - Renderer process

### Build Tools
- `electron.vite.config.ts` - Vite configuration
- `vue.config.js` - Vue CLI configuration
- `babel.config.js` - Babel configuration

### Testing
- `jest.config.ts` - Jest configuration
- `.mocharc.json` - Mocha configuration
- `playwright.config.ts` - Playwright configuration
- `.nycrc` - NYC coverage configuration

### Linting
- `.eslintrc.js` - ESLint root config
- `.eslintignore` - ESLint ignore patterns
- `.stylelintrc.json` - Stylelint config
- `.prettierrc.json` - Prettier config
- `.prettierignore` - Prettier ignore patterns

### Docker
- `Dockerfile` - E2E test container
- `docker-compose.yaml` - Docker Compose services
- `.dockerignore` - Docker ignore patterns
