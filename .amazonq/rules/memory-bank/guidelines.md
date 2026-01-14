# Development Guidelines

## Code Quality Standards

### TypeScript Strict Mode
- **Strict type checking enabled** across all tsconfig files
- **No type assertions allowed** - never use `as` keyword or angle-bracket syntax
- Use type guards, type predicates, and proper typing at the source
- All functions must have explicit return types
- All parameters must have explicit types

### Import Organization
- Use path aliases consistently: `@/` for src root, `@renderer/` for renderer src
- Group imports logically:
  1. External dependencies (node modules)
  2. Internal absolute imports (using `@/` alias)
  3. Relative imports
- Import types using `import type` syntax when importing only types

Example:
```typescript
import { promisify } from "util";
import fs from "fs";
import { ConfigService } from "@/main/services/config.service";
import { Logger, LoggerBinding } from "@/main/logger";
import type { Resolution } from "@/shared/types/Resolution";
import type Electron from "electron";
```

### File Naming Conventions
- **Services**: `*.service.ts` (e.g., `enb.service.ts`, `resolution.service.ts`)
- **Controllers**: `*.controller.ts`
- **Tests**: `*.test.ts` for unit tests, `*.e2e.ts` for E2E tests
- **Type definitions**: `*.d.ts` for declaration files
- **Vue components**: PascalCase (e.g., `AppModal.vue`, `BaseButton.vue`)

### Code Formatting
- Use Prettier for consistent formatting
- 2-space indentation
- No semicolons (enforced by Prettier)
- Double quotes for strings
- Trailing commas in multi-line structures

## Testing Standards

### Unit Test Structure (Main Process - Mocha)
- Use `describe` blocks to group related tests
- Use descriptive test names with `it` blocks
- Include test tags in describe blocks: `#main #service`, `#main #controller`
- Single assertion per test where possible
- Use `beforeEach` for test setup
- Use `afterEach` for cleanup (restore mocks, restore file system)

Example:
```typescript
describe("ENB service #main #service", () => {
  let enbService: EnbService;
  let mockConfigService: StubbedInstanceWithSinonAccessor<ConfigService>;

  beforeEach(() => {
    mockConfigService = createStubInstance(ConfigService);
    enbService = new EnbService(mockConfigService, getMockLogger());
  });

  afterEach(() => {
    mockFs.restore();
    sinon.restore();
  });

  describe("getEnbPresets", () => {
    it("should get the enb presets", async () => {
      mockConfigService.stubs.getPreference.returns("test");
      mockFs({
        "test/launcher": {
          "ENB Presets": { test1: {}, test2: {} },
        },
      });
      expect(await enbService.getEnbPresets()).to.eql([...]);
    });
  });
});
```

### Unit Test Structure (Renderer - Jest)
- Use shallow mounting by default: `mount(Component, { shallow: true })`
- Only mock child components when necessary with explicit explanation
- Single assertion per test where possible
- Use descriptive test names

### E2E Test Structure (Playwright)
- Use page object models for UI interactions
- Store test data as functions returning strings (for INI files, etc.)
- Tag screenshot tests with `@screenshot`
- Use Docker for consistent screenshot testing environment

### Mocking Patterns
- **File system**: Use `mock-fs` for file system mocking
- **Services**: Use `createStubInstance` from `@loopback/testlab`
- **Sinon**: Use for spies, stubs, and assertions
- Always restore mocks in `afterEach`

Example:
```typescript
mockFs({
  "test/launcher": {
    "ENB Presets": {
      test1: { "enbseries.ini": "content" },
    },
  },
});

// Later in afterEach
mockFs.restore();
sinon.restore();
```

## Dependency Injection Patterns

### Service Registration
- Use `@injectable` decorator with `BindingScope.SINGLETON`
- Use `@service` decorator for service injection
- Use `@inject` for binding injection
- Services are automatically discovered via LoopBack boot

Example:
```typescript
@injectable({
  scope: BindingScope.SINGLETON,
})
export class ResolutionService {
  constructor(
    @service(ConfigService) private configService: ConfigService,
    @inject(LoggerBinding) private logger: Logger,
    @inject(IsDevelopmentBinding) private isDevelopment: boolean,
    @inject(ElectronBinding) private electron: typeof Electron
  ) {}
}
```

### Binding Patterns
- Create dedicated binding files in `src/main/bindings/`
- Export binding keys as constants
- Bind static values in application constructor

Example:
```typescript
// In binding file
export const LoggerBinding = BindingKey.create<Logger>("logger");

// In application.ts
this.bind(LoggerBinding).to(log);
this.bind(VersionBinding).to(app.getVersion());
this.bind(IsDevelopmentBinding).to(is.dev);
```

## Service Layer Patterns

### Service Method Organization
- Public methods first, private methods last
- Group related methods together
- Use descriptive method names that indicate action and return type
- Async methods should be marked with `async` keyword

### Error Handling
- Use custom error classes for domain-specific errors
- Throw errors with descriptive messages
- Log errors before throwing when appropriate
- Handle errors at the appropriate level

Example:
```typescript
if (!enbPresets.length) {
  throw new NoEnbsError();
}
```

### Logging Patterns
- Use injected logger instance
- Log at appropriate levels: `debug`, `info`, `warn`, `error`, `silly`
- Include context in log messages
- Log before and after important operations

Example:
```typescript
this.logger.debug(`Getting resolutions`);
this.logger.info(`Setting resolution to ${width}x${height}`);
this.logger.error(`Error getting resolutions ${stderr}`);
```

### File System Operations
- Use `fs.promises` for async file operations
- Use `fs-extra` for enhanced file operations (copy, move, etc.)
- Always handle file system errors
- Use `mock-fs` for testing file operations

Example:
```typescript
const content = await fs.promises.readFile(path, "utf-8");
await fs.promises.writeFile(path, content);
```

### Configuration Management
- Use `ConfigService` for all user preferences
- Use `USER_PREFERENCE_KEYS` enum for preference keys
- Check preference existence with `hasPreference` before accessing
- Set preferences with `setPreference`

Example:
```typescript
const resolution = this.configService.getPreference<Resolution>(
  USER_PREFERENCE_KEYS.RESOLUTION
);
this.configService.setPreference(USER_PREFERENCE_KEYS.RESOLUTION, resolution);
```

## Architectural Patterns

### Separation of Concerns
- **Main process**: System operations, file I/O, business logic
- **Renderer process**: UI rendering, user interactions
- **Preload scripts**: Secure bridge between main and renderer
- **Shared code**: Types, enums, utilities used by both processes

### IPC Communication
- Controllers handle IPC communication
- Controllers delegate to services for business logic
- Use `ipcMain.handle` for request-response patterns
- Use `ipcRenderer.invoke` from renderer

### Caching Patterns
- Cache expensive computations (e.g., resolution list)
- Use private class properties for caches
- Invalidate caches when underlying data changes

Example:
```typescript
private resolutionsCache!: Resolution[];

public async getResolutions(): Promise<Resolution[]> {
  if (this.resolutionsCache) {
    return this.resolutionsCache;
  }
  // Compute resolutions
  this.resolutionsCache = sortedResolutions;
  return sortedResolutions;
}
```

### Resource Path Handling
- Use different paths for development vs production
- Check `isDevelopment` flag for environment-specific logic
- Use `process.resourcesPath` for production resources

Example:
```typescript
public getResourcePath() {
  return this.isDevelopment
    ? `${process.cwd()}/src/assets`
    : process.resourcesPath;
}
```

## Common Code Idioms

### Array Operations
- Use `filter`, `map`, `reduce` for transformations
- Use `some` and `every` for existence checks
- Use `find` for single item lookup
- Use spread operator for array copying

Example:
```typescript
const filtered = items.filter((x) => x.type === "ENB");
const mapped = items.map((x) => x.name);
const exists = items.some((x) => x.id === targetId);
```

### Set Operations for Uniqueness
- Use `Set` to remove duplicates
- Convert back to array with spread operator

Example:
```typescript
return [...new Set(resolutionStrings)].map(parseResolution);
```

### Object Destructuring
- Destructure objects in function parameters
- Destructure in variable assignments for clarity

Example:
```typescript
public isUltraWidescreen({ width, height }: Resolution) {
  return width / height > 1.78;
}

const { width, height } = this.getCurrentResolution();
```

### Async/Await Patterns
- Always use `async/await` over promises
- Handle errors with try/catch when appropriate
- Use `Promise.all` for parallel operations

### Type Guards
- Use `typeof` for primitive type checks
- Use `instanceof` for class instance checks
- Create custom type predicates when needed

### Conditional Logic
- Use ternary operators for simple conditions
- Use early returns to reduce nesting
- Use logical operators for default values

Example:
```typescript
const value = preference ?? defaultValue;
if (!isValid) return;
```

## Platform-Specific Code

### Windows-Specific Operations
- Check platform with `os.platform() !== "win32"`
- Provide fallbacks for non-Windows development
- Use environment variable `IS_TEST` for test environments

Example:
```typescript
if (os.platform() !== "win32" || process.env["IS_TEST"] === "true") {
  // Provide test/development fallback
} else {
  // Windows-specific implementation
}
```

### External Tool Integration
- Use `child_process.exec` for external tools
- Promisify exec for async/await usage
- Handle stdout and stderr appropriately
- Log errors from external tools

Example:
```typescript
const { stdout, stderr } = await promisify(this.childProcess.exec)(
  `"${this.getResourcePath()}/tools/QRes.exe" /L`
);
if (stderr) {
  this.logger.error(`Error: ${stderr}`);
  throw new Error(stderr);
}
```

## INI File Handling

### Parsing and Stringifying
- Use `js-ini` library for INI operations
- Parse with `parse(content, { comment: "#" })`
- Stringify with `stringify(object).trim()`
- Type INI objects as `IIniObjectSection`

Example:
```typescript
const iniContent = parse(
  await fs.promises.readFile(path, "utf-8"),
  { comment: "#" }
) as IIniObjectSection;

(iniContent["Section"] as IIniObjectSection)["Key"] = value;

await fs.promises.writeFile(path, stringify(iniContent).trim());
```

## Vue Component Patterns

### Component Naming
- Use PascalCase for component names
- Prefix base components with `Base` (e.g., `BaseButton`)
- Prefix app-specific components with `App` (e.g., `AppModal`)
- Prefix layout components with `The` (e.g., `TheHeader`)

### Component Organization
- Group components by type: base, feature, layout
- Keep components focused and single-purpose
- Extract reusable logic into composables

## Documentation Standards

### Code Comments
- Use JSDoc for public methods
- Explain "why" not "what" in comments
- Document complex algorithms
- Add TODO comments for future improvements

### Type Documentation
- Document complex types with comments
- Explain type utility purposes
- Reference sources for borrowed code

Example:
```typescript
// Note: determining all the overloads of a function type is not possible in default TypeScript
// These utility types make it possible.
// Taken from this thread https://github.com/microsoft/TypeScript/issues/32164
```

## Performance Considerations

### Caching Strategy
- Cache expensive computations
- Invalidate caches when data changes
- Use singleton services for shared state

### File Operations
- Batch file operations when possible
- Use async operations to avoid blocking
- Clean up resources in finally blocks

### Memory Management
- Restore mocks and file systems in tests
- Clean up event listeners
- Avoid memory leaks in long-running processes
