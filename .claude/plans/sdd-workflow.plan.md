# Plan: SDD workflow v2 — `/spec` → `/plan` → `/implement` → `/implement-e2e` → `/verify` → `/document` → `/pr`

> Status: PR OPEN — branch chore/sdd-workflow (2026-11-13)
> Spec: none — tooling tier (only `.claude/` and `CLAUDE.md` change)
> Shortcut: — (optional)
> Created: 2026-11-13
> Branch: `chore/sdd-workflow` (single PR)

## Goal

One general-purpose pipeline the engineer drives one command at a time, for feature and tooling work.
All state lives in the plan file, so any step can run in a fresh session.

```
/spec <name>           → spec                                      (feature tier only)
/plan <name> [sc-XXXX] → plan incl. E2E scope                      DRAFT → engineer approves → APPROVED
/implement <name>      → code + unit tests, one phase per call     → IN PROGRESS … IMPLEMENTED
/implement-e2e <name>  → Cucumber features / steps / page objects  → E2E READY  (or E2E N/A)
/verify <name>         → findings only: checks, local E2E, review  → VERIFIED   (or back to IN PROGRESS)
/document <name>       → docs sync: plans, specs, docs, context    → DOCUMENTED
/pr <name>             → the one commit + push + PR                → PR OPEN
/plan                  → (no argument) table of all plans and their status
```

## Decisions (2026-11-13)

| Question                               | Decision                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Command names                          | `/spec`, `/plan`, `/implement`, `/implement-e2e`, `/verify`, `/document`, `/pr`                                                                                                                                                                                                                                                                                     |
| Implement unit                         | One **phase** per call, stopping at the phase boundary; `--step` = one checkbox                                                                                                                                                                                                                                                                                     |
| Commits                                | **None before `/pr`.** Work stays uncommitted on the branch until verify and docs pass; `/pr` creates the commit                                                                                                                                                                                                                                                    |
| `/verify` role                         | **Findings only.** It never edits code or tests; it writes findings into the plan, and `/implement` is run again to fix them                                                                                                                                                                                                                                        |
| Local E2E                              | `/verify` runs the E2E tags of the feature being worked on (from the plan's E2E scope) locally; the full suite stays with CI                                                                                                                                                                                                                                        |
| E2E scope                              | Decided in `/plan`: new scenarios + tags / existing tags affected / none + reason                                                                                                                                                                                                                                                                                   |
| Shortcut story                         | Optional `sc-XXXX` on `/plan`; if given → branch `feature/sc-XXXX-<name>`, PR title suffix `[sc-XXXX]`                                                                                                                                                                                                                                                              |
| Old `ui-*` skills                      | Kept and working; bugs fixed; made compatible with the status lifecycle                                                                                                                                                                                                                                                                                             |
| PR split                               | One PR for the fixes and the new pipeline                                                                                                                                                                                                                                                                                                                           |
| READMEs (R5, 2026-11-13)               | READMEs are reviewed and updated by `/implement` together with the code they describe, so they're always current. `/plan` lists affected READMEs in the file table; `/document` only reviews them, and a stale one is a finding. No docs-only exception to the deviation rule                                                                                       |
| Shell edits (R6, 2026-11-13)           | Restricted: a Bash PreToolUse hook asks the engineer every time a command looks like it writes under `apps/` or `packages/` (or rewrites the working tree)                                                                                                                                                                                                          |
| File grants (T5, 2026-11-13)           | **Exact paths only.** The guard accepts only exact repo-relative paths from the file table; folders and globs grant nothing. Matches how every existing plan is written; an unforeseen file goes through the deviation flow                                                                                                                                         |
| Bash guard design (run #4, 2026-11-13) | Option 1: keep `pre-bash.js` as an early warning (ask before obvious writes) and add `post-bash.js`, a PostToolUse check that runs `git status` on `apps/`/`packages/` after every shell command and reports any changed file that no active plan lists (exact paths). It catches every write whatever the syntax, so the remaining parser gaps are minor by design |
| Convergence rule (run #6, 2026-11-13)  | After fixing run #6, one more `/verify`. If it finds no major problems, new _minor_ findings about the shell guard's heuristics are recorded as accepted limitations, and the pipeline continues to `/document` and `/pr`                                                                                                                                           |
| Short re-verify (run #8, 2026-11-13)   | The run #8 fixes touch only hooks, `verify.sh`, `settings.json` and skill text, none of which are build or test inputs, so the follow-up `/verify` is the hook self-test plus a code review of the fixes; the full check suite isn't re-run                                                                                                                         |
| Finish line (run #9, 2026-11-13)       | Option 1: fix Z1, Z3, Z4, Z5, Z6, Z8, Z9, Z10 in one pass, accept Z7, then mark the plan VERIFIED on the hook self-test alone (no further code-review round) and continue to `/document` and `/pr`. Anything a later review finds becomes a follow-up, not a blocker for this PR                                                                                    |

## Status lifecycle (single source of truth: the `> Status:` line)

| Status        | Set by                                                            | Next                                                             |
| ------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| `DRAFT`       | `/spec`, `/plan`, or any deviation                                | engineer approves → `APPROVED`                                   |
| `APPROVED`    | engineer ("approved")                                             | `/implement`                                                     |
| `IN PROGRESS` | `/implement` (phases left or open findings), `/verify` (findings) | `/implement`                                                     |
| `IMPLEMENTED` | `/implement` (all phases done, no open findings)                  | `/implement-e2e`                                                 |
| `E2E READY`   | `/implement-e2e`                                                  | `/verify`                                                        |
| `E2E N/A`     | `/implement-e2e` when the plan's E2E scope is "none"              | `/verify`                                                        |
| `VERIFIED`    | `/verify` with zero open findings                                 | `/document`                                                      |
| `DOCUMENTED`  | `/document`                                                       | `/pr`                                                            |
| `PR OPEN`     | `/pr`                                                             | CI red or review comments → `/implement` (loop); merged → `DONE` |
| `DONE`        | `/plan` on request after merge                                    | —                                                                |

Each command checks the status first and refuses, with a one-line explanation and the command to run
instead, if it's out of order.

## Command contracts

> As approved on 2026-11-13, before implementation. Where Decisions, Deviations or Verify
> findings below say otherwise (e.g. READMEs move to `/implement`, `VERIFIED` is no longer an
> editing status, exact paths only, `PR OPEN` has no number), those win, and the skills in
> `.claude/skills/` are the source of truth.

**Shared by all commands**

- Read the plan (and the spec, if any) from disk first; never rely on conversation memory.
- Report at the end: what was done, the new status, and the next command to run.
- Never run destructive git commands (`reset --hard`, `checkout -- .`, `stash`, `clean`), because
  until `/pr` the work exists only in the working tree.

**`/spec <name>`** (feature tier): short interview (scope, behaviour, data/state, constraints; the UI
question groups from `ui-brainstorming` only if the feature has UI) → spec `DRAFT` → gate.

**`/plan <name> [sc-XXXX]`**:

- Picks the tier. The feature tier requires an approved spec.
- Researches the codebase: every file to touch, and every place a value is pinned or assumed.
- Writes the plan from the template, with implementation phases, an **E2E scope** section and a
  per-phase Verification checkbox → `DRAFT` → gate.
- "approved" from the engineer → `APPROVED`. With no argument: lists all plans and their status.

**`/implement <name> [--step]`**:

- Requires `APPROVED`, `IN PROGRESS` or `PR OPEN`.
- First run: creates the branch from `origin/main` (no commit).
- Fixes **open `/verify` findings first**, then executes the next unchecked phase.
- Unit tests are written first, per `/write-unit-tests` rules; new tests must **mock canister and
  network calls** (lesson from the `LAMBDA_IDENTITY` breakage).
- Ticks boxes as it goes; runs the phase's own Verification checkbox (lint/tsc/unit tests for the
  touched projects); stops at the phase boundary.
- If a file outside the plan is needed: stop, record it under Deviations, set `DRAFT`, ask.
- **Never commits.**

**`/implement-e2e <name>`**:

- Requires `IMPLEMENTED`.
- E2E scope "none" → records `E2E N/A` with the plan's reason and stops.
- Otherwise writes or extends the `apps/nfid-frontend-e2e/src/features/*.feature` files, reusing
  `src/steps/*` and `src/pages/*` before adding new ones.
- Tags each scenario with its area tag (e.g. `@sendft`).
- Uses only accounts already in `users.json`. If a new dev account is needed (manual passkey
  registration), stop and ask the engineer.
- Checks: `tsc -p apps/nfid-frontend-e2e/tsconfig.json` (no new errors vs `main`) and lint → `E2E READY`.

**`/verify <name>`** (findings only — never edits code or tests; best run in a fresh session):

- Requires `E2E READY` or `E2E N/A`.
- **Automated checks**: `.claude/scripts/verify.sh` on the branch and on a `main` baseline
  (cached per `main` SHA): install, tsc app/spec/e2e, lint, unit tests, build. Only **new**
  failures count; tests are compared by name.
- **Local E2E**: build and run `yarn test:e2e:frontend -- --cucumberOpts.tags='<tags from E2E scope>'`.
  Tooling plans with E2E scope "none" skip this, and the report says so.
- **Review**:
  - plan/spec conformance: every requirement implemented, nothing out of scope
  - changed files match the plan (`git status` + `git diff origin/main`, untracked files included)
  - built-in `/code-review` on the diff
- Writes a `## Verify findings` section into the plan, each finding with evidence:
  - findings → `IN PROGRESS`; the engineer runs `/implement`
  - no findings → `VERIFIED`
- Lists what can't be verified locally (full E2E suite and mobile E2E → CI; `LAMBDA_IDENTITY`-bound
  unit tests if the secret is absent).

**`/document <name>`** (docs only):

- Requires `VERIFIED`.
- **This plan**: ticked boxes are really done; the file table matches the diff; decisions and
  deviations are recorded; the status is correct.
- **This spec**: each requirement is met or marked as not done; behaviour changes are reflected.
- **All other plans and specs**: grep them for every changed path, identifier, version, command and
  env var, and fix references that are now wrong. COMPLETE/DONE plans get a dated note rather than
  a rewrite.
- **Documentation**: `CLAUDE.md`, every `README.md` (root, `apps/*`, `packages/*`,
  `docker-e2e-tests/`), `.claude/commands/*`, `.claude/skills/*`, and `.github/` docs and templates.
- **Session context**: decisions, gotchas and follow-ups that aren't written down anywhere go into
  the plan.
- **Memory**: facts that aren't recoverable from the repo.
- Rules:
  - If it finds a code problem, don't fix it: record it under `## Verify findings` → `IN PROGRESS`.
  - Any README under `apps/` or `packages/` is added to the plan's file table before it's edited.
  - Writes a `## Docs sync` section (updated files with the reason, plus places reviewed with no
    change needed).
  - Finishes with `prettier --check` on the changed docs → `DOCUMENTED`.

**`/pr <name>`**:

- Requires `DOCUMENTED`.
- Applies the `/commit` rules: scans for leftovers, stages only the files in the plan's file table
  plus the plan/spec (never `git add -A`), writes a Conventional-Commit message with a body
  summarised from the plan and the session's attribution line, and lets Husky run (no `--no-verify`).
- Pushes (never force).
- No PR yet: `gh pr create` with title `<summary> [sc-XXXX]` and a body built from the plan
  (summary, what changed, verification results, what wasn't verified locally, attribution footer).
- PR already open (fix loop): pushes the new commit and comments with what changed.
- → `PR OPEN`. Never merges.

## Two tiers (to be written into CLAUDE.md)

| Tier    | When                                                           | Needs                                              |
| ------- | -------------------------------------------------------------- | -------------------------------------------------- |
| Feature | Any change under `apps/` or `packages/`                        | Approved spec **and** approved plan                |
| Tooling | Only root config, `.github/`, `docker-*`, `.claude/`, lockfile | Approved plan (header `Spec: none — tooling tier`) |

## Findings fixed in Phase 1 (verified 2026-11-13)

| #   | File                                                              | Defect                                                                                                                                                        |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | `.claude/hooks/pre-tool-use.js`                                   | Blocks with `exit(1)`; Claude Code only blocks on exit **2** → the guard never blocks (tested: prints "BLOCKED", exit 0)                                      |
| F2  | `.claude/hooks/pre-tool-use.js`                                   | "Active plan" = any plan containing `- [ ]`; COMPLETE plans with leftover boxes (`delete-account-default-button`, `remember-me`, `auth/*`) satisfy it forever |
| F3  | `.claude/hooks/post-tool-use.js`                                  | Uses `require()` in an ES module (`"type": "module"`) → throws, swallowed → hook is a no-op                                                                   |
| F4  | `post-tool-use.js`, `execute-ui-plan`, `ui-planning`, `CLAUDE.md` | Nx project `nfid-frontend` does not exist (it is `nfid-wallet-client`); no `typecheck` target exists                                                          |
| F5  | `execute-ui-plan`, `write-unit-tests`                             | `--testPathPattern` → Jest 30 is `--testPathPatterns`                                                                                                         |
| F6  | `.claude/commands/commit.md`                                      | Hard-codes `Co-Authored-By: Claude Sonnet 4.6`                                                                                                                |
| F7  | `post-tool-use.js`                                                | Lints the whole project on every edit (slow); should lint only the edited file (`eslint.config.js` is flat at the root)                                       |

## Modified / New Files

| File                                                                  | Phase | Change                                                                                                                                     |
| --------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `.claude/hooks/pre-tool-use.js`                                       | 1     | exit 2; allow only when a plan is in an editing status (see Phase 1) **and** lists the target file                                         |
| `.claude/hooks/post-tool-use.js`                                      | 1     | ESM-correct stdin read; `prettier --write` + `eslint --fix` on the edited file only                                                        |
| `.claude/skills/execute-ui-plan/SKILL.md`                             | 1     | Fix F4/F5; set `Status: IN PROGRESS` on start (needed by the new guard)                                                                    |
| `.claude/skills/ui-planning/SKILL.md`                                 | 1     | Fix F4 in the template's Verification section                                                                                              |
| `.claude/commands/write-unit-tests.md`                                | 1     | Fix F4/F5; add the "mock canister/network calls" rule                                                                                      |
| `.claude/commands/commit.md`                                          | 1     | Use the session's attribution line instead of a hard-coded model                                                                           |
| `CLAUDE.md`                                                           | 1+2   | Phase 1: fix the Verification Commands table. Phase 2: replace the SDD section with tiers + pipeline                                       |
| `.claude/skills/spec/SKILL.md`                                        | 2     | New skills (frontmatter `name` + `description`), per the contracts above                                                                   |
| `.claude/skills/plan/SKILL.md`                                        | 2     | New skills (frontmatter `name` + `description`), per the contracts above                                                                   |
| `.claude/skills/implement/SKILL.md`                                   | 2     | New skills (frontmatter `name` + `description`), per the contracts above                                                                   |
| `.claude/skills/implement-e2e/SKILL.md`                               | 2     | New skills (frontmatter `name` + `description`), per the contracts above                                                                   |
| `.claude/skills/verify/SKILL.md`                                      | 2     | New skills (frontmatter `name` + `description`), per the contracts above                                                                   |
| `.claude/skills/document/SKILL.md`                                    | 2     | New skills (frontmatter `name` + `description`), per the contracts above                                                                   |
| `.claude/skills/pr/SKILL.md`                                          | 2     | New skills (frontmatter `name` + `description`), per the contracts above                                                                   |
| `.claude/templates/spec.md`                                           | 2     | Shared templates; the plan template has feature/tooling variants and an E2E scope section                                                  |
| `.claude/templates/plan.md`                                           | 2     | Shared templates; the plan template has feature/tooling variants and an E2E scope section                                                  |
| `.claude/scripts/verify.sh`                                           | 2     | Branch-vs-baseline suite with failing-test-name diff and peer/engines diff                                                                 |
| `.claude/templates/workflow.md`                                       | 2     | Status lifecycle + shared rules every pipeline skill reads first (added during Phase 2, see Deviations 5)                                  |
| `.claude/scripts/e2e-local.sh`                                        | 2     | Wraps `yarn test:e2e:frontend` for a tag list; saves the log and Allure results path                                                       |
| `.claude/hooks/post-bash.js`                                          | fix   | After every shell command: report changed `apps/`/`packages/` files that no active plan lists (run #4 design decision; deviation 13)       |
| `.claude/hooks/pre-bash.js`                                           | fix   | Bash guard: asks the engineer before shell commands that write under `apps/`/`packages/` or rewrite the working tree (R6; deviation 12)    |
| `.claude/settings.json`                                               | fix   | Run the hooks via `$CLAUDE_PROJECT_DIR` so they load from any cwd (F2; approved deviation 11)                                              |
| `.claude/plans/node-22-23-upgrade.plan.md`                            | —     | Separate DRAFT plan for the Node 22.23.4 upgrade, committed with this PR (engineer decision on F11, 2026-11-13); executed later in Phase 4 |
| `.claude/plans/icp-sdk-max-version-upgrade.plan.md`                   | docs  | /document: dated note — Nx project is `nfid-wallet-client`, no `typecheck` target                                                          |
| `.claude/plans/auth/disable-email-google-registration-ui.plan.md`     | docs  | /document: same dated note                                                                                                                 |
| `.claude/plans/auth/disable-email-google-registration.plan.md`        | docs  | /document: active DRAFT, `nfid-frontend:typecheck` → `npx tsc --noEmit -p …` in place                                                      |
| `.claude/specs/major-dependency-updates.spec.md`                      | docs  | /document: same dated note                                                                                                                 |
| `.claude/specs/auth/email-google-registration-disabled-toast.spec.md` | docs  | /document: same dated note                                                                                                                 |
| `.claude/plans/sdd-workflow.plan.md`                                  | all   | This plan, committed with the PR                                                                                                           |

No file under `apps/` or `packages/` changes, so the PR needs no spec.

## E2E scope

None. This plan changes no app behaviour; the existing E2E suite runs in CI on the PR.

## Implementation Checklist

This plan predates its own pipeline, so it follows the new rules by hand: no commits until the
final step, and verify/document are separate steps.

### Phase 1 — Fix existing SDD infrastructure

- [x] Create branch `chore/sdd-workflow` from `origin/main` (no commit).
- [x] `pre-tool-use.js`:
  - block with exit code 2
  - editing statuses are `IN PROGRESS`, `IMPLEMENTED`, `E2E READY`, `E2E N/A` and `VERIFIED`
    (`/document` edits READMEs)
  - allow the edit only if a plan in one of those statuses lists the target path, or a directory
    prefix of it
  - keep the `.claude/` and `CLAUDE.md` exemptions
  - the block message names the plans it checked and the command to run next
- [x] `post-tool-use.js`: fix stdin reading (`readFileSync(0)`); run `yarn prettier --write <file>`
      and `npx eslint --fix <file>` for the edited file only.
- [x] Hook self-test by piping sample JSON into the hooks:
  - (a) no plan in an editing status → exit 2
  - (b) editing status and the file is listed → exit 0
  - (c) editing status but the file isn't listed → exit 2
  - (d) a `DRAFT` plan listing the file → exit 2
  - (e) a `.claude/` path → exit 0
  - (f) the post-hook formats a deliberately mis-formatted temp file
- [x] `execute-ui-plan`, `ui-planning`, `write-unit-tests`:
  - project name `nfid-wallet-client`
  - `--testPathPatterns`
  - `tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json` (+ `tsconfig.spec.json`)
  - `execute-ui-plan` sets `IN PROGRESS` when it starts and `COMPLETE` when it finishes
  - `write-unit-tests` gets the mock rule
- [x] `commit.md`: end with the Co-Authored-By line from the current session's attribution
      instructions.
- [x] `CLAUDE.md` Verification Commands table:
  - correct project names
  - the two `tsc` commands in place of the `typecheck` row
  - `--testPathPatterns`
  - storybook is `nx storybook nfid-wallet-client` / `ui`
- [x] Phase check: `yarn prettier --check .claude CLAUDE.md`; hook self-test passes.

### Phase 2 — Pipeline skills

- [x] `.claude/templates/plan.md` and `.claude/templates/spec.md`:
  - plan header: Status, Spec, Shortcut, Created, Branch
  - plan sections: Goal, Findings, Modified/New Files, **E2E scope**, phased checklist (each phase
    ends in a Verification checkbox), Decisions, Risks, Verify findings, Docs sync, Deviations
  - the spec is generalised from `ui-brainstorming`'s template; the UI sections apply only to UI
    features
- [x] `/spec`, `/plan`, `/implement`, `/implement-e2e`, `/verify`, `/document`, `/pr` skills, each
      following its contract above, including the status checks and the end-of-run report.
- [x] `.claude/scripts/verify.sh <worktree> <logdir> [frozen]`, using the suite proven in the
      2026-11-10 Dependabot triage:
  - install, tsc app/spec/e2e, lint, unit tests, build
  - ANSI-stripped failing-test extraction
  - peer/engines warning extraction
- [x] `.claude/scripts/e2e-local.sh <tags>`:
  - runs `yarn test:e2e:frontend -- --cucumberOpts.tags='<tags>'`
  - saves the log and prints the pass/fail summary per scenario
- [x] `CLAUDE.md`:
  - replace the "SDD Enforcement Directive" with the two tiers, the pipeline, the status table and
    the "no commits before `/pr`" rule
  - note that `/ui-brainstorming` → `/ui-planning` → `/execute-ui-plan` remain supported
- [x] **Engineer, in a fresh session:** check that all seven commands resolve to the project skills and aren't shadowed by built-in
      Claude Code commands (the engineer types each in a fresh session). If one is shadowed, propose
      the nearest alternative name before renaming.
  - 2026-11-13, Claude Code 2.1.322, fresh session: all seven resolve to `.claude/skills/<name>`;
    none is shadowed by a built-in command (results in the next checkbox).
- [x] Phase check (static, done 2026-11-13): prettier clean on all changed files; each skill has
      frontmatter, `$ARGUMENTS`, the workflow-rules reference and a refusal gate; `verify.sh compare`
      tested on the real 2026-11-10 triage logs (flagged exactly the flaky shroff test found by hand).
- [x] **Engineer, in a fresh session:** interactive phase check. Done 2026-11-13 on this plan
      (`IN PROGRESS`) instead of a throwaway plan:

  | Command                       | Result                                                           |
  | ----------------------------- | ---------------------------------------------------------------- |
  | `/implement sdd-workflow`     | ✅ ran (`IN PROGRESS` is allowed); no work left, no changes      |
  | `/verify` (no argument)       | ✅ refused: no plan name, and no plan is `E2E READY`/`E2E N/A`   |
  | `/document sdd-workflow`      | ✅ refused: `IN PROGRESS`, needs `VERIFIED`                      |
  | `/spec sdd-workflow`          | ✅ declined: tooling tier, no spec needed                        |
  | `/plan` (no argument)         | ✅ status overview of all 11 plans, no changes                   |
  | `/pr sdd-workflow`            | ✅ refused: `IN PROGRESS`, needs `DOCUMENTED`; nothing committed |
  | `/implement-e2e sdd-workflow` | ✅ refused: `IN PROGRESS`, needs `IMPLEMENTED`                   |

  Not tested: `/verify` writing findings without touching code. This plan's real `/verify` run
  (Phase 3) is the first test of that.

### Phase 3 — Verify, document, PR (through the pipeline commands)

Changed 2026-11-13 with engineer approval: originally "by hand", but the commands now exist, so
this plan runs through them. That doubles as the first end-to-end test of the pipeline.

- [x] `/implement-e2e sdd-workflow` → `E2E N/A` (E2E scope is "None"). Done 2026-11-13.
- [x] `/verify sdd-workflow`. Done 2026-11-13: 9 runs; VERIFIED per the "Finish line" decision. The
      hook self-test (grew from 21 to 199 cases over the runs) was re-run each time, since the hooks
      have no unit tests.
- [x] `/document sdd-workflow`. Done 2026-11-13 (see Docs sync).
- [x] `/pr sdd-workflow`: one commit (Conventional; the body lists the Phase 1 fixes F1–F7 and the
      new pipeline separately), push `chore/sdd-workflow`, open the PR.

### Phase 4 — Pilot on the Node upgrade (after the PR merges)

- [ ] Move `.claude/plans/node-22-23-upgrade.plan.md` onto the new template (E2E scope: none; the
      existing suite in CI covers it) and run it through `/implement` → `/implement-e2e` →
      `/verify` → `/document` → `/pr`.
- [ ] Retro: record friction points under Deviations and adjust the skills (small follow-up PR if
      needed).

## Risks

| Risk                                                                | Mitigation                                                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Uncommitted work lost before `/pr` (no intermediate commits)        | Contract bans destructive git commands; work stays on its own branch; long tasks can be split into smaller plans |
| Large uncommitted diffs are hard to review in `/verify`             | Phases keep scope small; `/verify` reviews per phase against the plan                                            |
| Local E2E depends on the dev environment (canisters, test accounts) | A failure is attributed: if the same tags fail on the `main` baseline, it's environmental, not a finding         |
| Built-in commands shadow `/plan` or `/pr`                           | Checked in Phase 2 before the PR opens; rename only with engineer approval                                       |
| The stricter guard blocks legitimate edits                          | Block message says how to add the file to the plan; `.claude/` stays exempt                                      |
| The guard only sees Write/Edit, not shell edits (`sed`)             | `pre-bash.js` asks before likely shell writes; `post-bash.js` reports any unplanned change after every command   |
| Baseline runs are slow (~15 min)                                    | Cache baseline results per `main` SHA                                                                            |

## Follow-ups (not in this plan)

- Make `/dependabot-update` call `.claude/scripts/verify.sh` instead of its inline suite. Note: its
  `git worktree` / `git merge origin/main` steps now trigger the pre-bash prompt (expected).
- Fix the order-dependent `passkey.spec.ts` "store/get" test (feature tier, needs a spec).
- Decide the status of `enable-email-device-removal.plan.md` ("IMPLEMENTED — awaiting engineer
  review" since 2026-09-04; Deviation 4). With no Branch line it no longer unlocks files, but it
  probably should be `COMPLETE`.
- Format the three files that are already unformatted on `main` (Deviation 3).
- Accepted limitations to revisit if they bite: the shell-guard heuristics (V6, W4, W6, X1, X4,
  X10, Z2), post-bash cost (V8), DRAFT plans counting as planned (X3), older multi-status plans
  (Y5), unclosed `<!--` hiding a file table (Y6), formatting in sibling worktrees (X8).
- The hook self-test lived only in the session scratchpad; per the engineer it's deleted after the
  PR is created. Reintroducing it (e.g. `.claude/hooks/test/`) would need its own plan.
- Phase 4: the Node 22.23.4 pilot (`node-22-23-upgrade.plan.md`) through the new pipeline.

## Verify findings

### Run 2026-11-13 — 12 findings (4 major, 8 minor)

Sources: `verify.sh` branch vs `main` 4cac49296 (baseline from a fresh `--frozen-lockfile`
worktree); hook self-test (21/21 pass); built-in `/code-review` (medium; all 10 candidates checked
by hand and kept); file-table and conformance review.

- [x] F1 major — A glob in a plan's file table skips the narrowness check that directory prefixes
      get, so `apps/**` or `**/*.ts` unlocks every guarded file, which is exactly what the
      two-level rule for prefixes prevents — `.claude/hooks/pre-tool-use.js` `listsFile` (glob
      branch) — reject globs whose fixed (non-wildcard) prefix is under two levels deep.
      **[fixed 2026-11-13]** globs need a fixed part ≥ 2 levels (`fixedDepth`); self-test: `apps/**`, `**/*.md` → block.
- [x] F2 major — The guard fails open. Any uncaught exception exits with 1, which Claude Code treats
      as non-blocking, so the edit goes through. Example: an unbalanced brace token in a Files
      table (`useFoo({`) makes `new RegExp` throw. Also, `.claude/settings.json` runs the hook by
      relative path (`node .claude/hooks/pre-tool-use.js`), so a different cwd means "module not
      found" → exit 1 → allowed — `pre-tool-use.js` (no try/catch around the main body),
      `.claude/settings.json` — wrap the body so any error exits 2 with the message, guard
      `globToRegExp` with a try/catch, and use `"$CLAUDE_PROJECT_DIR"/.claude/hooks/…` in
      settings.json. **settings.json is not in the file table → deviation.**
      **[fixed 2026-11-13]** hook body wrapped; any error → exit 2 (fail closed); malformed globs → non-match; settings.json uses `$CLAUDE_PROJECT_DIR` (deviation 11). Self-test: unreadable plan → exit 2; cwd=/ works.
- [x] F3 major — A plan grants edits for as long as it stays in an editing status, on any branch.
      `enable-email-device-removal.plan.md` (`IMPLEMENTED`, since 2026-09-04) still unlocks
      `packages/integration/src/lib/device/email-device.service.ts`, `packages/integration/src/index.ts`
      and others for unrelated work — `pre-tool-use.js` (active-plan filter) — only count plans
      whose `Branch:` matches the current branch (plans without a `Branch:` line count only if
      `IN PROGRESS`), and resolve Deviation 4 with the engineer.
      **[fixed 2026-11-13]** plans count only on their `Branch:`; plans without one only while IN PROGRESS. Self-test: other-branch / legacy IMPLEMENTED / detached → block; `enable-email-device-removal` no longer unlocks `packages/integration/src/index.ts`. (Deviation 4's status question for that plan stays with the engineer.)
- [x] F4 major — `verify.sh compare` can miss a suite that newly fails to load or compile. Every
      such suite prints the same `● Test suite failed to run` line, `sort -u` collapses them, and
      `failing-suites.txt` is computed but never compared — `.claude/scripts/verify.sh`
      `cmd_derive` / `cmd_compare` — compare `failing-suites.txt` too, and report new suites by path.
      **[fixed 2026-11-13]** compare also diffs `failing-suites.txt` ("New failing test files"); synthetic test passes.
- [x] F5 minor — Engine lines are not diffed against the baseline, so an engine warning that is
      already on `main` counts as new on every run and breaks "exit 0 = nothing new" —
      `verify.sh` `cmd_compare` (engines block) — `comm -13` against the baseline like peers.
      **[fixed 2026-11-13]** engines diffed against the baseline; same line on both sides → nothing new.
- [x] F6 minor — Lint and build are compared by exit code only. If a stage already fails on `main`,
      new errors on the branch are invisible (`1 → 1` = ok) — `verify.sh` — derive and diff error
      lines for lint (ESLint `file:line rule`) and build (`ERROR in …`).
      **[fixed 2026-11-13]** derive builds `lint-errors.txt` (file: message rule, root-relative) and `build-errors.txt`; compare diffs both even if the stage fails on main.
- [x] F7 minor — CLAUDE.md says the guard enforces "an approved spec **and** an approved plan", but
      the hook only reads the plan's status — `CLAUDE.md` SDD section — reword: the hook enforces
      the plan; the spec gate is enforced by `/plan` and `/implement`.
      **[fixed 2026-11-13]** CLAUDE.md: the hook enforces the plan half (branch + status + file table); `/plan` and `/implement` enforce the spec.
- [x] F8 minor — `verify.sh baseline-dir` uses `origin/main` without fetching, so the baseline can be
      stale (this run fetched manually) — `verify.sh` `cmd_baseline_dir` and `/verify` step 1 —
      `git fetch -q origin main` first.
      **[fixed 2026-11-13]** `baseline-dir` runs `git fetch -q origin main` first; `/verify` step 1 says so.
- [x] F9 minor — CLAUDE.md's E2E row suggests `yarn test:e2e:frontend -- --cucumberOpts.tags='@sendft'`,
      which **replaces** the default `not @pending and not @mobile and not @skip` filter, so skipped
      scenarios run and fail — `CLAUDE.md` Verification Commands — point to
      `.claude/scripts/e2e-local.sh '@sendft' <dir>` or show the full expression.
      **[fixed 2026-11-13]** CLAUDE.md: separate "E2E tests (one area)" row pointing to `e2e-local.sh`, with the reason.
- [x] F10 minor — The guard's file-table detection is too loose and its globs too strict: - any `## …Files…` heading counts, so `## Files not to touch` would grant edits - `**/` needs at least one directory, so `packages/ui/src/**/*.tsx` misses `packages/ui/src/index.tsx` - a `## ` line inside a fenced block splits sections

      Location: `pre-tool-use.js` `fileSections`, `globToRegExp`. Fix: accept only
      `## Modified / New Files`, `## New Files` and `## Modified Files`; make `**/` match zero or
      more directories; skip fenced blocks.

      **[fixed 2026-11-13]** only `## Modified / New Files`, `## New Files` and `## Modified Files` count; fenced blocks are skipped; `**/` matches zero directories. workflow.md and the plan template describe the rules.

- [x] F11 minor — `.claude/plans/node-22-23-upgrade.plan.md` is untracked and not in this plan's file
      table (it's separate work), and `/pr` stops on changed files outside the table — engineer
      decision: commit it with this PR (add to the table) or leave it untracked for its own PR.
      **Resolved 2026-11-13 by engineer decision:** commit it with this PR. Added to the file table.
- [x] F12 minor — `/verify` has no rule for a whole check stage (build, lint) that fails on the
      branch but not on the baseline because of the local `node_modules`. This run hit exactly
      that (see Environmental) and needed a manual attribution — `.claude/skills/verify/SKILL.md`
      step 1 — add: re-run the stage once; if it still fails and the diff has no inputs to that
      stage, re-check in a fresh worktree of the branch before calling it a finding.
      **[fixed 2026-11-13]** `/verify` step 1.5: re-run the stage; if the diff has no inputs to it, re-check in a fresh `--frozen-lockfile` worktree before calling it a finding.

Not verifiable locally: live-canister unit tests (`LAMBDA_IDENTITY` unset; CI runs them); full
desktop/mobile E2E (CI; this plan is `E2E N/A`); the hooks have no unit tests, only the 21-case
self-test kept in the session scratchpad.

Flaky (re-run passed): none new.

Environmental (not caused by this branch):

- **Branch `build` fails in the engineer's checkout.** It fails twice with
  `TypeError: _lruCache is not a constructor` (web-babel-loader, `apps/nfid-frontend/src/index.tsx`).
  - Evidence that it's the environment: the `main` baseline built fine from a fresh
    `--frozen-lockfile` worktree; `yarn.lock` is unchanged; the diff has no build inputs (only
    `.claude/` and `CLAUDE.md`).
  - Cause: the checkout's `node_modules` tree differs from a fresh install of the same lockfile.
  - Suggested fix for the engineer: `rm -rf node_modules && yarn install --frozen-lockfile`.
- **Informational:** 4 Address Book tests failing on `main` pass on the branch (live services, flaky
  both ways).

Notes for `/document` (docs, not findings): this plan's Goal block and status table still say
`PR OPEN (#n)` (Deviation 6 dropped the number); the plan's "Two tiers" table header still says
`(header "Spec: none — tooling tier")`.

### Run 2026-11-13 #2 — 9 findings (3 major, 6 minor)

Sources: `verify.sh` branch vs `main` 4cac49296 → **nothing new** (all stages pass, build included,
after the engineer refreshed `node_modules`); hook self-test 34/34; built-in `/code-review`
(medium) on the updated diff. All 9 candidates were checked; R1–R4 were reproduced.

- [x] R1 major — The guard misses edits in other git worktrees. It computes paths against the main
      checkout only, so a file in a worktree under `.claude/worktrees/<x>/apps/…` (agent isolation)
      looks like a `.claude/` file, and a sibling worktree (`../nfid-verify-base/apps/…`) looks like
      it's outside the repo. Both are allowed. Reproduced: both exit 0 —
      `.claude/hooks/pre-tool-use.js` `main()` — resolve the target's own repository root (nearest
      ancestor with `.git`) and guard `apps/` / `packages/` relative to that, reading plans from
      that worktree.
      **[fixed 2026-11-13]** the guard resolves the file's own checkout (nearest `.git`) and reads that checkout's plans and branch. Self-test: `.claude/worktrees/w` and sibling worktrees → block unless that worktree's plan lists the file.
- [x] R2 major — `/verify` can change the working tree. The branch run of `verify.sh` does a
      non-frozen `yarn install` in the engineer's checkout, which can rewrite `yarn.lock`, and the
      branch and baseline installs differ (`--frozen` only on the baseline) — `.claude/scripts/verify.sh`
      `cmd_run`, `/verify` step 2 — always install with `--frozen-lockfile`; a lockfile that needs
      changing is a finding.
      **[fixed 2026-11-13]** `verify.sh run` always installs with `--frozen-lockfile` (the argument is ignored); `/verify` step 2 says a lockfile change is a finding.
- [x] R3 major — The failing-test-file parser matches only `*.spec.ts(x)`. The repo also has
      `*.test.ts` suites (`packages/integration/src/lib/token/btc/service/btc-deposit-service.test.ts`),
      so a new load failure there hides behind the shared "Test suite failed to run" line (same
      class of problem as F4) — `verify.sh` `cmd_derive` — match `\.(spec|test)\.[jt]sx?$`.
      **[fixed 2026-11-13]** the suite parser matches `.(spec|test).[cm]?[jt]sx?`; checked on a log with `btc-deposit-service.test.ts`.
- [x] R4 minor — With empty or invalid stdin the guard allows the edit (`readInput()` → null →
      exit 0), contradicting the header's "every unexpected error blocks". The hook is only
      registered for write tools, so input is always expected. Reproduced — `pre-tool-use.js` — block
      (exit 2) when the input can't be parsed.
      **[fixed 2026-11-13]** empty or invalid stdin throws → caught → exit 2. Self-test: empty, `not json` → block; non-write tool → allow.
- [x] R5 minor — `/document` lets a README under `apps/` / `packages/` be added to the file table
      without re-approval, but workflow rule 6 and CLAUDE.md say any out-of-plan file means
      `DRAFT` + re-approval — `.claude/skills/document/SKILL.md`, `workflow.md` rule 6 —
      **engineer decision:** keep the docs-only exception and write it into rule 6 and CLAUDE.md,
      or drop it so READMEs go through the deviation flow.
      **[fixed 2026-11-13]** per engineer decision: no docs exception. `/plan` lists stale READMEs, `/implement` updates them with the code, `/document` only reviews them (stale → finding). workflow.md rule 6, CLAUDE.md, and the plan/implement/document skills updated; VERIFIED removed from the editing statuses.
- [x] R6 minor — Edits through the shell (`sed -i`, heredoc, `>`) aren't seen by the guard. This is
      already listed under Risks, but auto mode explicitly encourages shell edits, which makes it
      likelier — `pre-tool-use.js`, `.claude/settings.json` — add a Bash PreToolUse check that
      blocks commands writing under `apps/` or `packages/` (redirects, `sed -i`, `tee`, `cp`/`mv`
      into those paths), or accept and document it. **Engineer decision.**
      **[fixed 2026-11-13]** per engineer decision: new `.claude/hooks/pre-bash.js` (Bash matcher in settings.json) returns `ask` for shell writes under `apps/`/`packages/`, formatters/generators, and working-tree git rewrites. 41 command cases in the self-test (23 ask, 17 no prompt, invalid input → ask).
- [x] R7 minor — The guard checks a plan's format, not who approved it. `.claude/plans/` isn't
      guarded, so Claude could write a plan that is `IN PROGRESS` with the right branch and file
      table, and unlock itself — `pre-tool-use.js` / CLAUDE.md — say plainly in CLAUDE.md and the
      hook header that the guard prevents _accidental_ edits and is not a security boundary;
      approval stays a human step. (A technical fix, such as signed approvals, is out of scope.)
      **[fixed 2026-11-13]** hook header, workflow.md rule 5 and CLAUDE.md state that the hooks prevent accidental changes and are not a security boundary; approval is the engineer's "approved".
- [x] R8 minor — Workflow rule 7 ("never modify `_ic_api/`", generated Candid bindings) isn't
      enforced. A plan listing `apps/nfid-frontend/src/` unlocks
      `apps/nfid-frontend/src/integration/_ic_api/*` — `pre-tool-use.js` — always block paths
      containing `/_ic_api/`, whatever the plans say.
      **[fixed 2026-11-13]** paths containing `/_ic_api/` are always blocked, even under a granted prefix.
- [x] R9 minor — `branchOf` reads only the first backticked branch, so a `> Branches: \`a\`, \`b\``    header ignores`b`—`pre-tool-use.js` `branchOf`— read every backticked branch on that line.
**[fixed 2026-11-13]**`branchesOf`reads every backticked branch on the`> Branch(es):` line.

Not verifiable locally: unchanged from run 1.
Flaky: none new. Environmental: none (the build passes after the `node_modules` refresh).
Informational: 5 Address Book tests failing on `main` pass on the branch (live services).

### Run 2026-11-13 #3 — 11 findings (2 major, 9 minor; 1 needs an engineer decision)

Sources: `verify.sh` branch vs `main` 4cac49296 → **nothing new**, and only `.claude/` and
`CLAUDE.md` changed; hook self-test 86/86; built-in `/code-review` (medium; 10 candidates, all
kept after checking); T1, T2 and T4 reproduced with `review3-check*.mjs` in the session scratchpad.

- [x] T1 major — The Bash guard can be bypassed with `cd`. It only looks for `apps/`/`packages/` in
      the command text, and the shell keeps its directory between calls, so
      `cd apps/nfid-frontend` followed by `sed -i '' … src/a.ts` (or `> src/a.ts`) runs without a
      prompt. Reproduced — `.claude/hooks/pre-bash.js` `reasonFor` — use the hook input's `cwd`: if
      it is inside `apps/` or `packages/` of a checkout, treat the command as touching guarded
      paths (and resolve relative redirect targets against `cwd`).
      **[fixed 2026-11-13]** pre-bash.js uses the hook input's `cwd`: a shell already inside `apps/`/`packages/` counts as touching them, and relative redirect targets resolve against `cwd`. Self-test: `sed -i … src/a.ts`, `> src/a.ts`, `rm src/a.ts` with cwd in apps/ → ask; `ls`/`grep` there → no prompt.
- [x] T2 major — The plan template's guidance comment grants edits. `fileSections` drops fenced
      blocks but not HTML comments, and the comment inside `## Modified / New Files` contains
      `` `apps/nfid-frontend/src/features/x/**` `` (the Branch-line comment also adds
      `feature/<name>`, `fix/<name>`, `chore/<name>`). Reproduced: a plan straight from the
      template, with a real Branch line, allows editing `apps/nfid-frontend/src/features/x/a.ts`
      (exit 0) — `pre-tool-use.js` `fileSections`/`branchesOf`, `.claude/templates/plan.md` — strip
      `<!-- … -->` before parsing, and keep backticked examples out of template comments.
      **[fixed 2026-11-13]** HTML comments and fenced blocks are stripped before the file table and Branch line are read; the template no longer puts backticked examples in comments. Self-test: comment-only path → block; comment-only branch → block; a plan straight from the template grants nothing extra.
- [x] T3 minor — The hook header says agent worktrees are "supported", but plans stay uncommitted
      until `/pr`, so a new worktree has no plan and every guarded edit there is blocked. That's
      the safe outcome, since the pipeline never implements in a worktree, but the wording is
      wrong — `pre-tool-use.js` header, workflow.md rule 5 — say worktrees are _guarded_ (blocked
      unless that worktree has its own active plan).
      **[fixed 2026-11-13]** header and workflow.md rule 5 now say worktrees are _guarded_ (blocked unless that worktree has its own active plan). Self-test: fresh worktree → block.
- [x] T4 minor — The Bash guard misses some working-tree writers: - `git pull`, `git merge` and `git switch <existing>` - git with global options other than `-C` (`git -c k=v reset --hard`, `git --no-pager checkout -- …`) - `2>` / `&>` redirects into `apps/`

      Reproduced for `git pull` and `git -c … reset --hard` — `pre-bash.js` `GIT_TREE_REWRITE`,
      `redirectTargets` — allow any global options before the subcommand; add pull/merge/switch
      (not `switch -c`/`--create`); include `2>`/`&>` targets other than `&1`/`/dev/null`.

      **[fixed 2026-11-13]** any git global options before the subcommand; pull/merge/switch added (`switch -c`, `checkout -b` exempt); `2>` and `&>` targets checked (`/dev/null` excluded). 9 new command cases.

- [x] T5 minor — **Engineer decision.** A two-level directory prefix (`apps/nfid-frontend/`,
      `packages/ui/`) unlocks a whole Nx project, which weakens "the plan lists the file" and the
      deviation flow — `pre-tool-use.js` `listsFile` — recommendation: require at least **three**
      fixed levels for prefixes and globs (`packages/ui/src/`, `apps/nfid-frontend/src/`), or
      **exact paths only** (strictest; plans then list every file).
      **[fixed 2026-11-13]** per engineer decision: **exact paths only**. Glob and folder logic removed from the guard; workflow.md, the plan template, the /plan skill and CLAUDE.md updated. Self-test: folder, glob, brace and broad-folder entries → block; an exact path next to them → allow.
- [x] T6 minor — The post-edit hook measures paths against the main checkout, so files edited in a
      worktree are never formatted or linted — `post-tool-use.js` — share `canonical` and
      `checkoutRoot` with `pre-tool-use.js` (same nearest-`.git` logic).
      **[fixed 2026-11-13]** post-tool-use.js resolves the file's own checkout and runs Prettier/ESLint from there (falling back to the main checkout's `node_modules/.bin`). Self-test: a file in a detached worktree without node_modules gets formatted.
- [x] T7 minor — `/verify`'s E2E fallback says to re-run the tags "on the baseline worktree", which
      step 1 has already removed (or never created, on a cache hit) — `verify/SKILL.md` step 2 —
      create a fresh `origin/main` worktree for that re-run and remove it afterwards.
      **[fixed 2026-11-13]** `/verify` step 2 now creates a fresh `origin/main` worktree for the E2E comparison and removes it afterwards.
- [x] T8 minor — `nx format:check` matches the "Nx format" pattern (`\b` is satisfied before `:`), so
      a read-only check prompts the engineer — `pre-bash.js` `REPO_WIDE_WRITERS` — only match
      `format` or `format:write` followed by a space or the end.
      **[fixed 2026-11-13]** Nx and yarn format patterns require `format`/`format:write` followed by a space or the end; `nx format:check` and `yarn format:check` → no prompt.
- [x] T9 minor — `verify.sh` derive uses `gsub(root "/", …)`, which treats the path as a regex, so a
      root containing `.`, `+`, `(` or `[` may not be stripped — `cmd_derive` (build-errors) —
      use `index()`/`substr()` like the lint parser.
      **[fixed 2026-11-13]** build-error paths are stripped with `index()`/`substr()`; checked with the root `/tmp/a+b (x)/repo`.
- [x] T10 minor — Leftovers: `cmd_run`'s ignored `frozen` parameter, and `post-tool-use.js` has its
      own weaker `canonical()` — `verify.sh`, `post-tool-use.js` — drop the parameter; T6 shares
      the helpers.
      **[fixed 2026-11-13]** `cmd_run`'s ignored `frozen` parameter removed; post-tool-use.js now has the same `canonical()`/`checkoutRoot()` as the guard (marked keep-in-sync).
- [x] T11 minor — The guard reads the branch with `git rev-parse --abbrev-ref HEAD`, which fails on
      a branch with no commits yet, so plans count as "another branch" and every edit is blocked
      (found while reproducing T2) — `pre-tool-use.js` `currentBranch` — use
      `git symbolic-ref --short HEAD`.
      **[fixed 2026-11-13]** `currentBranch` uses `git symbolic-ref --short -q HEAD`. Self-test: a repo with no commits yet → its plan is recognised.

Not verifiable locally: unchanged from run 1. Flaky: none new. Environmental: none.

### Run 2026-11-13 #4 — 10 findings (1 major, 9 minor) + 1 design decision for the engineer

Sources: `verify.sh` branch vs `main` 4cac49296 → **nothing new**, only `.claude/` and `CLAUDE.md`
changed; hook self-test 107/107; built-in `/code-review` (medium). The reviewer ran U1–U4 through
`pre-bash.js`; all were let through without a prompt.

- [x] U1 major — `cd apps/x && echo hi > src/a.ts` in **one** command isn't caught: the redirect
      target is resolved against the hook's starting `cwd`, not the directory after the `cd`, and
      redirects don't count among the "touches apps/" operations. CLAUDE.md says commands from a
      shell `cd`-ed into apps/ are caught — `.claude/hooks/pre-bash.js`.
      **[fixed 2026-11-13]** pre-bash.js follows `cd` within the command (`workingDirs`) and resolves redirect targets against every directory the command runs in. Self-test: `cd apps/nfid-frontend && echo hi > src/a.ts` → ask. Also covered by post-bash.js.
- [x] U2 minor — `yarn nx lint <project> --fix` / `nx run-many -t lint --fix` isn't detected, and
      `Bash(yarn nx lint*)` is allow-listed. `/execute-ui-plan` step 6 runs exactly this, so it can
      rewrite unlisted files — `pre-bash.js`, `.claude/settings.json`.
      **[fixed 2026-11-13]** `nx lint … --fix` / `nx run-many … --fix` → ask (the hook's ask overrides the `Bash(yarn nx lint*)` allow rule); plain `nx lint` → no prompt.
- [x] U3 minor — Multi-statement inline scripts (`node -e "…; fs.writeFileSync('apps/x.ts','')"`,
      `python3 -c`) aren't detected: the pattern stops at the first `;` — `pre-bash.js`.
      **[fixed 2026-11-13]** inline-script check looks for node/python/ruby/deno/bun **and** a write API anywhere in the command; multi-statement `node -e` / `python3 -c` → ask.
- [x] U4 minor — `prettier --write "**/*.ts"` (glob arguments) isn't detected — `pre-bash.js`.
      **[fixed 2026-11-13]** `prettier --write` / `eslint --fix` with `.` or any wildcard argument → ask.
- [x] U5 minor — False prompts: `=>` in inline JS and `>` inside quoted awk/grep are read as
      redirects; with cwd inside apps/ the engineer gets asked about read-only commands — `pre-bash.js`.
      **[fixed 2026-11-13]** quoted strings are blanked before scanning for unquoted redirects, and `=>` is excluded; `awk '$1 > 5'`, `grep 'a > b'`, `node -e "x => x"` with cwd in apps/ → no prompt.
- [x] U6 minor — `verify.sh compare` doesn't check that the baseline and the branch ran with the
      same `LAMBDA_IDENTITY` setting, so a cached baseline with the secret produces false "new
      failures" — `verify.sh` `cmd_compare` — refuse, or warn loudly, when the `lambda=` lines differ.
      **[fixed 2026-11-13]** `compare` warns and reports "not clean" when the baseline's and the branch's `lambda=` lines differ.
- [x] U7 minor — `compare` doesn't check that the baseline's `tsc_*.errors` files exist; a missing
      one makes `comm` fail silently and hides new tsc errors — `verify.sh` — route through
      `new_lines`.
      **[fixed 2026-11-13]** tsc errors go through `new_lines`; a missing result file now prints CAN'T COMPARE and counts as not clean (missing never means "nothing new").
- [x] U8 minor — The post-edit hook runs Prettier before `eslint --fix`, so an ESLint autofix can
      leave the file unformatted — `post-tool-use.js` — run ESLint first, then Prettier.
      **[fixed 2026-11-13]** post-tool-use.js runs `eslint --fix` first, then Prettier.
- [x] U9 minor — `canonical()`/`checkoutRoot()` are copied into three hooks with keep-in-sync
      comments — move them to a shared `.claude/hooks/lib.js` (a new file, which needs approval).
      **[fixed 2026-11-13]** no new `lib.js` (not approved): `pre-tool-use.js` exports `canonical`, `checkoutRoot`, `locate`, `isGuarded`, `plansFor`, `listsFile` and runs the guard only when executed as the hook (paths canonicalised on both sides). post-tool-use.js, pre-bash.js and post-bash.js import them. Self-test: importing it has no side effects.
- [x] U10 minor — Indented code fences (inside list items) aren't stripped, so a backticked path in
      an indented example under a file table would grant — `pre-tool-use.js`
      `withoutCommentsAndFences`.
      **[fixed 2026-11-13]** fence stripping accepts indented fences; self-test: a path inside an indented fence under the file table → block.

**Design decision for the engineer (Bash guard)** — decided 2026-11-13: option 1, implemented as `.claude/hooks/post-bash.js` (PostToolUse Bash; 12 cases in the self-test, e.g. unplanned untracked or modified files reported once, planned files and changes outside apps/ not reported, `_ic_api/` always reported). Rounds 2, 3 and 4 each found new shell commands
that `pre-bash.js` misses (R6 → T1/T4 → U1–U4). Parsing shell text is an arms race that can't be
won. Proposal:

- Keep `pre-bash.js` as the _early warning_ for the obvious cases.
- Add a **PostToolUse Bash check**: after every shell command, run `git status --porcelain` for
  `apps/` and `packages/`. If a changed file isn't in an active plan's file table, report it at once
  (to Claude and the engineer), naming the command.

That catches every write, whatever the syntax, with the same exact-path rule as the Edit guard.
Remaining parser gaps then become minor by design.

Not verifiable locally: unchanged from run 1. Flaky: none new. Environmental: none.

### Run 2026-11-13 #5 — 10 findings (3 major, 7 minor)

Sources: `verify.sh` branch vs `main` 4cac49296 → one new failing test (`Kong quote test › should
return quote`), which **passed on re-run**, so it's flaky and not a finding; only `.claude/` and
`CLAUDE.md` changed. Hook self-test 137/137. Built-in `/code-review` (medium; all 10 candidates
checked and kept). `post-bash.js` measured at ~0.3 s per shell command.

- [x] V1 major — `post-bash.js` counts a file as planned only while its plan is in an _editing_
      status. From `VERIFIED` on (and on every deviation, which sets `DRAFT`), every planned file
      under `apps/`/`packages/` is reported as "unplanned" after each shell command, so `/document`
      and `/pr` (which run `git status`) are stopped on every feature plan — `post-bash.js`
      `unplannedIn` — planned = listed (exact path) by any plan on this branch that isn't `DONE`,
      whatever its status. The editing-status rule stays in the Edit guard.
      **[fixed 2026-11-13]** post-bash counts a file as planned if any plan on this branch that isn't DONE lists it (`plansFor().onBranch`); the Edit guard keeps the editing-status rule. Self-test: VERIFIED, DOCUMENTED, PR OPEN, DRAFT, APPROVED → no report; DONE or another branch → reported.
- [x] V2 major — `verify.sh compare` can't see a test stage that stops running. If the branch
      breaks a Jest config or a test target crashes before any suite runs, there are no new
      `FAIL`/`●` lines, and the stage already fails on `main` (live-canister suites), so the result
      is "nothing new" — `verify.sh` `cmd_derive`/`cmd_compare` — derive the passed/total suite and
      test counts from the Jest summary lines, and flag fewer passing suites or tests than the baseline.
      **[fixed 2026-11-13]** derive writes `failed-targets.txt` (Nx "Failed tasks") and `test-counts.txt` (per-project suites/tests passed from the Jest summary); compare reports new failing targets, fewer passing suites/tests, and a failing target with no Jest summary (tests didn't run). Checked on the real run #5 logs (no false report) and 3 synthetic cases.
- [x] V3 major — Fail-closed only covers `main()`. If a hook can't load (`CLAUDE_PROJECT_DIR` unset
      or wrong, or a syntax/import error, and pre-bash/post-bash now import `pre-tool-use.js`),
      node exits 1, which Claude Code treats as "allow" — `.claude/settings.json` hook commands —
      map exit 1 to exit 2 in the command
      (`node "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-tool-use.js"; rc=$?; [ $rc -eq 1 ] && exit 2; exit $rc`),
      for both PreToolUse hooks.
      **[fixed 2026-11-13]** both PreToolUse commands in settings.json: `node …; rc=$?; [ $rc -eq 1 ] && exit 2; exit $rc`. Self-test: a hook that can't load → exit 2; normal allow → 0, normal block → 2.
- [x] V4 minor — False prompts from `pre-bash.js`: - `git merge-base` and `git stash list/show` (`\b` matches inside `merge-base`) - `git apply --check` - git text inside quoted strings (`gh pr create --body "…git checkout…"`)

      Location: `GIT_TREE_REWRITE`. Fix: require whitespace or the end after the subcommand, skip
      read-only forms, match on the unquoted command.

      **[fixed 2026-11-13]** the git subcommand must be a whole word; `stash list/show` and `apply --check/--stat/…` are read-only; git text inside quotes is ignored (matched on the unquoted command). 7 new command cases.

- [x] V5 minor — The guards apply to `apps/`/`packages/` in _any_ git checkout, so editing an
      unrelated Nx repo is blocked with "Run /plan…" — `pre-tool-use.js` `locate` callers — guard
      only checkouts that use this workflow (`.claude/plans/` exists, or it's this hook's own project).
      **[fixed 2026-11-13]** `locate()` and post-bash only govern checkouts with `.claude/plans/` (this repo and its worktrees track it); an unrelated repo's `apps/` → allowed and not reported.
- [x] V6 minor — `cd "$ROOT/apps" && sed -i … x.ts` isn't caught by pre-bash (variables aren't
      expanded, and `apps"` has no trailing slash). post-bash still reports it afterwards —
      `pre-bash.js` — accept as a heuristic limit (post-bash covers it), or treat a `cd` into an
      unresolvable `$…` path that mentions `apps`/`packages` as guarded.
      **[accepted by engineer 2026-11-13]** heuristic limit of pre-bash.js; post-bash.js reports the resulting change.
- [x] V7 minor — This plan's own file table uses brace globs
      (`.claude/skills/{spec,plan,…}/SKILL.md`, `.claude/templates/{spec,plan}.md`), which the
      exact-path rule and `/pr`'s "stage exactly the files in the table" step can't match —
      `.claude/plans/sdd-workflow.plan.md` — list every file by its exact path.
      **[fixed 2026-11-13]** file table rows expanded to exact paths; checked that all 24 changed files are listed exactly.
- [x] V8 minor — `post-bash.js` runs `git status` on every shell command (~0.3 s here). Fine for now —
      **propose accepting**; skip read-only commands only if it becomes noticeable.
      **[accepted by engineer 2026-11-13]** ~0.3 s per shell command is acceptable; revisit only if it becomes noticeable.
- [x] V9 minor — `post-bash.js` has a redundant `existsSync` before `readState()` (which already
      handles a missing file).
      **[fixed 2026-11-13]** the redundant `existsSync` is gone.
- [x] V10 minor — `readInput()` and the write-tool list are still repeated in post-tool-use.js /
      pre-bash.js / post-bash.js; export them from `pre-tool-use.js` like the path helpers.
      **[fixed 2026-11-13]** `readInput` and `WRITE_TOOLS` are exported from pre-tool-use.js and imported by post-tool-use.js, pre-bash.js and post-bash.js.

Not verifiable locally: unchanged from run 1. Flaky (re-run passed): `Kong quote test › should
return quote` (live canister; also failed on `main` in the 2026-11-10 triage). Environmental: none.

### Run 2026-11-13 #6 — 9 findings (2 major, 7 minor)

Sources: `verify.sh` branch vs `main` 4cac49296 → one new failing test (`SwapService › should
return swap providers map`, `ServiceUnavailableError` from a live provider), which **passed on
re-run**, so it's flaky and not a finding; build, lint and tsc are clean; only `.claude/` and
`CLAUDE.md` changed. Hook self-test 161/161. Built-in `/code-review` (medium). W1 and W3 were
reproduced against the real plans.

- [x] W1 major — `post-bash.js` counts 9 older plans (`COMPLETE`/`DRAFT`/`APPROVED`/`IMPLEMENTED`,
      no `Branch:` line) as planned **on every branch**, so the ~50 files in their tables are never
      reported. Introduced by the V1 fix ("branchless plans count unless DONE"; the older plans
      use `COMPLETE`) — `pre-tool-use.js` `plansFor().onBranch` — finished = `DONE` or `COMPLETE`;
      a plan without a Branch line counts only while `IN PROGRESS` (same as the Edit guard).
      **[fixed 2026-11-13]** finished = DONE or COMPLETE; branchless plans count only while IN PROGRESS (same as the Edit guard). Real repo: post-bash now counts only sdd-workflow.plan.md on this branch (was 10 plans).
- [x] W3 major — `listsFile` accepts a backticked path anywhere in a file-table section, so
      `| \`apps/a.ts\` | 1 | same as \`apps/b.ts\` |`also grants`apps/b.ts`(Edit guard) and
hides it from post-bash. Reproduced —`pre-tool-use.js` `listsFile`— only the **first
cell** of each table row counts.
**[fixed 2026-11-13]**`listsFile` reads only the first cell of each table row; Change-column and note paths grant nothing (Edit guard and post-bash).
- [x] W2 minor — A `> Branch:` value without backticks (`remove-legacy-dfinity-deps.plan.md`) reads as
      "no Branch line" — `branchesOf` — also accept a plain first word.
      **[fixed 2026-11-13]** `branchesOf` also reads a plain first word when the Branch line has no backticks.
- [x] W4 minor — `yarn lint --fix` (root script → `nx run-many -t lint`) isn't caught by pre-bash;
      post-bash reports the resulting changes — accept as a heuristic limit, or add the pattern (cheap).
      **[accepted by engineer 2026-11-13]** heuristic limit of pre-bash.js; post-bash.js reports the resulting file changes.
- [x] W5 minor — Destructive git inside a quoted `sh -c "…"`/`bash -c '…'` isn't caught. Unlike
      file writes, `git stash`/`git checkout -- …` _remove_ changes, which post-bash can't see —
      `pre-bash.js` — also scan the inside of `-c '…'`/`-c "…"` strings.
      **[fixed 2026-11-13]** pre-bash also scans scripts passed to `sh/bash/zsh … -c '…'` (incl. combined flags like `-lc`) for destructive git.
- [x] W6 minor — `pushd <dir>`, `cd ~/…` and quoted `cd` targets with spaces aren't followed;
      post-bash reports the resulting changes — accept as a heuristic limit.
      **[accepted by engineer 2026-11-13]** heuristic limit of pre-bash.js; post-bash.js reports the resulting file changes.
- [x] W7 minor — post-bash performance (same as V8) — already accepted by the engineer.
      **[accepted by engineer 2026-11-13]** same as V8.
- [x] W8 minor — `compare` shows a stage as `ok` when the baseline has no exit code recorded for it
      (an older cached baseline) — `cmd_compare` — treat a missing baseline value as CAN'T COMPARE.
      **[fixed 2026-11-13]** `compare` prints CAN'T COMPARE (not ok) when a stage is missing from either run.
- [x] W9 minor — post-bash.js and post-tool-use.js both compute the hook's own checkout root —
      export a `hookRoot()` helper from pre-tool-use.js.
      **[fixed 2026-11-13]** `hookRoot()` exported from pre-tool-use.js; used by post-tool-use.js and post-bash.js.

Not verifiable locally: unchanged from run 1. Flaky (re-run passed): `SwapService › should return
swap providers map` (live provider). Environmental: none.

### Run 2026-11-13 #7 (final run under the convergence rule) — 10 minor findings, 0 major

Sources: `verify.sh` branch vs `main` 4cac49296 → one new failing test (`shroff test › shroff
quote test`, live icpswap quote), which **passed on re-run**, so it's flaky and not a finding;
build, lint and tsc are clean; only `.claude/` and `CLAUDE.md` changed. Hook self-test 177/177.
Built-in `/code-review` (medium).

Shell-guard heuristics, accepted under the convergence rule (post-bash reports the resulting file
changes):

- [x] X1 minor — `git checkout -b x <ref>` / `git switch -c x <ref>` don't prompt even with a start
      point. **[accepted — convergence rule]** `/implement` itself runs `git switch -c <branch>
origin/main`, and a clean-tree branch switch loses no work.
- [x] X4 minor — `yarn lint --fix` isn't caught (same as W4). **[accepted — convergence rule]**
- [x] X7 minor — post-bash runs git on every command (same as V8/W7). **[accepted — convergence rule]**
- [x] X10 minor — `cd "apps/dir with spaces"` isn't followed (same class as W6). **[accepted — convergence rule]**

Other minor findings — **engineer decision: fix now or accept**:

- [x] X2 minor — `/ui-planning`'s plan template (older flow, still supported) writes no
      `> Branch:` line, so its plans unlock files on every branch while `IN PROGRESS` —
      `.claude/skills/ui-planning/SKILL.md` — add a `> Branch:` line to its template
      (recommended: cheap).
      **[fixed 2026-11-13]** the `/ui-planning` template now writes a `> Branch:` line
      (`feature/[feature-name]`); `/execute-ui-plan` gets a precondition to create or switch to that
      branch before setting `IN PROGRESS`.
- [x] X3 minor — post-bash treats a `DRAFT` plan's files as planned, so a shell edit approved at the
      pre-bash prompt before the plan is approved isn't reported. This is the V1 trade-off: DRAFT
      deviations must not be reported — recommended: **accept**.
      **[accepted by engineer 2026-11-13]** V1 trade-off.
- [x] X5 minor — Each unplanned file is reported only once; if it's ignored, `/verify`'s file review
      (every changed file must be in the table) and `/pr` (stop on files outside the table) still
      catch it — recommended: **accept**.
      **[accepted by engineer 2026-11-13]** `/verify`'s file review and `/pr` still stop on files outside the table.
- [x] X6 minor — `/execute-ui-plan` step 6 runs `yarn nx lint nfid-wallet-client --fix`, which now
      prompts at every checkbox (U2) and can rewrite unplanned files. The post-edit hook already
      runs `eslint --fix` on each edited file — `.claude/skills/execute-ui-plan/SKILL.md` — run lint
      without `--fix` and fix the reported issues with Edit (recommended: cheap).
      **[fixed 2026-11-13]** `/execute-ui-plan` step 6 runs `yarn nx lint <project>` without `--fix`; remaining errors are fixed with Edit (the post-edit hook already runs `eslint --fix` per edited file).
- [x] X8 minor — In a sibling worktree without `node_modules`, the post-edit hook's ESLint can't
      resolve its plugins and fails silently (worktrees under `.claude/worktrees/` work, because
      resolution walks up to the main checkout) — recommended: **accept** (worktrees aren't used for
      implementation).
      **[accepted by engineer 2026-11-13]** implementation doesn't happen in worktrees.
- [x] X9 minor — post-tool-use.js imports `WRITE_TOOLS` (which includes NotebookEdit) but never reads
      `notebook_path`, and settings.json doesn't send it NotebookEdit — recommended: **accept** (no
      effect; formatting doesn't apply to notebooks).
      **[accepted by engineer 2026-11-13]** no effect.

Not verifiable locally: unchanged from run 1. Flaky (re-run passed): `shroff test › shroff quote
test` (live icpswap). Environmental: none.

### Run 2026-11-13 #8 — 10 minor findings, 0 major

Sources: `verify.sh` branch vs `main` 4cac49296 → one "new lint failure" on
`apps/nfid-frontend/src/__hooktest__.ts`. That's the temporary file the hook self-test creates and
deletes, and the self-test was run at the same time as the suite. Re-running lint passes (exit 0,
no errors), so it isn't a finding. Otherwise clean (tsc, unit tests, build match `main`; only
`.claude/` and `CLAUDE.md` changed). Hook self-test 177/177. Built-in `/code-review` (medium; the
reviewer reproduced Y3 and Y4). Review: every changed file is in the file table (first column),
Phases 1–2 have no open boxes, and there are no leftovers.

Repeats of already-accepted findings:

- [x] Y4 minor — `yarn lint --fix` has no prompt (= W4/X4). **[accepted earlier]**
- [x] Y7 minor — the post-edit hook ignores NotebookEdit (= X9). **[accepted earlier]**
- [x] Y9 minor — post-bash cost (= V8/W7/X7). **[accepted earlier]**

New — **engineer decision: fix now or accept**:

- [x] Y1 minor — `/verify` step 5's fresh-worktree re-check copies the work with
      `git diff origin/main | git -C <wt> apply`. In the fix loop (branch already has commits) that
      patch doesn't apply to a worktree of the branch, and binary files are dropped —
      `.claude/skills/verify/SKILL.md` — use `git diff --binary HEAD` on a worktree of the branch
      `HEAD`, plus untracked files (recommended: **fix**, skill text).
      **[fixed 2026-11-13]** step 5 now starts the re-check worktree at the branch `HEAD` (`--detach`), applies `git diff --binary HEAD` with `apply --binary`, and copies untracked files with `git ls-files … -z | tar`. Tried on a throwaway repo: committed + uncommitted text, a modified binary and an untracked file in a folder with a space all arrive.
- [x] Y2 minor — post-bash's "already reported" set never expires, so a file reported in one session
      is never reported again in later sessions (e.g. the fresh `/verify` session) —
      `post-bash.js` — key the state by the hook input's `session_id` (recommended: **fix**, cheap;
      `/verify`'s file review and `/pr` still catch it either way).
      **[fixed 2026-11-13]** the state file now stores `{ session, reported }`; a different `session_id` starts empty. Self-test: same file in a new session → reported again, then not again in that session.
- [x] Y3 minor — `git switch -C` / `--force-create` and `git checkout -B` are exempt as "create a
      branch", but they force-reset an existing branch (e.g. could move `chore/sdd-workflow` back
      to `main`). Reproduced by the reviewer — `pre-bash.js` — exempt only `-c`/`--create` and `-b`
      (recommended: **fix**, one line).
      **[fixed 2026-11-13]** only `switch -c`/`--create` and `checkout -b` are exempt; `switch -C`, `--force-create` and `checkout -B` → ask. 3 new command cases.
- [x] Y5 minor — `statusOf` reads the first `> Status:` line; older multi-revision plans
      (`remember-me.plan.md` has six) put later statuses below it. The new templates have a single
      status line — recommended: **accept** (older plans only).
      **[accepted by engineer 2026-11-13]** older multi-revision plans only; the new templates have one status line.
- [x] Y6 minor — An unclosed `<!--` (e.g. in inline code) before the file table makes the comment
      stripping remove the table, so edits are blocked. That fails closed: an annoyance, not a gap —
      recommended: **accept**.
      **[accepted by engineer 2026-11-13]** fails closed (blocks), never opens.
- [x] Y8 minor — The `settings.json` allow list still has `Bash(yarn nx typecheck*)` (no such target)
      and `Bash(tsc --noEmit*)`, while every doc now uses `npx tsc --noEmit -p …`, so each type check
      asks for permission — `.claude/settings.json` — replace both with `Bash(npx tsc --noEmit*)`
      (recommended: **fix**).
      **[fixed 2026-11-13]** `Bash(yarn nx typecheck*)` and `Bash(tsc --noEmit*)` replaced by `Bash(npx tsc --noEmit*)`.
- [x] Y10 minor — `verify.sh` records the checkout root with `pwd -P`, which keeps the shell's path
      case (`/Users/…/documents/nfid/…`), but ESLint prints the real case (`…/Documents/NFID/…`), so
      lint paths aren't made repo-relative. If `main` ever has lint errors, every one would show as
      "new" (found in this run's output) — `verify.sh` `cmd_run` — record the root with
      `node -p 'require("fs").realpathSync.native(".")'` (recommended: **fix**).
      **[fixed 2026-11-13]** the root is recorded with `node -p 'require("fs").realpathSync.native(".")'`. Self-test: from a lower-case cwd it gives the on-disk path.

Not verifiable locally: unchanged from run 1. Flaky: none. Environmental: none (the lint
failure was a self-test artifact, see above).

### Run 2026-11-13 #9 (short re-verify of the run #8 fixes) — 10 findings, 0 major

Sources: hook self-test 186/186; built-in `/code-review` (medium), scoped to the 5 files changed in
the run #8 fixes; Z1 and Z3 reproduced with `z-check.mjs` (session scratchpad). The full check
suite wasn't re-run (decision "Short re-verify").

Shell-guard heuristics (convergence rule says accept, but Z1 and Z3 are cheap and let
**destructive** git through, which post-bash can't see) — **engineer decision**:

- [x] Z1 minor — `pre-bash.js`'s git tail capture `([^;&|]*)` crosses newlines, so a new-branch
      command swallows what follows it: `git checkout -b x⏎git reset --hard origin/main` and
      `bash -c "git stash"; git switch -c tmp` get no prompt. Reproduced — exclude `\n` from the
      capture (one character).
      **[fixed 2026-11-13]** the git argument capture stops at a newline (`[^;&|\n]*`, and spaces/tabs only between git options). Self-test: `checkout -b x⏎git reset --hard` and `bash -c "git stash"; git switch -c tmp` → ask; `checkout -b x⏎git status` → no prompt.
- [x] Z3 minor — The `switch -c`/`checkout -b` exemption ignores discard flags:
      `git switch -c x --discard-changes` and `git checkout -f -b x` get no prompt. Reproduced — don't
      exempt when `-f`/`--force`/`--discard-changes` is present.
      **[fixed 2026-11-13]** no exemption when `-f`, `--force` or `--discard-changes` is present. Self-test: 3 cases → ask.
- [x] Z2 minor — `switch -c x <start-point>` doesn't prompt (= X1). **[accepted earlier]**

Introduced by the run #8 fixes — **engineer decision**:

- [x] Z4 minor — Y2's per-session state holds **one** session id per checkout. Two sessions open on
      the same checkout (e.g. the recommended fresh `/verify` session next to the implement
      session) overwrite each other's state, so while an unplanned file exists, every shell
      command in both sessions re-reports it and blocks — `post-bash.js` — store a map
      `{ session → reported }` (keep the last few sessions).
      **[fixed 2026-11-13]** the state is a map `session_id → reported files`, last 5 sessions kept. Self-test: two sessions alternating don't re-report; the oldest session is evicted.
- [x] Z6 minor — Y1's re-check worktree is detached, so it has no branch, no plan counts there, and
      post-bash reports every applied file as unplanned (and blocks) if a command runs with its cwd
      in that worktree — `post-bash.js` — skip checkouts on a detached HEAD (no branch, so no plan
      can apply; the Edit guard already blocks edits there).
      **[fixed 2026-11-13]** post-bash skips checkouts on a detached HEAD. Self-test: detached → no report.
- [x] Z5 minor — The re-check worktree is dirty after `apply` + untracked copy, so the plain
      `git worktree remove` in step 5 fails — `verify/SKILL.md` — use `git worktree remove --force`
      (it's /verify's own throwaway checkout).
      **[fixed 2026-11-13]** step 5 removes the re-check worktree with `git worktree remove --force` (its own throwaway checkout). Tried on a throwaway repo.
- [x] Z8 minor — `git apply` rejects empty input ("No valid patches"), e.g. when all uncommitted work
      is untracked files — `verify/SKILL.md` — add `--allow-empty`.
      **[fixed 2026-11-13]** `git apply --binary --allow-empty`. Tried with only untracked changes.
- [x] Z9 minor — post-bash.js's header still describes the old "report once, ever" behaviour —
      update the comment.
      **[fixed 2026-11-13]** header comment describes per-session reporting, the session map, and the detached-HEAD skip.
- [x] Z10 minor — The state file is written in place (truncate + write); parallel Bash calls can read
      a half-written file and re-report — `post-bash.js` — write to a temp file and `rename`.
      **[fixed 2026-11-13]** the state is written to a temp file and renamed. Self-test: state file is valid JSON with a sessions map.

Recommended accept:

- [x] Z7 minor — A baseline cached before Y10 still has a `pwd -P` root file. Only the current cache
      (main 4cac49296) predates Y10, and its root was written by hand in the correct case; future
      `main` SHAs build new baselines with the fixed code — recommended: **accept**.
      **[accepted by engineer 2026-11-13]**

Not verifiable locally: unchanged from run 1. Flaky: none. Environmental: none.

### Verified 2026-11-13 (engineer decision "Finish line", option 1)

All run #9 findings are fixed (Z1, Z3, Z4, Z5, Z6, Z8, Z9, Z10) or accepted (Z2, Z7). Per the
decision, the plan is VERIFIED on the hook self-test (199/199, run with the repo path in both
cases) without another code-review round. The full check suite last ran in run #8 (clean against
`main`); the changes since touch only hooks, `verify.sh`, `settings.json` and skill text, none of
which are build or test inputs. Open findings: 0.

## Docs sync

### 2026-11-13

Search terms: `nfid-frontend` as an Nx project (`nx lint|test|build|serve nfid-frontend`),
`nfid-frontend:typecheck`, `--testPathPattern`, `SDD Enforcement`, "unchecked task checkbox",
`Sonnet 4.6`, hook file names (`pre-tool-use`, `post-tool-use`, `pre-bash`, `post-bash`),
`/execute-ui-plan`, `/ui-planning`, `/ui-brainstorming`, `verify.sh`, `e2e-local.sh`.

Updated:

- `.claude/plans/icp-sdk-max-version-upgrade.plan.md`, `.claude/plans/auth/disable-email-google-registration-ui.plan.md`
  (COMPLETE) — dated note: the Nx project is `nfid-wallet-client` and there's no `typecheck` target.
- `.claude/specs/major-dependency-updates.spec.md`, `.claude/specs/auth/email-google-registration-disabled-toast.spec.md`
  (APPROVED, work done) — the same dated note.
- `.claude/plans/auth/disable-email-google-registration.plan.md` (active DRAFT) — reference fixed in place.
- This plan: Phase 3 boxes, the self-test count (21 → 199), the "shell edits" risk row (now pre-bash +
  post-bash), `PR OPEN (#n)` → `PR OPEN` (Deviation 6), a note that later decisions supersede the
  command contracts, Follow-ups (open Deviations 3 and 4, accepted limitations, self-test deletion,
  `/dependabot-update` prompts), and the 5 files above in the file table.

Reviewed, no change needed:

- `/execute-ui-plan` mentions in 8 older plans — the skill still exists and works with the new guard.
- `CLAUDE.md` — already updated during implementation (Verification Commands, SDD Workflow, hooks).
- `.claude/commands/commit.md`, `write-unit-tests.md` — updated in Phase 1; `dependabot-update.md` —
  still uses its own inline suite (follow-up); `security-review.md` — unaffected.
- `.claude/skills/ui-brainstorming/SKILL.md` — unaffected (its spec template has no verification commands).
- `.github/` — no docs reference the workflow, hooks or commands.

READMEs reviewed (root, `apps/*`, `packages/*`, `docker-e2e-tests/`): none mention the SDD workflow,
hooks, Nx project names or verification commands — all current, no findings.

## Deviations

Phase 1 (2026-11-13). Changes made during implementation, all within the planned files (no
re-approval needed):

1. **Guard path canonicalisation (security fix found by the self-test).** macOS paths are
   case-insensitive, so `/users/…/documents/…` and `/Users/…/Documents/…` are the same file. The
   old `resolve()` + `relative()` produced `../…` for a differently-cased path, so the file was
   treated as outside the repo and was **not guarded**. Both hooks now use `realpathSync.native`
   (through the nearest existing parent for new files).
2. **Only file tables grant edits.** The first version accepted any backticked path anywhere in an
   active plan, so prose such as "changes under `apps/`" in this plan unlocked all of `apps/`.
   Now only `## … Files` sections count, and a directory prefix must be at least two levels deep
   (`packages/ui/` yes, `packages/` no).
3. **Phase check scope.** `prettier --check .claude CLAUDE.md` fails on three files that are already
   unformatted on `main` and that this plan doesn't touch:
   `plans/delete-account-default-button.plan.md`, `specs/discovery/monetization.spec.md`,
   `specs/opencryptopay/opencryptopay.spec.md`. The check was run on the changed files instead
   (clean). Formatting those three is left to the engineer (one `prettier --write`).
4. **Open question for the engineer.** `.claude/plans/enable-email-device-removal.plan.md` has
   `Status: IMPLEMENTED — increment 2 … awaiting engineer review`. Under the new guard that is an
   editing status, so the files in its tables stay editable. If that work is finished, its status
   should become `COMPLETE`.

Hook self-test: 21 cases (20 guard, 1 post-hook), all passing. The script is kept in the session
scratchpad and re-run in Phase 3.

Phase 2 (2026-11-13). Changes made during implementation:

5. **New file `.claude/templates/workflow.md`** (not in the original table; under `.claude/`, so
   the guard doesn't apply). It holds the status lifecycle and shared rules that all seven skills
   read first, instead of copying them seven times. Added to the file table.
6. **`PR OPEN` has no PR number.** `/pr` sets the status _before_ its single commit (the number
   isn't known yet); `/plan <name> done` finds the PR by branch. That avoids a second
   "record the PR number" commit, in line with "one commit at the end".
7. **All seven skills set `disable-model-invocation: true`**, so they only run when the engineer types
   the command. They're gates, not something I should trigger on my own.
8. **`verify.sh` has `run` / `derive` / `compare` / `baseline-dir` subcommands.** `derive` lets
   the comparison be re-run on existing logs; the baseline is cached per `main` SHA in
   `$TMPDIR/nfid-verify/<sha>`, so it survives across sessions.
9. **`/verify` re-runs every newly failing unit test once** before calling it a finding (flaky vs
   real), and runs failing E2E tags on the baseline to separate environment problems from findings.
   Both lessons come from the 2026-11-10 triage.
10. **Two Phase 2 checks need the engineer:** typing the commands in a fresh session (skill
    resolution and built-in shadowing) and the interactive refusal test. New project skills are
    only picked up by a new session, so they can't be run from this one.

Verify fixes (2026-11-13):

11. **`.claude/settings.json` added to the file table** for F2 (hooks loaded by relative path fail
    with "module not found" → exit 1 → edit allowed). Approved by the engineer in advance on
    2026-11-13 ("please proceed with all the rest", answering the pre-approval question).

12. **New file `.claude/hooks/pre-bash.js`** and a Bash matcher in `.claude/settings.json` for R6.
    Approved by the engineer on 2026-11-13 ("let's restrict it, and ask every time when it's needed").

13. **New file `.claude/hooks/post-bash.js`** and a PostToolUse Bash matcher in `.claude/settings.json`.
    Approved by the engineer on 2026-11-13 ("let's go with option 1"). U9 (shared helpers) is done
    **without** a new `lib.js`, which wasn't approved: `pre-tool-use.js` exports its helpers, and the
    other hooks import them from it.
