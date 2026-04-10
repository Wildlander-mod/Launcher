# Package Management Guidelines

## Installing and Removing Packages

Always use npm CLI commands to add or remove dependencies. Never manually edit `package.json` or `package-lock.json`.

```bash
# Adding a dependency
npm install <package>
npm install --save-dev <package>

# Removing a dependency
npm uninstall <package>
```

Manual edits bypass npm's dependency resolution and can leave `package-lock.json` out of sync.
