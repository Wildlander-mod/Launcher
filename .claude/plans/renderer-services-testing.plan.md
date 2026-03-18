# Renderer Services Testing Requirements

## All renderer services require comprehensive tests

**Note:** Every time a service has a plan to test it, once the testing implementation is completed, this plan should be updated to reflect the completion status.

**Important:** After implementing tests for each service, always run the test suite to verify the tests pass before marking the service as completed.

## Service Testing Checklist

Below is a complete list of all renderer services and entry files that require testing:

### Services
- [x] cache.service.ts - completed ✓
- [x] event.service.ts - skipped (no logic; only re-exports a mitt instance and string constants) ✓
- [x] ipc.service.ts - completed ✓
- [x] message.service.ts - completed ✓
- [x] modal.service.ts - completed ✓
- [ ] modpack.service.ts
- [ ] patreon.service.ts
- [ ] posts.service.ts
- [ ] service-container.ts

### Entry / Routing
- [ ] index.ts
- [ ] router/index.ts

## Total Files: 11

Each service should have:
- Unit tests covering all functionality
- Tests should focus on having single assertions per test where possible
- Tests should be written in Jest
- External dependencies (IPC, browser APIs, etc.) should be mocked at the boundary
