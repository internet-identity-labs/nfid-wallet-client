---
name: document
description: SDD step 6 of 7 — docs sync. Reviews the plan, spec, all other plans/specs, docs, session context and memory, and updates whatever the change made stale. Docs only.
argument-hint: "<name>"
disable-model-invocation: true
---

# /document — leave nothing undocumented

Arguments: `$ARGUMENTS` → `<name>`.

First read `.claude/templates/workflow.md` and follow its rules.

## Preconditions

- The status must be `VERIFIED`. Otherwise refuse.

## Hard rule

Docs only: Markdown, comments in docs, plan/spec files, memory. If you find a **code** problem, don't
fix it: add it to `## Verify findings`, set `IN PROGRESS — finding from /document`, stop, and
point to `/implement <name>`.

## Inputs

- The change: `git diff origin/main` + `git status --short` (untracked included).
- **The search terms:** every changed path, exported identifier, env var, command, script name,
  version number and canister method in the diff. Write the list down; every check below greps for
  it.

## Review and update, in this order

1. **This plan:**
   - every `[x]` is really done
   - the file table matches the diff exactly (add missing files, explain unchanged ones)
   - decisions made during the work are in `## Decisions`
   - differences from the approved plan are in `## Deviations`
   - follow-ups are listed
   - the Status line is correct
2. **This spec** (feature tier): each numbered requirement is marked met, or not met with the reason
   (agreed with the engineer). Behaviour that changed during implementation is reflected.
3. **All other plans and specs** (`.claude/plans/**`, `.claude/specs/**`): grep them for the search
   terms.
   - A reference that is now wrong → fix it.
   - A `COMPLETE`/`DONE` plan → add a dated note at the end instead of rewriting history:
     `> Note <date> (<name>): <what changed>`.
4. **Documentation:** `CLAUDE.md`, `.claude/commands/*`, `.claude/skills/*`, `.claude/templates/*`,
   and `.github/` docs and templates. Grep for the search terms, and also read the sections that
   describe behaviour the change altered. Update what's stale.
5. **READMEs — review only.** Every `README.md` (root, `apps/*`, `packages/*`, `docker-e2e-tests/`),
   checked the same way. READMEs are updated by `/implement` together with the code they describe,
   so `/document` **doesn't edit them**. A README that is stale after this change is a finding:
   add it to `## Verify findings` (with the out-of-date sentence and what it should say), set
   `IN PROGRESS — finding from /document` and stop. If the README isn't in the plan's file table,
   `/implement` runs the deviation flow for it.
6. **Session context:** decisions, findings, gotchas, external blockers and follow-ups from this
   conversation that aren't written down anywhere go into the plan (Decisions / Findings /
   Follow-ups).
7. **Memory:** update the user's project memory with facts the repo doesn't record (state of the
   work, what isn't done, external blockers, non-obvious gotchas). Don't duplicate what's in the
   repo.

## Finish

- Write `## Docs sync` in the plan:

  ```
  ### <date>
  Search terms: …
  Updated: `<file>` — <why> …
  Reviewed, no change needed: `<file or area>` …
  READMEs reviewed: `<file>` — current / finding R<n>
  ```

- `npx prettier --check` on every doc you changed, plus the plan. Fix formatting.
- Status → `DOCUMENTED`. Report the updated files and the reviewed-but-unchanged list.
  Next: `/pr <name>`.
