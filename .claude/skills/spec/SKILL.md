---
name: spec
description: SDD step 1 of 7 — interview the engineer and write a feature spec to .claude/specs/<name>.spec.md. Only for feature work under apps/ or packages/.
argument-hint: "<feature-name> [sc-XXXX]"
disable-model-invocation: true
---

# /spec — write a feature spec

Arguments: `$ARGUMENTS` → `<name>` (kebab-case) and an optional Shortcut ID `sc-XXXX`.

First read `.claude/sdd/workflow.md` and follow its rules.

## Preconditions

- No `<name>` → ask for one and stop.
- `.claude/specs/<name>.spec.md` exists and isn't `DRAFT` → refuse: specs change only through a new
  `DRAFT` that the engineer approves. Offer to reopen it as `DRAFT`.
- The work only touches tooling (root config, `.github/`, `docker-*`, `.claude/`) → say a spec isn't
  needed and suggest `/plan <name>`.

## Steps

1. **Look before asking.** Read the code the feature touches (feature dir, integration services,
   XState machines, `packages/ui` components, existing E2E features) so the questions are specific.
2. **Interview, one group at a time**, waiting for answers between groups:
   - **A. Scope:** user-facing purpose; app/area; existing features, routes and components touched.
   - **B. Behaviour:** happy path step by step; entry point; success exit state; numbered requirements.
   - **C. Data and state:** what's fetched and from where; mutations and canister calls; new
     machine, atom or context.
   - **D. Constraints:** edge cases; out of scope; which journeys need E2E coverage.
   - **E. UI** (only if the feature has UI): loading, empty, error and optimistic states; a11y
     beyond baseline; responsive differences; animation.
3. **Write** `.claude/specs/<name>.spec.md` from this skill's [template.md](template.md). Keep `Status: DRAFT`.
   Requirements must be numbered and testable; `/verify` checks them one by one.
4. **Gate:** report the file path and the open questions, and say:
   "Review the spec, edit it or tell me what to change, then say **approved**."
5. When the engineer says **approved**, set `> Status: APPROVED` and end with `Next: /plan <name>`.
