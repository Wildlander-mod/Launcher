# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

# Claude Code Development Guidelines

## Core Principles

### 1. Planning When Requested

- **By default, Claude should proceed directly to implementation unless a plan is specifically requested**
- When plans are requested, they must be comprehensive and detailed before any code changes
- Plans should be approved before implementation begins when they are created
- For complex tasks, consider requesting a plan to ensure proper structure and approach

### 2. Plan Management

- **When creating a plan, store it as markdown in `.claude/plans/`**
- **Plan creations and changes should be committed to git** to maintain a proper development history
- Plans should be updated as Claude makes progress
- **Plans should be updated after implementation to include implementation details**
- **Completed plans should be moved to `.claude/plans/completed/` to maintain organization**
- **Abandoned plans should be moved to `.claude/plans/archived/` to maintain organization**
- **Note:** Once plans are moved to `completed/` or `archived/` directories, git will no longer track them as these directories are gitignored
- **Important:** When updating implementation plans, do not remove completed items from the plan. Only check off items as completed to maintain a complete record of all work done.
- **Note:** When iterating on an already existing plan, implementation should be done directly without creating a new plan. Update the original plan.
- **Note:** When instructed to update multiple plan phases, Claude should update the plan as it goes along and not at the end.

## Plan Structure Requirements

For detailed plan structure requirements and formatting guidelines, see the plan template at `.claude/templates/plan.template.md`.

## Workflow Process

### Phase 1: Planning (Only When Requested)

1. **Create comprehensive plan** in `.claude/plans/[task-name].plan.md`
2. **Include all required sections** as outlined in the plan template
3. **Automatically perform Current State Analysis** - this analysis phase must always be completed when creating the plan, including:
   - Analysis of existing code/system
   - Identification of current issues or areas for improvement
   - Assessment of existing components, files, and structure
4. **STOP and wait for explicit approval** - do NOT proceed to implementation
5. **Address feedback** and update plan if necessary

### Phase 2: Implementation (Claude's Default Behavior)

1. **Follow the approved plan** step by step (if a plan exists)
2. **Update plan progress** as tasks are completed (if a plan exists)
3. **Document any deviations** from the original plan (if applicable)
4. **Test thoroughly** at each milestone

### Phase 3: Post-Implementation

1. **Update plan with implementation details** (if a plan exists)
2. **Complete the Implementation Summary section** (if a plan exists)
3. **Document lessons learned and best practices**
4. **Move completed plans to `.claude/plans/completed/`** to maintain organization (if a plan exists)

## Quality Standards

### Code Quality

- Follow established coding standards and conventions
- Include proper error handling and edge case management
- Write comprehensive tests for new functionality

### Documentation

- Plans must be clear, detailed, and actionable (when created)
- Use proper markdown formatting
- Include diagrams or visual aids when helpful
- Keep plans updated and accurate (when they exist)
- **Note:** Ignore syntax errors in formatted code blocks when they are used for illustrative purposes in documentation
- **Code Formatting:** Always include a bullet point list of simple steps above code sections. Code should appear below bullet points and should not be included within bullet point lists themselves

### Testing

- All implementations must include appropriate tests
- Existing tests must continue to pass
- Edge cases and error scenarios must be covered
- Performance implications should be considered
- **E2E Test IDs:** All e2e test IDs should be abstracted as page object class properties (static readonly) to ensure maintainability and reusability

### Directory Structure

```
.claude/
├── rules/
│   └── planning.md (this file)
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
- Plans that Claude is told to abandon during development
- Plans moved manually when no longer relevant

**Automation:**
- Claude will automatically move plans to `archived/` when explicitly told to abandon a plan
- Users can manually move plans between directories as needed

### Naming Conventions

- Use kebab-case for plan file names
- Use descriptive names that clearly indicate the scope

## Best Practices

### Planning Best Practices

- Break down complex tasks into manageable phases
- Consider dependencies and prerequisites
- Plan for testing and validation
- Include rollback strategies for risky changes

### Implementation Best Practices

- Follow the plan strictly unless approved deviations occur (if a plan exists)
- **When told to continue with a plan implementation, implement only the next minor phase one at a time** (e.g., implement just 2.1 and not all of phase 2)
- **When implementing more than one phase, update the plan alongside implementation changes and not just at the end** to maintain accurate progress tracking and documentation
- **When implementing code that will be modified in a later phase, add a comment explaining this** and remove the comment after making the planned changes
- Test incrementally as you progress
- Update documentation alongside code changes
- **Always run `npm run lint:fix` at the end of each implementation block and fix any linting issues that arise**
- **Run tests after each change** to ensure functionality remains intact and no regressions are introduced

### Version Control Best Practices

- Maintain clean commit history with descriptive messages
- Follow established branching strategies and workflows
- Include meaningful commit messages that explain the "why" behind changes

### Communication Best Practices

- Plans should be self-explanatory to other developers (when created)
- Use clear, concise language
- Include context and rationale for decisions
- Document assumptions and constraints

## Compliance

All Claude development work must adhere to these guidelines. Any deviations must be:

1. Documented with clear justification
2. Approved by appropriate stakeholders
3. Updated in the relevant plan documentation (if a plan exists)

These guidelines ensure consistent, high-quality development practices and maintainable project documentation.