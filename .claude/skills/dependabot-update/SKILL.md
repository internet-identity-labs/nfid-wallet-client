---
name: dependabot-update
description: Land open Dependabot PRs — keep every compatible bump, migrate our code for breaking ones (one plan approval per PR), revert only as a last resort, push one commit to the same PR
argument-hint: "[PR number] [--dry-run]"
disable-model-invocation: true
allowed-tools: Bash(gh pr list*), Bash(gh pr view*), Bash(gh pr diff*), Bash(gh pr checks*), Bash(git *), Bash(yarn*), Bash(npx tsc*), Bash(node *), Bash(.claude/skills/verify/scripts/e2e-local.sh*), Read, Grep, Glob, Edit, Write
---

# /dependabot-update

Goal: **every library is updated whenever it is possible — by changing our code if that's what it takes.** For each open Dependabot PR: keep every bump that installs, type-checks, lints, tests and builds; for bumps that break **our code**, migrate the code (one plan approval per PR); revert only what can't be migrated or is blocked by something outside our code. Push one commit to the same PR branch; report.

Arguments: `$ARGUMENTS`

- A PR number → process only that PR. Otherwise process every open Dependabot PR.
- `--dry-run` → do everything except `git commit`, `git push` and `gh pr comment`. Print the PR comment draft with the terminal report instead.

SDD: root `package.json` / `yarn.lock` are tooling tier and need no plan. Code changes under `apps/` / `packages/` use the **dependency-migration tier** (`.claude/sdd/workflow.md` rule 2): one `deps-<PR>` plan per PR, written by this command in step 6, with an inline `## Spec` section instead of a spec file. The engineer approves it once; the edit guard (`.claude/hooks/pre-tool-use.js`) then allows exactly the files it lists.

## Repo facts (verified)

- Yarn 1.22; Node is the exact version in `.nvmrc` (also pinned in root `package.json` `engines.node` and `docker-e2e-tests/Dockerfile`). Single Dependabot directory `/`; workspaces' `package.json` files are not bumped.
- Dependabot (`.github/dependabot.yml`) opens npm PRs with title prefix `[yarn]:`: one `minor-and-patch` group PR, one PR per `*-major` family group (`nx-major`, `e2e-tooling-major` — `@wdio/*`, `webdriverio`, `@cucumber/*`, … only affect `apps/nfid-frontend-e2e` —, `storybook-major`, `babel-major`, `typescript-eslint-major`, `react-major`, `jest-major`, `walletconnect-major`, `lifi-major`, `icp-major`, `radix-major`, `eslint-major`), and **one PR per major bump that matches no group** (there is no catch-all `major` group). Plus separate security PRs (`dependabot/npm_and_yarn/npm_and_yarn-*`) that usually only touch `yarn.lock` (transitive deps). Process `minor-and-patch` before the majors.
- Most deps are pinned exactly (`"1.2.3"`), a few use `^`. Preserve whichever style the base used.
- `resolutions` in root `package.json` pin `@typescript-eslint/*` for `@nx/eslint-plugin` — keep them in sync if `@typescript-eslint/*` or `@nx/*` moves.
- Nx project names: `nfid-wallet-client` (= `apps/nfid-frontend`), `nfid-demo`, `ui`, `integration`, `client-db`, `swr`, `utils`, `config`, `ui-tailwind-core`, `nfid-frontend-e2e`. There is no `typecheck` target — use `tsc` directly.
- Already ignored in `.github/dependabot.yml`: `@icp-sdk/core`, `@icp-sdk/auth`.
- `typescript` bumps: check the `typescript` peer ranges of `@typescript-eslint/*`, `ts-jest`, `@storybook/react-webpack5` and `@nx/*` before keeping one (e.g. `@typescript-eslint` 8.71 requires `<6.1.0`). Keep `webpack-dev-server` inside the `@nx/webpack` peer range (`^5.0.0`).
- The edit guard checks a file against the plans **in the checkout the file lives in** (a worktree has its own `.claude/plans/`) and against that checkout's **branch** (`> Branch:` line). Plans stay uncommitted until the commit step (step 8), like `/pr`.
- Unit tests need `LAMBDA_IDENTITY` for live-canister suites; without it some suites fail on `main` too. Always compare failing suite names against the baseline, never exit codes. Jest output has ANSI codes — strip them before grepping.
- Yarn 1 does **not** prune stale nested packages on an in-place install (not even with `--check-files`). Example (#3309, wdio 9 → 10): `node_modules/@wdio/cucumber-framework/node_modules/@cucumber/tag-expressions@6.1.0` survives, Cucumber 13 resolves it and every feature fails with `Cucumber errored when trying to do a "pickles:filter" transform`. A worktree whose `node_modules` has seen other versions (fallbacks, bisecting) must be reinstalled from scratch (`rm -rf node_modules` + `find apps packages -maxdepth 2 -name node_modules -prune -exec rm -rf {} +`) before the final suite and E2E. CI's E2E job restores a cached `node_modules` (fixed key `test-nfid-fe`) and installs over it, so it can hit the same thing: if CI E2E fails like that while the local clean run passes, report it as a CI cache issue, not a bump failure.

## 0. Preflight

1. `gh auth status` must succeed. `node -v` must match `.nvmrc` — if not, stop and tell the user (`nvm use`).
2. List PRs:
   ```bash
   gh pr list --author "app/dependabot" --state open --json number,title,headRefName,baseRefName,mergeable,files
   ```
3. Work in a **separate worktree on a named local branch** (the migration plan's `> Branch:` line must name it), so the user's current branch is untouched:
   ```bash
   git fetch origin
   git worktree add -b deps/<PR> ../nfid-deps-<PR> origin/<headRefName>
   ```
   Run everything below from that worktree. Remove it at the end (`git worktree remove`, then `git branch -D deps/<PR>` — only after the push succeeded).
4. If the PR is `CONFLICTING`, merge `origin/main` into it. On conflicts in `package.json` / `yarn.lock`: take **`origin/main`'s** `package.json` and `yarn.lock`, re-apply only the PR's bumps (from step 1's table) to `package.json`, then `yarn install` to regenerate the lockfile. Taking the PR side would silently undo bumps that landed on `main` since.

Process PRs **one at a time**, security (lockfile-only) PRs first — they are small and both PRs fight over `yarn.lock`.

## 1. Build the bump list

From `git diff origin/<base>...HEAD -- package.json` (not the PR body — it can be truncated) build a table:

| package | from | to | dep/devDep | semver jump (patch/minor/major, or `0.x` minor = major) |

For lockfile-only PRs, take the list from the PR body ("Updates `x` from a to b") and from `git diff -- yarn.lock`.

**Group packages into families that must move together**, never split a family:
`@nx/*` + `nx` · `@storybook/*` + `storybook` (keep 8.x libs and 10.x libs each consistent) · `@walletconnect/*` + `@reown/*` · `@wdio/*` + `webdriverio` + `expect-webdriverio` · `@babel/*` · `@typescript-eslint/*` (+ `resolutions`) · `react` + `react-dom` + `@types/react*` · `@radix-ui/*` · `@lifi/*` · `@testing-library/*` · `@dfinity/*` + `@icp-sdk/*` · `eslint*` · `jest*` + `ts-jest` + `@types/jest`.

## 2. Static compatibility analysis (before running anything)

For every **major** (and `0.x` minor) bump, and for any family whose members get different versions:

- Read the release notes / CHANGELOG / **migration guide** (PR body links, or `npm view <pkg>@<to> repository.url` then the GitHub releases). Note every breaking change.
- Grep our usage: `grep -rn "from \"<pkg>" apps packages --include=*.ts --include=*.tsx`, plus config files (`webpack.config.js`, `project.json`, `jest.config.*`, `wdio*.conf.ts`, `.eslintrc*`/`eslint.config.*`, `babel.config.*`). For each breaking change, list the **call sites it hits**.
- `npm view <pkg>@<to> engines peerDependencies --json`: flag if `engines.node` excludes the Node version in `.nvmrc`, or if peers exclude versions we pin (e.g. `react`, `typescript`).
- Flag ESM-only / CJS removal changes for anything used by jest, babel, webpack or wdio configs.
- **Third-party blockers:** other deps we have (not in this PR) that depend on or peer the old major (e.g. a reporter/plugin with `@wdio/*@^9`). Check `npm view <dep> dist-tags dependencies peerDependencies` for a compatible release.

Mark each family:

- `likely-ok` / `risky` — verify as usual.
- `migrate` — a breaking change hits **our code or config**. Goes to the migration plan (step 6), not reverted.
- `blocked` — a constraint we can't fix in our code: `engines` vs `.nvmrc`, a peer range of a package not bumped in this PR, an ignored dependency, or a third-party blocker with no compatible release and no acceptable replacement. Try the highest working version (step 5.4), report the rest.

## 3. Baseline

In a second worktree on the **base branch** (`git worktree add ../nfid-deps-base origin/main`), run the verification suite (step 4) once and save the output. Pre-existing failures on `main` are not caused by the bump and must not cause reverts or migrations. Also record base `yarn install` peer-dependency warnings. Base and PR suites can run in parallel.

## 4. Verification suite

Run in this order, save full logs to the scratchpad (running all stages, not stopping at the first failure, gives better attribution):

```bash
yarn install --non-interactive 2>&1 | tee install.log   # baseline: add --frozen-lockfile. Never "--frozen-lockfile=false" (yarn 1 parses it as `yarn install false` and aborts)
for c in apps/nfid-frontend/tsconfig.app.json apps/nfid-frontend/tsconfig.spec.json \
         apps/nfid-frontend-e2e/tsconfig.json; do
  npx tsc --noEmit -p "$c" || echo "TSC FAILED: $c"       # e2e config catches @wdio / cucumber breaks
done
# packages/*/tsconfig.lib.json are not standalone-checkable (~900 pre-existing TS6307 errors) — lint + build cover them
yarn nx run-many -t lint --all --skip-nx-cache
npx env-cmd -f .env.test nx run-many -t test --all --skip-nx-cache --runInBand
yarn nx run-many -t build --all --skip-nx-cache
```

A stage **fails** if it has errors / failing suites that the baseline doesn't (compare tsc error lines and failing suite names, not exit codes), or if `install.log` has an engines error or a new peer-dependency warning involving a bumped package.

## 5. Find the compatible set

1. Run the suite on the full PR. All green → nothing to change, skip to step 8 (no commit needed; just report "safe to merge").
2. Otherwise **attribute** each failure: package names in stack traces, `node_modules/<pkg>` paths, type errors in `.d.ts` of a package, failing imports.
   - Failure **in our files** (type error / lint error / failing test / build error in `apps/` or `packages/`, or in our config) caused by a breaking change → family is `migrate`. Keep the new version; it goes to step 6.
   - Failure **inside a package** or from engines/peers we can't change → `blocked`: revert the family and re-run.
3. If attribution is unclear, **bisect by family**:
   - Start from the base versions.
   - Apply all `likely-ok` families together (mostly patch/minor) → verify. If red, split that set in half and repeat until the culprit family is found.
   - Then add each `risky` family **one at a time** → verify → keep if green, classify (`migrate` / `blocked`) if red.
4. For `blocked` families, try the **highest version that still works** before giving up: `npm view <pkg> versions --json`, try the latest patch/minor inside the current major (e.g. `@wdio/*` 10.x blocked → latest 9.x). Better a partial update than none.
5. Revert = edit root `package.json` back to the base version (keep the original `^`/exact style), then `yarn install` to regenerate `yarn.lock`. Never hand-edit `yarn.lock`.
6. Lockfile-only PRs (transitive deps): to revert one bump, copy that package's entry block from the base `yarn.lock` (`git show origin/main:yarn.lock`) over the PR's block, then run `yarn install` and confirm the lockfile is stable. Do not use `yarn upgrade` — it rewrites `package.json`. These PRs are usually security fixes: if the only option is reverting a security bump, do not revert — report it as "blocked, needs manual fix" and leave the PR alone.

No `migrate` families → skip to the final check below, then step 8.

## 6. Migration plan (only if there are `migrate` families)

Write `<worktree>/.claude/plans/deps-<PR>.plan.md` (the worktree's own plans folder — that's where the guard looks):

```markdown
# Plan: Migrate code for <PR title> (#<PR>)

> Status: DRAFT
> Spec: inline — dependency-migration tier (`/dependabot-update`)
> Shortcut: —
> Created: <today>
> Branch: `deps/<PR>`

## Spec

- Bumps: <family: from → to>, …
- Intended behaviour: no functional change; the app and E2E suite behave as before.
- Breaking changes that hit us: <change> — <link> — <call sites>
- Third-party blockers: <dep> — <why> — options: keep and let CI/E2E decide / replace with <x> / drop — **recommendation: …**

## Modified / New Files

| File                   | Change                 |
| ---------------------- | ---------------------- |
| `apps/…/exact/path.ts` | <what changes and why> |

## Verification

- Full suite vs baseline (step 4).
- E2E tags to run locally: <tags, and why>

## Deviations

—
```

Rules:

- One row per file, **exact repo-relative path in the first column** (the guard reads only that). Never `_ic_api/` (generated from Candid; the guard blocks it anyway).
- Prefer the smallest change that fits the library's new API; no refactors, no unrelated fixes.
- **Size gate:** if the plan lists more than 10 files, or any build/test config (`webpack.config.js`, `project.json`, `jest.config.*`, `wdio*.conf.ts`, `tsconfig*.json`, `nx.json`, eslint/babel config), say so explicitly when asking.
- Show the plan to the engineer and ask for approval. **Only** when they say "approved": set `> Status: IN PROGRESS`. Never write `APPROVED`/`IN PROGRESS` without that. Declined → treat those families as `blocked` (step 5.4/5.5) and report them under "Needs migration" with the plan's findings.

## 7. Migrate

1. Apply the plan with **Edit/Write only** (never `sed`/redirection under `apps/`/`packages/`). A file outside the plan is needed → stop, follow the deviation rules in `.claude/sdd/workflow.md` rule 6 (record it, add the row, `Status: DRAFT — deviation: …`, re-approve).
2. Re-run the **full** suite (step 4) vs baseline.
3. If the change touches `apps/nfid-frontend-e2e/` or UI code under `apps/nfid-frontend/` / `packages/ui/`, reinstall `node_modules` from scratch (see Repo facts), then run the affected E2E tags locally: `.claude/skills/verify/scripts/e2e-local.sh '<tags>' <scratchpad>/e2e-<PR>` (find tags in `apps/nfid-frontend-e2e/src/features/*.feature` that use the changed steps/pages; for a pure E2E-framework bump with type-only changes run at least one smoke feature). Compare with the same tags on the baseline worktree if something fails — the dev environment can be flaky.
4. Red → fix within the plan. Still red after a reasonable attempt → revert the code changes **of that family** (Edit back to the original) and fall back to step 5.4, and report what was tried under "Needs migration".
5. Green → set `> Status: IMPLEMENTED`.

Final check: run the **full** suite once more on the final set. It must be green (modulo baseline failures).

## 8. Commit & push

Only if something was reverted, migrated, or a merge from `main` was needed. Show the engineer the staged file list and the message first, and wait for a yes (`permissions.ask` prompts too):

Like `/pr`: first set the deps plan to `> Status: PR OPEN — branch <headRefName>`, then stage it together with its files.

```bash
git add package.json yarn.lock .claude/plans/deps-<PR>.plan.md <every file in the deps plan's file table>
git commit -m "[yarn]: land <group> — migrate code / drop incompatible bumps

Kept: <n> packages
Migrated: <family from → to> (<files>)
Reverted: <pkg@to → from (reason)>, ...

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(If step 0.4 merged `main`, this is the merge commit.) Husky's pre-commit runs lint-staged — let it run, do not use `--no-verify`.
Unless `--dry-run`: `git push origin HEAD:<headRefName>` (plain push, **never** `--force`).

Note for the user: once a human commit is on the branch, Dependabot stops rebasing it. Do **not** comment `@dependabot rebase/recreate` — that would wipe our commit.

## 9. Report

Two outputs: a **short PR comment** for reviewers, and the **full report** in the terminal for the engineer.

### PR comment (unless `--dry-run`: `gh pr comment <PR> --body-file comment.md`)

Humans scan it on the PR page, so keep it **≤ ~10 lines**: what happened to the bumps, what changed in our code, what the reviewer must watch. No per-package tables (Dependabot's PR body already lists the bumps), no per-check results, no "checked, not affected" lists, no logs, no YAML. Omit empty bullets.

```markdown
## Dependency update

Kept <n> of <total> · Migrated: <family from → to, or "none"> · Reverted: <n>

- **Code changes:** <breaking change in a few words> → `<file>`, `<file>`
- **Reverted:** <pkg from → to> — <reason in a few words>
- **Watch:** <one line per thing the reviewer must check, e.g. a CI risk>

Checks vs `main` ✅ · E2E local: <tags> ✅ (or "not run, CI decides") · Plan: `.claude/plans/deps-<PR>.plan.md`
```

Example (#3309): `Kept 11 of 11 · Migrated: wdio 9 → 10 · Reverted: 0`, one **Code changes** bullet per breaking change, one **Watch** bullet for the CI `node_modules` cache.

### Terminal report (always)

Everything the engineer may need, in the reply: kept / migrated / partially updated / reverted / needs migration (with evidence: the failing stage and the error line), third-party blockers and the option chosen, verification results, E2E tags + result, and the suggestions below. The deps plan keeps the migration details.

For **blocked** majors, suggest, but **do not apply**, `ignore` entries for `.github/dependabot.yml` so Dependabot stops re-proposing them until the blocker is gone, e.g.:

```yaml
- dependency-name: "@wdio/*"
  update-types: ["version-update:semver-major"]
```

Also check the **major groups** in `.github/dependabot.yml`, and suggest (but **do not apply**) a new `*-major` group, or a new pattern for an existing one, when:

- a single-package major PR failed only because a related package didn't move with it (peer-dependency warning or error naming a package from the same family, or lockstep versions like `foo` + `foo-*` / `@scope/*`), or
- a family from step 1 has members in `package.json` that no group pattern matches.

Only group packages that must move together (lockstep releases or strict peers). Independent packages stay as single PRs so one blocked major doesn't hold back the others. Put the suggestion in the terminal report under **Suggested Dependabot groups**, as YAML ready to paste (not in the PR comment).

## Guardrails

- Never merge, close or approve PRs. Never push to `main`. Never force-push.
- Modify files under `apps/` or `packages/` **only** when they're listed in an approved `deps-<PR>` plan, with Edit/Write. Never `_ic_api/`.
- Never bump anything beyond what Dependabot proposed. Exception: replacing or dropping a third-party blocker, when that option was chosen in the approved plan.
- Stop and ask if: Node version mismatch, `gh` not authenticated, the PR branch has non-Dependabot commits you didn't author, or the baseline itself does not install.
