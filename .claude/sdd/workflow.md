# SDD pipeline — shared rules

Every pipeline skill (`/spec`, `/plan`, `/implement`, `/implement-e2e`, `/verify`, `/document`,
`/pr`) reads this file first and follows it.

```
/spec → /plan → /implement → /implement-e2e → /verify → /document → /pr
```

## Status lifecycle

The `> Status:` line in the plan (or spec) is the single source of truth. Text after the status word
(e.g. `IN PROGRESS — Phase 2 next`) is free-form.

| Status        | Set by                                                            | Next                                                                  |
| ------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `DRAFT`       | `/spec`, `/plan`, or any deviation                                | engineer approves → `APPROVED`                                        |
| `APPROVED`    | `/plan` (or `/spec`) when the engineer says "approved"            | `/implement` (spec: `/plan`)                                          |
| `IN PROGRESS` | `/implement` (phases left or open findings), `/verify` (findings) | `/implement`                                                          |
| `IMPLEMENTED` | `/implement` (all phases done, no open findings)                  | `/implement-e2e`                                                      |
| `E2E READY`   | `/implement-e2e`                                                  | `/verify`                                                             |
| `E2E N/A`     | `/implement-e2e` when the E2E scope is "None"                     | `/verify`                                                             |
| `VERIFIED`    | `/verify` with zero open findings                                 | `/document`                                                           |
| `DOCUMENTED`  | `/document`                                                       | `/pr`                                                                 |
| `PR OPEN`     | `/pr` (set just before its commit; the PR is found by branch)     | CI red / review comments → `/implement`; merged → `/plan <name> done` |
| `DONE`        | `/plan <name> done` after merge                                   | —                                                                     |

If the status doesn't allow the command, **refuse** in one line, naming the current status and the
command to run instead. Never "fix up" the status to make a command run.

## Rules for every step

1. **Read from disk, not memory.** Start by reading `.claude/plans/<name>.plan.md` and its spec.
   Every step must work in a fresh session.
2. **Two tiers.** Feature work (anything under `apps/` or `packages/`) needs an approved spec and an
   approved plan. Tooling work (root config, `.github/`, `docker-*`, `.claude/`, lockfile) needs
   only an approved plan with `Spec: none — tooling tier (<why>)`.
3. **No commits before `/pr`.** Work stays uncommitted on the branch until `/verify` and `/document`
   have passed. Even in `/pr`, show the engineer the staged files, the commit message and the PR
   text, and wait for an explicit yes before `git commit` / `git push` / `gh pr …`. Claude Code
   enforces this too: `permissions.ask` in `.claude/settings.json` prompts for `git commit` and
   `git push` (also with global options such as `git -C <dir> …`) and for
   `gh pr create|edit|comment|merge|close|review|ready|reopen`, whatever a skill or hook says.
   It matches command text, so other routes (`gh api`, a script that commits) aren't covered;
   the rule above still applies to them.
4. **No destructive git.** Never run `git reset --hard`, `git checkout -- <path>`, `git restore`,
   `git stash`, `git clean` or `git rebase`. Until `/pr`, the work exists only in the working tree.
5. **Edit `apps/` and `packages/` with the Edit/Write tools only**, never `sed` or shell redirection.
   `.claude/hooks/pre-tool-use.js` allows an edit only if a plan:
   - is in an editing status (`IN PROGRESS`, `IMPLEMENTED`, `E2E READY`, `E2E N/A`)
   - belongs to the checked-out branch of the checkout the file is in, via its `> Branch:` line.
     A plan without a Branch line counts only while `IN PROGRESS`.
   - lists the file's **exact repo-relative path** in the **first column** of its
     `## Modified / New Files` (or `## New Files` / `## Modified Files`) table. Folders and globs
     grant nothing, and neither do paths in other columns, HTML comments, code blocks or anywhere
     else in the plan.

   If the hook itself errors, or its input is unreadable, it blocks (fail closed). Worktrees are
   guarded the same way against their own plans; plans stay uncommitted until `/pr`, so a fresh
   worktree normally has none, and guarded edits there are blocked.
   `.claude/hooks/pre-bash.js` asks the engineer before any shell command that looks like it
   writes under `apps/` or `packages/`, or rewrites the working tree (`git checkout/reset/stash/…`).
   Because guessing from command text can't be complete, `.claude/hooks/post-bash.js` checks the
   result: after every shell command it runs `git status` on `apps/` and `packages/` and reports
   any changed file that no plan on this branch lists (exact path, first column, any status except
   `DONE`/`COMPLETE`, so planned changes stay planned after `VERIFIED` and during deviations; a
   plan without a Branch line counts only while `IN PROGRESS`). When it reports, **stop
   and tell the engineer**: ask before reverting an unintended change, or record a deviation for a
   needed one. All hooks only govern checkouts that use this workflow (`.claude/plans/` exists);
   both PreToolUse hooks have `"onFailure": "block"` in `settings.json`, so one that can't start
   or crashes blocks too.
   These hooks guard against _accidental_ changes; they are not a security boundary. Approval is a
   human step, and never write an `APPROVED` status yourself unless the engineer said "approved".

6. **Out-of-plan change needed → stop.** Record it under `## Deviations` (what, why, which file),
   add the file to the table, set `Status: DRAFT — deviation: <one line>`, and ask the engineer to
   approve. Don't continue until they do. **No exceptions**, including docs: a README under `apps/`
   or `packages/` that the change makes stale must be in the file table from `/plan` on, and
   `/implement` updates it together with the code.
7. **Never modify** `apps/nfid-frontend/src/integration/_ic_api/` or `packages/integration/src/lib/_ic_api/`
   (generated from canister Candid). The guard always blocks paths containing `/_ic_api/`.
8. **End every step with a report:** what was done, anything surprising, the new status, and the
   next command, e.g. `Next: /verify node-upgrade`.

## Project facts the steps rely on

- Nx project names: `nfid-wallet-client` (= `apps/nfid-frontend`), `nfid-demo`, `nfid-frontend-e2e`,
  `ui`, `integration`, `client-db`, `swr`, `utils`, `config`, `ui-tailwind-core`.
- Type-check: `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json`, `…/tsconfig.spec.json`,
  `apps/nfid-frontend-e2e/tsconfig.json`. There is no `typecheck` target. `packages/*/tsconfig.lib.json`
  can't be checked on its own; lint and build cover the packages.
- Jest 30: `--testPathPatterns` (plural).
- Unit tests as CI runs them: `npx env-cmd -f .env.test nx run-many -t test --runInBand`. Live-canister
  suites need `LAMBDA_IDENTITY` and fail without it, so always compare against a `main` baseline
  by test name.
- E2E: WebdriverIO + Cucumber in `apps/nfid-frontend-e2e/src/{features,steps,pages}`; test accounts
  in `users.json`; local run by tag via `.claude/skills/verify/scripts/e2e-local.sh`.
