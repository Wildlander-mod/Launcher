# Plan Template

## Plan Structure Requirements

All plans must include the following sections:

### Required Plan Sections

#### 1. **Overview**

- Brief description of the task/feature/refactoring
- High-level goals and objectives
- **Status**: Phase x.y Complete

#### 2. **Current State Analysis**

- Analysis of existing code/system
- Identification of current issues or areas for improvement
- Assessment of existing components, files, and structure

#### 3. **Implementation Plan**

- Detailed phases with numbered tasks
- Clear task breakdown with sub-tasks
- Progress tracking with checkmarks (✓ for completed, ! for failed, * for in progress)
- Each phase should have specific deliverables
- Each phase should have specific code that will be implemented

**Example Structure (should be followed as close as possible):**

```markdown
### Phase 1: Implementation
- [ ] 1.1 Core functionality
  - [ ] 1.1.1 Create base components
  - [ ] 1.1.2 Implement business logic
  - [ ] 1.1.3 Add error handling
- [ ] 1.2 Integration
  - [ ] 1.2.1 Connect to existing systems
  - [ ] 1.2.2 Update routing

### Phase 2: Implementation of x
- [ ] 2.1 Core functionality
    - [ ] 2.1.1 Create base components
    - [ ] 2.1.2 Implement business logic
    - [ ] 2.1.3 Add error handling
- [ ] 2.2 Integration
    - [ ] 2.2.1 Connect to existing systems
    - [ ] 2.2.2 Update routing

### Phase 1 code

```

#### 4. **File Structure (Target)**

- Clear representation of the intended file/directory structure
- Use code blocks with tree structure visualization
- Show both existing and new files

#### 5. **Implementation Summary** (Post-Implementation)

- Summary of what was accomplished
- Any deviations from the original plan

#### 6. **Notes**

- Important considerations
- Dependencies or prerequisites

### Plan Formatting Guidelines

#### Task Tracking

- Use `[✓]` for completed tasks
- Use `[!]` for failed tasks
- Use `[*]` for tasks in progress
- Use `[ ]` for pending tasks
- Maintain hierarchical progress tracking (parent tasks reflect sub-task status)

**Example of Hierarchical Progress Tracking:**

```markdown
- [✓] 1.1 Analyze current codebase
  - [✓] 1.1.1 Review existing components
  - [✓] 1.1.2 Identify dependencies
  - [✓] 1.1.3 Document current architecture
- [*] 1.2 Setup development environment
  - [✓] 1.2.1 Install required dependencies
  - [ ] 1.2.2 Configure build tools
```

*Note: Parent task status should reflect the overall progress of its sub-tasks.*

#### Code Examples

- Use proper markdown code blocks with language specification
- Always include any code that will be generated
- Include file paths and line numbers when relevant
- Show before/after comparisons when applicable

#### File References

- Always use full file paths
- Use backticks for inline file references
- Group related files logically
