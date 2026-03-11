# TypeScript Guidelines

## Type Assertions

**Never use type assertions** (`as` keyword or angle-bracket syntax).

Type assertions bypass TypeScript's type checking and can lead to runtime errors. Instead:

- Use proper type guards
- Refine types through conditional checks
- Use type predicates
- Ensure proper typing at the source

Examples of what to avoid:
```typescript
// ❌ Don't do this
const value = someValue as string;
const data = <MyType>response;
```

Examples of proper alternatives:
```typescript
// ✅ Use type guards
if (typeof value === 'string') {
  // value is now typed as string
}

// ✅ Use type predicates
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```
