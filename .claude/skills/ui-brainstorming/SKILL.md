# Skill: ui-brainstorming

## Purpose

Design new features or user flows by interviewing the engineer on requirements and producing a complete, human-reviewable spec.

## Trigger

User invokes `/ui-brainstorming [feature-name]` or asks to design/spec a new UI feature.

## Behavior

### Step 1 — Interview

Ask the following questions **one group at a time** (wait for answers before proceeding):

**Group A — Scope**

1. What is the feature name and its one-sentence user-facing purpose?
2. Which app/area does this live in? (`nfid-frontend`, `nfid-wallet`, embed, etc.)
3. Which existing features, routes, or components does this touch or extend?

**Group B — UX & Flows** 4. Describe the primary happy path step-by-step from the user's perspective. 5. What triggers the entry point? (button click, route navigation, deeplink, wallet event?) 6. What is the success exit state? (modal closes, route changes, toast shown?)

**Group C — States** 7. What does the **loading** state look like? (skeleton, spinner, disabled CTA?) 8. What does the **empty** state look like? (first-time user, no data?) 9. What are the **error** states? (network failure, validation, chain error, user rejection?) 10. Are there any **optimistic** UI updates required?

**Group D — State & Data** 11. What data is fetched? From where? (SWR hook, XState service, direct API?) 12. Is any new global state needed? (XState machine, Jotai atom, context?) 13. What mutations or side effects happen? (write to chain, canister call, wallet tx?)

**Group E — Constraints** 14. Any a11y requirements beyond baseline? (screen reader priority, focus trap?) 15. Any responsive breakpoints that differ from the standard mobile/desktop split? 16. Any animation or transition requirements? (Framer Motion, Tailwind transitions?) 17. Are there i18n/localization requirements?

### Step 2 — Produce Spec

After all answers are collected, write the spec file:

**Output path:** `.claude/specs/[feature-name].spec.md`

**Spec template:**

```markdown
# Spec: [Feature Name]

> Status: DRAFT — awaiting engineer approval
> Created: [date]

## Overview

[one paragraph]

## Scope

- App/area:
- Entry point:
- Exit state:

## User Flow

1. …

## Component States

| State   | Trigger | UI Behavior |
| ------- | ------- | ----------- |
| loading | …       | …           |
| empty   | …       | …           |
| error   | …       | …           |
| success | …       | …           |

## Data & State Design

- Fetch: [hook/service]
- Mutations: [describe]
- New state: [XState machine / Jotai atom / none]

## Accessibility

- [ ] Focus trap (if modal)
- [ ] aria-labels
- [ ] Keyboard navigation
- [ ] WCAG AA contrast

## Responsive Behavior

- Mobile: …
- Desktop: …

## Edge Cases

- …

## Out of Scope

- …
```

### Step 3 — Gate

Tell the engineer:

> "Spec written to `.claude/specs/[feature-name].spec.md`. Review it, make any edits, then tell me it's approved so we can proceed to `/ui-planning`."

Do NOT proceed to planning until explicitly told the spec is approved.
