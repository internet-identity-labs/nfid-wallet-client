# Skill: ui-planning

## Purpose

Break down an approved frontend spec into a precise, executable technical plan.

## Trigger

User invokes `/ui-planning [feature-name]` after approving the spec at `.claude/specs/[feature-name].spec.md`.

## Pre-condition Check

1. Read `.claude/specs/[feature-name].spec.md`.
2. Verify it exists and does NOT contain `Status: DRAFT`.
3. If it is still DRAFT or missing, respond:
   > "No approved spec found for `[feature-name]`. Run `/ui-brainstorming [feature-name]` first."

## Behavior

### Step 1 — Codebase Analysis

Before writing the plan, silently perform these lookups:

- Find existing components that can be reused (search `packages/ui/src/`)
- Find the relevant feature directory in `apps/nfid-frontend/src/features/`
- Identify any XState machines that need extension
- Identify SWR hooks or integration services that need new methods
- Check for existing types in `apps/nfid-frontend/src/types/`

### Step 2 — Write the Plan

**Output path:** `.claude/plans/[feature-name].plan.md`

**Plan template:**

```markdown
# Plan: [Feature Name]

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/[feature-name].spec.md
> Created: [date]

## New Files

| File                                               | Type      | Purpose |
| -------------------------------------------------- | --------- | ------- |
| `apps/nfid-frontend/src/features/[name]/index.tsx` | Component | …       |
| …                                                  | …         | …       |

## Modified Files

| File                                                | Change              |
| --------------------------------------------------- | ------------------- |
| `apps/nfid-frontend/src/features/[name]/machine.ts` | Add new state/event |
| …                                                   | …                   |

## Types

- [ ] Define `[TypeName]` in `apps/nfid-frontend/src/types/[file].ts`

## XState / State Changes

- [ ] [Describe new state, event, or guard]

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

### Types & Interfaces

- [ ] [task]

### Data Layer

- [ ] [task] — hook/service method

### State Machine

- [ ] [task] — new state or transition

### Atoms / Context

- [ ] [task]

### Components — Atoms

- [ ] [task] — `ComponentName` in `packages/ui/src/atoms/`

### Components — Feature

- [ ] [task] — `ComponentName` in `apps/nfid-frontend/src/features/[name]/`

### Tests

- [ ] Unit test: [component or hook]
- [ ] Integration test: [service or machine]

### Wiring

- [ ] Register route in `App.tsx` or parent coordinator
- [ ] Export from barrel index

### Verification

- [ ] `yarn nx lint nfid-frontend` — zero new errors
- [ ] `yarn nx test nfid-frontend` — all passing
- [ ] `tsc --noEmit` — zero errors
- [ ] Manual smoke test in dev server

## Risks & Notes

- …
```

### Step 3 — Gate

Tell the engineer:

> "Plan written to `.claude/plans/[feature-name].plan.md`. Review the checklist, reorder or remove tasks as needed, then tell me it's approved so we can begin `/execute-ui-plan [feature-name]`."

Do NOT begin execution until explicitly told the plan is approved.
