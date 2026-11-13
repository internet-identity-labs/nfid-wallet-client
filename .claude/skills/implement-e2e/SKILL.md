---
name: implement-e2e
description: SDD step 4 of 7 — write the E2E coverage the plan's "E2E scope" asks for (Cucumber features, steps, page objects in apps/nfid-frontend-e2e), or record E2E N/A.
argument-hint: "<name>"
disable-model-invocation: true
---

# /implement-e2e — E2E scenarios for the plan

Arguments: `$ARGUMENTS` → `<name>`.

First read `.claude/templates/workflow.md` and follow its rules.

## Preconditions

- The status must be `IMPLEMENTED`. Otherwise refuse.
- The plan must have an `## E2E scope` section. If it's missing, set `DRAFT` and ask the engineer
  to decide the scope.

## E2E scope "None"

Set `> Status: E2E N/A — <reason from the plan>` and stop. Next: `/verify <name>`.

## Otherwise

1. **Study the suite first:** `apps/nfid-frontend-e2e/src/features/*.feature`, `src/steps/*.ts`,
   `src/pages/*.ts`, `src/helpers`, `wdio.conf.ts` (tags: `not @pending and not @mobile and not @skip`
   by default; `@desktop` / `@mobile` split).
2. **Write the scenarios** listed in the E2E scope:
   - Reuse existing step definitions and page objects. Add a step or page method only when nothing
     fits, in the existing file for that area.
   - Gherkin in the house style: one behaviour per scenario, `Scenario Outline` for data variations.
   - Tag every new scenario with its area tag (e.g. `@sendft`) and add `@desktop` / `@mobile` where
     the flow differs.
   - **Accounts:** use only accounts already in `users.json`. A new dev account needs manual passkey
     registration, so stop and ask the engineer.
   - Don't hard-code balances or data that changes on dev. Assert what the scenario controls.
   - Every file touched must be in the plan's file table (guard hook); otherwise use the deviation flow.
3. **Static checks:**
   - `npx tsc --noEmit -p apps/nfid-frontend-e2e/tsconfig.json` must add no new errors vs
     `origin/main` (there are 4 known errors in `src/steps/swap-stake.ts`)
   - `yarn nx lint nfid-frontend-e2e` if that target exists, otherwise `npx eslint <changed files>`
4. **Optional quick run:** if the engineer wants it now, run
   `.claude/scripts/e2e-local.sh '<tags>' <scratchpad>/e2e-<name>`. `/verify` always runs it anyway.
5. **Status:** `E2E READY — tags <tags>`. Record the tags in the E2E scope section if they changed.
6. **Report:** scenarios added/changed, new steps/pages, tags, check results. Next: `/verify <name>`.
