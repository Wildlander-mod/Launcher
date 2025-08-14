# Junie Development Guidelines

## Core Principles

### 1. TypeScript Strict Settings

- **Always follow TypeScript strict settings** in all projects
- **Note:** Use `vue-tsc` instead of `tsc` for Vue projects

### 2. Planning When Requested

- **By default, Junie should proceed directly to implementation unless a plan is specifically requested**
- When plans are requested, they must be comprehensive and detailed before any code changes
- Plans should be approved before implementation begins when they are created
- For complex tasks, consider requesting a plan to ensure proper structure and approach

### 3. Plan Management

- **When creating a plan, store it as markdown in `.junie/plans/`**
- Plans should be updated as Junie makes progress
- **Plans should be updated after implementation to include implementation details**
- **Plans should be kept local**
- **Completed plans should be moved to `.junie/plans/completed/` to maintain organization**
- **Abandoned plans should be moved to `.junie/plans/archived/` to maintain organization**
- **Note:** Once plans are moved to `completed/` or `archived/` directories, git will no longer track them as these directories are gitignored
- **Important:** When updating implementation plans, do not remove completed items from the plan. Only check off items as completed to maintain a complete record of all work done.
- **Note:** When iterating on an already existing plan, implementation should be done directly without creating a new plan. Update the original plan.
- **Note:** When instructed to update multiple plan phases, Junie should update the plan as it goes along and not at the end.

## Plan Structure Requirements

For detailed plan structure requirements and formatting guidelines, see the plan template at `.junie/templates/plan.template.plan.md`.

## Workflow Process

### Phase 1: Planning (Only When Requested)

1. **Create comprehensive plan** in `.junie/plans/[task-name].plan.md`
2. **Include all required sections** as outlined in the plan template
3. **STOP and wait for explicit approval** - do NOT proceed to implementation
4. **Address feedback** and update plan if necessary

### Phase 2: Implementation (Junie's Default Behavior)

1. **Follow the approved plan** step by step (if a plan exists)
2. **Update plan progress** as tasks are completed (if a plan exists)
3. **Document any deviations** from the original plan (if applicable)
4. **Test thoroughly** at each milestone

### Phase 3: Post-Implementation

1. **Update plan with implementation details** (if a plan exists)
2. **Complete the Implementation Summary section** (if a plan exists)
3. **Document lessons learned and best practices**
4. **Move completed plans to `.junie/plans/completed/`** to maintain organization (if a plan exists)

## Quality Standards

### Code Quality

- All code must pass TypeScript strict checks
- Follow established coding standards and conventions
- Include proper error handling and edge case management
- Write comprehensive tests for new functionality

### Documentation

- Plans must be clear, detailed, and actionable (when created)
- Use proper markdown formatting
- Include diagrams or visual aids when helpful
- Keep plans updated and accurate (when they exist)
- **Note:** Ignore syntax errors in formatted code blocks when they are used for illustrative purposes in documentation

### Testing

- All implementations must include appropriate tests
- Existing tests must continue to pass
- Edge cases and error scenarios must be covered
- Performance implications should be considered
- **E2E Test IDs:** All e2e test IDs should be abstracted as page object class properties (static readonly) to ensure maintainability and reusability

### Directory Structure

```
.junie/
├── guidelines.md (this file)
├── plans/
│   ├── [task-name].md
│   ├── [feature-name].md
│   ├── archived/
│   │   └── [abandoned-plans].md
│   └── completed/
│       └── [successfully-completed-plans].md
└── templates/
    └── plan.template.md
```

### Directory Purpose

- **`plans/`**: Active plans currently being worked on
- **`plans/archived/`**: Abandoned plans moved here to maintain organization
- **`plans/completed/`**: Successfully completed plans moved here to maintain organization

### Directory Usage Guidelines

**When to use `completed/`:**
- Plans that have been successfully implemented and all success criteria met
- Plans where all phases have been completed as intended
- Plans that resulted in working, tested solutions

**When to use `archived/`:**
- Plans that were abandoned before completion
- Plans that were started but not finished due to changing requirements
- Plans that Junie is told to abandon during development
- Plans moved manually when no longer relevant

**Automation:**
- Junie will automatically move plans to `archived/` when explicitly told to abandon a plan
- Users can manually move plans between directories as needed

### Naming Conventions

- Use kebab-case for plan file names
- Use descriptive names that clearly indicate the scope

## Best Practices

### Planning Best Practices

- Break down complex tasks into manageable phases
- **Phases should always focus on creating working solutions** - each phase must end with the application in a functional state
- **Phases do not have to complete whole tasks** but should always result in a working application
- **Later phases can remove or edit code from previous phases** to continue improving the solution while maintaining functionality
- Consider dependencies and prerequisites
- Plan for testing and validation
- Include rollback strategies for risky changes
- **Always include an analysis phase as the first phase in every plan** to ensure proper understanding of the current state, requirements, and constraints before proceeding with implementation

### Implementation Best Practices

- Follow the plan strictly unless approved deviations occur (if a plan exists)
- **When told to continue with a plan implementation, implement only the next minor phase one at a time** (e.g., implement just 2.1 and not all of phase 2)
- **When implementing more than one phase, update the plan alongside implementation changes and not just at the end** to maintain accurate progress tracking and documentation
- Test incrementally as you progress
- Update documentation alongside code changes
- **Always run `npm run lint:fix` at the end of each implementation block and fix any linting issues that arise**
- **Run tests after each change** to ensure functionality remains intact and no regressions are introduced

### Communication Best Practices

- Plans should be self-explanatory to other developers (when created)
- Use clear, concise language
- Include context and rationale for decisions
- Document assumptions and constraints

## Compliance

All Junie development work must adhere to these guidelines. Any deviations must be:

1. Documented with clear justification
2. Approved by appropriate stakeholders
3. Updated in the relevant plan documentation (if a plan exists)

These guidelines ensure consistent, high-quality development practices and maintainable project documentation.
