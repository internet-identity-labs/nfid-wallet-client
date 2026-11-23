# Plan: /dependabot-update migrates code instead of reverting breaking bumps

> Status: PR OPEN — branch dependabot/npm_and_yarn/main/e2e-tooling-major-eb4348e223 (#3309). Deviation 2 approved 2026-11-17; deviation 1 (CI cache key) NOT applied: engineer wants to see #3309 CI first
> Spec: none — tooling tier (only `.claude/` and `CLAUDE.md` change; no file under `apps/` or `packages/`)
> Shortcut: —
> Created: 2026-11-17 (engineer decisions: one plan approval per PR, migration on the same Dependabot PR, any size but pause if big)
> Branch: `deps/3309` (local worktree branch; pushed to `dependabot/npm_and_yarn/main/e2e-tooling-major-eb4348e223`)

## Goal

`/dependabot-update` exists so libraries **get updated**. Today it reverts any bump that needs code
changes and lists it as "needs migration" (SKILL.md: "Never edit source under `apps/` or
`packages/`"). That gives the engineer nothing CI wouldn't. After this change the command migrates
our code for breaking bumps, inside the SDD rules, and reverts only as a last resort.

## Findings

- Trigger: #3309 (e2e-tooling-major, wdio 9 → 10). The only code break is 3× `TS2345 'Element' is
not assignable to 'ChainablePromiseElement'` (`apps/nfid-frontend-e2e/src/steps/activity.ts:54,68`,
  `steps/commonWalletSteps.ts:61`), all caused by one helper signature in
  `apps/nfid-frontend-e2e/src/pages/activity.ts:31,35`. The command reverted the whole wdio family to 9.33.1.
  Third-party blocker in the same PR: `wdio-video-reporter@6.2.0` (latest) depends on `@wdio/*@^9`.
- SDD guard (`.claude/hooks/pre-tool-use.js`): an edit under `apps/`/`packages/` is allowed only if a
  plan **in the same checkout** (the worktree has its own `.claude/plans/`) is in an editing status,
  names the worktree's **checked-out branch** in `> Branch:`, and lists the exact path in the first
  column of `## Modified / New Files`. `post-bash.js` reports unplanned changes after shell commands.
  So the migration plan must be written inside the PR worktree, and the worktree must be on a named
  local branch (today the skill uses a detached `git worktree add … origin/<head>`).
- `workflow.md` rule 2: feature work needs an approved spec **and** plan. A Dependabot migration has
  no product behaviour to specify. Engineer chose one approval per PR, so a third tier is needed:
  one `deps-<PR>` plan whose `## Spec` section replaces the spec file.
- `apps/`/`packages/` edits must use Edit/Write, not sed (rule 5). `_ic_api/` stays untouchable.
- Commits: the command already commits + pushes to the Dependabot branch (its own "/pr" step);
  `permissions.ask` still prompts for `git commit`/`git push`/`gh pr comment`.

## Design

New flow in SKILL.md (steps renumbered):

1. Preflight (changed): `git worktree add -b deps/<PR> ../nfid-deps-<PR> origin/<headRefName>` so the
   worktree has a named branch for the plan's `> Branch:` line. Push stays `git push origin HEAD:<headRefName>`.
2. Bump list, 3. static analysis, 4. baseline: unchanged, except static analysis now also collects,
   per breaking family, the **migration guide / changelog entries** and the **call sites they hit**.
   Mark families `likely-ok`, `risky`, `migrate` (replaces `needs-migration`) or `blocked`. `blocked`
   means a hard external constraint we can't change in code: engines vs `.nvmrc`, a peer range of
   another package we don't bump in this PR, or an ignored dependency.
3. Find the compatible set: unchanged for attribution and bisecting, but a family that fails on
   **our code** (type errors in our files, removed API we call, config option renamed) becomes
   `migrate` instead of being reverted.
4. **Migration plan (new).** For all `migrate` families, write
   `<worktree>/.claude/plans/deps-<PR>.plan.md` with `> Status: DRAFT`, `> Spec: inline — dependency
migration tier`, `> Branch: \`deps/<PR>\``, and sections:
   - `## Spec`: the bumps, each breaking change that hits us (with link), the intended behaviour
     ("no functional change"), and for each third-party blocker (a dep with no compatible release,
     e.g. `wdio-video-reporter`) the options: keep and let CI decide / replace with X / drop, with a
     recommendation.
   - `## Modified / New Files`: exact paths, one row per file, with the change per file.
   - `## Verification`: suite + which E2E tags to run (see 7).
     Show it to the engineer and ask for approval. **Size gate:** if the plan touches more than 10
     files, or any build/test config (`webpack.config.js`, `project.json`, `jest.config.*`,
     `wdio*.conf.ts`, `tsconfig*.json`, `nx.json`), say so explicitly when asking. Only on "approved":
     set `IN PROGRESS`. Never write `APPROVED` yourself.
5. **Migrate (new).** Apply the changes with Edit/Write. Out-of-plan file needed → deviation rules of
   `workflow.md` (DRAFT, re-approve). Re-run the full suite vs baseline. If the change touches
   `apps/nfid-frontend-e2e/` or UI code, also run the affected E2E tags locally with
   `.claude/skills/verify/scripts/e2e-local.sh '<tags>' <outdir>` (if the change only touches
   type-level E2E code, run one smoke tag). Green → keep. Red after a reasonable fix attempt (or
   engineer declines the plan) → fall back to the old behaviour: highest working version / revert,
   and report it under "Needs migration" with what was tried.
6. Commit & push (changed): `git add package.json yarn.lock <plan's files>`; message lists Kept /
   Migrated (files) / Reverted. Like `/pr`: set the plan to `PR OPEN` and commit it with its files.
   Same approval prompts as today.
7. Report (changed): new **Migrated (N)** section: family | from → to | breaking change | files changed;
   "Needs migration" only for attempts that failed or were declined; third-party blockers listed with
   the chosen option. E2E line says which tags ran locally.

Guardrails change: "Never modify files under `apps/` or `packages/`" → "Only modify files under
`apps/`/`packages/` listed in an approved `deps-<PR>` plan, with Edit/Write; never `_ic_api/`."
"Never bump anything beyond what Dependabot proposed" stays, with one exception: replacing a
blocked third-party dep (option chosen in the approved plan) may add/remove that one package.

## Modified / New Files

| File                                                 | Change                                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/dependabot-update/SKILL.md`          | Goal text, preflight worktree branch, `migrate`/`blocked` marks, new steps 6–7, commit/report/guardrail changes (above) |
| `.claude/sdd/workflow.md`                            | Rule 2: third tier "dependency migration" = one `deps-<PR>` plan with inline `## Spec`, created by `/dependabot-update` |
| `CLAUDE.md`                                          | SDD section: one line naming the dependency-migration tier and pointing to the skill                                    |
| `.claude/plans/dependabot-update-migrations.plan.md` | This plan (status updates only)                                                                                         |
| `.claude/skills/verify/scripts/e2e-local.sh`         | Deviation 2: quote the tag expression inside the forwarded argument (`"--cucumberOpts.tags='$expr'"`)                   |

No hook change: the existing guard already works for a worktree plan with a Branch line.

## Verification

- Dry run on #3309: `/dependabot-update #3309 --dry-run` must produce a `deps-3309` plan listing
  `apps/nfid-frontend-e2e/src/pages/activity.ts` (and the step files only if needed), the
  `wdio-video-reporter` options, then after approval reach a green suite with wdio 10.2.0 +
  `expect-webdriverio` 8.1.0, and run E2E tags locally.
- Hook check: an Edit in the worktree to a file **not** in the deps plan is blocked.
- `yarn format:check` on the changed markdown files.

## Follow-ups

- After merge: real run on #3309 (commit + push + comment).
- Re-try previously reported migrations with the new flow: nx 24 (removed `@nx/webpack` executors,
  `composePlugins` in `apps/*/webpack.config.js`). This will hit the size gate.

## Deviations

1. **(NOT applied — engineer: push without it, check GitHub CI first)** **CI `node_modules` cache keyed on nothing** (`.github/workflows/desktop-tests.yml:316`, `:444`, key
   `test-nfid-fe` / `test-nfid-fe-mobile`). Found running #3309's E2E: after an in-place `yarn install` over
   `main`'s `node_modules` (what the E2E container does with the restored cache), yarn 1 leaves a stale
   `node_modules/@wdio/cucumber-framework/node_modules/@cucumber/tag-expressions@6.1.0` (not in the new
   lockfile; `--check-files` doesn't remove it either). Cucumber 13 resolves it and every feature fails with
   `Cucumber errored when trying to do a "pickles:filter" transform` (`tag_expressions.parse is not a
function`). A clean install resolves 11.0.1 and all features pass. A fixed key also means the cache is
   never re-saved after its first save. Fix: key on `hashFiles('yarn.lock')`, no `restore-keys` (a
   lockfile change must start from an empty `node_modules`). Cost: one cold install per lockfile change.
2. **`e2e-local.sh` never worked with its own tag wrapping.** It builds `(<tags>) and not @pending …` and
   passes it via `run-e2e-frontend.sh` → `nx run-commands`, which joins args unquoted into a `/bin/sh`
   string → `syntax error near unexpected token '('`. Fix: embed single quotes in the argument
   (verified: wdio receives the full expression).
3. SKILL.md (already in the table) also gets: "before running E2E in a worktree whose `node_modules` has
   seen other versions, delete `node_modules` and reinstall" and the Cucumber/stale-nested-dep gotcha.
