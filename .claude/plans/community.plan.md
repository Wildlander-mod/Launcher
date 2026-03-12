# Community.vue — Unit Tests Plan

## 1. Overview

Write unit tests for `Community.vue`, which renders four community resource links (YouTube, Twitch, Discord, Reddit). The component is entirely static — no props, no events, no conditional rendering. Tests will verify user-facing output: that each link renders with the correct `href`, image source, and label text.

**Status**: Complete ✓

---

## 2. Current State Analysis

- **Component**: `src/renderer/src/components/Community.vue`
- **Template**: Renders four `BaseLink` + `ImageWithText` pairs, each hardcoded with a URL, image path, and text label.
- **Script**: Class-based (`vue-class-component`). A `created()` hook sets `this.modpack = WildlanderModpack`, but `modpack` is never used in the template — dead code, not tested.
- **No props, no emits, no IPC, no conditional rendering.**
- **Child components**: `BaseLink`, `ImageWithText` — both will be shallow-stubbed.
- **Existing test file**: None.

Links rendered:

| Label   | href                                                      | image-source                     |
|---------|-----------------------------------------------------------|----------------------------------|
| YouTube | https://www.youtube.com/channel/UC-Bq60LjSeYd-_uEBzae5ww | /images/logos/youtube.svg        |
| Twitch  | https://www.twitch.tv/dylanbperry                         | /images/logos/twitch.svg         |
| Discord | https://discord.gg/8VkDrfq                                | /images/logos/discord.svg        |
| Reddit  | https://reddit.com/r/wildlander                           | /images/logos/reddit.svg         |

---

## 3. Implementation Plan

### Phase 1: Write tests

- [✓] 1.1 Create test file at `src/__tests__/unit/renderer/components/Community.test.ts`
  - [✓] 1.1.1 Mount with `shallow: true` and `renderStubDefaultSlot: true`
  - [✓] 1.1.2 Test that four `BaseLink` components are rendered
  - [✓] 1.1.3 Test each `BaseLink` renders with the correct `href`
  - [✓] 1.1.4 Test each `ImageWithText` renders with the correct `image-source` prop
  - [✓] 1.1.5 Test each `ImageWithText` renders with the correct `text` prop

### Phase 2: Verify

- [✓] 2.1 Run Wallaby (`wallaby_allTestsForFile`) to confirm all tests pass
- [✓] 2.2 Fix any failures
- [✓] 2.3 Update `renderer-components-testing.plan.md` to mark `Community.vue` as complete

---

## 4. File Structure (Target)

```
src/__tests__/unit/renderer/
└── components/
    └── Community.spec.ts   ← new
```

---

## 5. Key Principles

- `shallow: true` on all mounts — do not render `BaseLink` or `ImageWithText` internals.
- `renderStubDefaultSlot: true` in global config.
- One assertion per test.
- Test only user-facing output (rendered props, href values, label text).
- Do not test `modpack` — it is unused dead code.
- Use `findAllComponents` to locate stub instances and check their props.

---

## 6. Success Criteria

- All four links render with correct `href` values.
- All four `ImageWithText` stubs render with correct `image-source` and `text` props.
- No failing Wallaby tests.
- `Community.vue` marked complete in `renderer-components-testing.plan.md`.

---

## 7. Implementation Summary

14 tests written and passing across 2 groups:
- **4 `BaseLink` href tests** — each link verified with the correct `href` prop
- **8 `ImageWithText` prop tests** — each image verified with correct `imageSource` and `text` props
- **2 count tests** — asserting exactly 4 `BaseLink` and 4 `ImageWithText` components render

`modpack` excluded as confirmed dead code. No mocks required beyond `shallow: true`.

---

## 8. Notes

- `modpack` property is dead code — it is imported and set in `created()` but never referenced in the template. Excluded from tests.
- `AppPage` and `AppPageContent` are imported in the script but not used in the template — they will be ignored.
