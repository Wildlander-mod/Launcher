# Junie Development Guidelines

## Core Principles

### 1. TypeScript Strict Settings

- **Always follow TypeScript strict settings** in all projects

### 2. Plan-First Development Approach

- **Junie's DEFAULT behavior is to ONLY create plans and then STOP**
- **Junie must NEVER proceed with implementation unless explicitly told to do so**
- **Never proceed with implementation until the plan is approved**
- **Implementation is NOT part of Junie's default workflow - it requires explicit instruction**
- Plans must be comprehensive and detailed before any code changes
- Implementation should only begin after explicit approval of the plan

### 3. Plan Management

- **Always create a plan stored as markdown in `.junie/plans/`**
- Plans should be updated as Junie makes progress
- **Plans should be updated after implementation to include implementation details**
- **Plans should be kept local and not committed to version control**

## Plan Structure Requirements

Based on the reference `.junie/plan.md`, all plans must include the following sections:

### Required Plan Sections

#### 1. **Overview**

- Brief description of the task/feature/refactoring
- High-level goals and objectives

#### 2. **Current State Analysis**

- Analysis of existing code/system
- Identification of current issues or areas for improvement
- Assessment of existing components, files, and structure

#### 3. **Implementation Plan**

- Detailed phases with numbered tasks
- Clear task breakdown with sub-tasks
- Progress tracking with checkmarks (✓ for completed, ! for failed, * for in progress)
- Each phase should have specific deliverables

#### 4. **File Structure (Target)**

- Clear representation of the intended file/directory structure
- Use code blocks with tree structure visualization
- Show both existing and new files

#### 5. **Key Principles**

- List of guiding principles for the implementation
- Best practices to follow
- Design patterns or architectural decisions

#### 6. **Success Criteria**

- Measurable outcomes that define completion
- Testing requirements
- Performance or quality benchmarks

#### 7. **Implementation Summary** (Post-Implementation)

- Summary of what was accomplished
- Key benefits achieved
- Any deviations from the original plan
- Lessons learned

#### 8. **Notes**

- Important considerations
- Dependencies or prerequisites
- Risk mitigation strategies

### Plan Formatting Guidelines

#### Task Tracking

- Use `[✓]` for completed tasks
- Use `[!]` for failed tasks
- Use `[*]` for tasks in progress
- Use `[ ]` for pending tasks
- Maintain hierarchical progress tracking (parent tasks reflect sub-task status)

#### Code Examples

- Use proper markdown code blocks with language specification
- Include file paths and line numbers when relevant
- Show before/after comparisons when applicable

#### File References

- Always use full file paths
- Use backticks for inline file references
- Group related files logically

## Workflow Process

### Phase 1: Planning (Junie's Default Behavior)

1. **Create comprehensive plan** in `.junie/plans/[task-name].md`
2. **Include all required sections** as outlined above
3. **STOP and wait for explicit approval** - do NOT proceed to implementation
4. **This is where Junie's default workflow ends** - implementation requires separate instruction
5. **Address feedback** and update plan if necessary

### Phase 2: Implementation (Only After Approval)

1. **Follow the approved plan** step by step
2. **Update plan progress** as tasks are completed
3. **Document any deviations** from the original plan
4. **Test thoroughly** at each milestone

### Phase 3: Post-Implementation

1. **Update plan with implementation details**
2. **Complete the Implementation Summary section**
3. **Document lessons learned and best practices**
4. **Run all tests** to ensure the implementation doesn't break existing functionality
5. **Make a commit using conventional commit format** to document the successful implementation
6. **Archive or organize plans** for future reference

## Quality Standards

### Code Quality

- All code must pass TypeScript strict checks
- Follow established coding standards and conventions
- Include proper error handling and edge case management
- Write comprehensive tests for new functionality

### Documentation

- Plans must be clear, detailed, and actionable
- Use proper markdown formatting
- Include diagrams or visual aids when helpful
- Keep plans updated and accurate

### Testing

- All implementations must include appropriate tests
- Existing tests must continue to pass
- Edge cases and error scenarios must be covered
- Performance implications should be considered

## Plan Storage and Organization

### Directory Structure

```
.junie/
├── guidelines.md (this file)
├── plans/
│   ├── [task-name].md
│   ├── [feature-name].md
│   └── archived/
│       └── [completed-tasks].md
└── templates/
    └── plan-template.md
```

### Naming Conventions

- Use kebab-case for plan file names
- Include date prefix for time-sensitive plans: `2024-01-15-feature-name.md`
- Use descriptive names that clearly indicate the scope

## Best Practices

### Planning Best Practices

- Break down complex tasks into manageable phases
- Consider dependencies and prerequisites
- Plan for testing and validation
- Include rollback strategies for risky changes

### Implementation Best Practices

- Follow the plan strictly unless approved deviations occur
- Test incrementally as you progress
- Update documentation alongside code changes
- Maintain clean commit history with descriptive messages
- **Always run `npm run lint:fix` at the end of each implementation block and fix any linting issues that arise**

### Version Control Best Practices

- **Commit regularly** every time there is a working implementation with passing tests and linting passing
- Maintain clean commit history with descriptive messages
- Follow established branching strategies and workflows
- Include meaningful commit messages that explain the "why" behind changes

### Communication Best Practices

- Plans should be self-explanatory to other developers
- Use clear, concise language
- Include context and rationale for decisions
- Document assumptions and constraints

## Compliance

All Junie development work must adhere to these guidelines. Any deviations must be:

1. Documented with clear justification
2. Approved by appropriate stakeholders
3. Updated in the relevant plan documentation

These guidelines ensure consistent, high-quality development practices and maintainable project documentation.
