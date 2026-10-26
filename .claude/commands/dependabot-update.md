---
description: Triage open Dependabot PRs — keep every compatible bump, revert the incompatible ones, push a fix-up commit to the same PR
argument-hint: "[PR number] [--dry-run]"
allowed-tools: Bash(gh pr list*), Bash(gh pr view*), Bash(gh pr diff*), Bash(gh pr checks*), Bash(git *), Bash(yarn*), Bash(npx tsc*), Bash(node *), Read, Grep, Glob, Edit, Write
---

# /dependabot-update

Goal: **every library is updated whenever it is possible.** For each open Dependabot PR, find the largest set of bumps that still installs, type-checks, lints, tests and builds; revert only what breaks; push one commit to the same PR branch; report.

Arguments: `$ARGUMENTS`

- A PR number → process only that PR. Otherwise process every open Dependabot PR.
- `--dry-run` → do everything except `git push` and `gh pr comment`. Print the report instead.

Root `package.json` / `yarn.lock` are outside `apps/` and `packages/`, so this command needs no SDD spec/plan. **Never edit source under `apps/` or `packages/` to make a bump compile** — if a bump needs code changes, it is reverted and listed under "needs migration" in the report.

## Repo facts (verified)

- Yarn 1.22, Node `22.18.0` (`.nvmrc`). Single Dependabot directory `/`; workspaces' `package.json` files are not bumped.
- Dependabot (`.github/dependabot.yml`) opens up to three grouped npm PRs, title prefix `[yarn]:`: `minor-and-patch`, `e2e-tooling-major` (`@wdio/*`, `webdriverio`, `@cucumber/*`, … — only affect `apps/nfid-frontend-e2e`) and `major` (everything else). Plus separate security PRs (`dependabot/npm_and_yarn/npm_and_yarn-*`) that usually only touch `yarn.lock` (transitive deps). Process `minor-and-patch` before the majors.
- Most deps are pinned exactly (`"1.2.3"`), a few use `^`. Preserve whichever style the base used.
- `resolutions` in root `package.json` pin `@typescript-eslint/*` for `@nx/eslint-plugin` — keep them in sync if `@typescript-eslint/*` or `@nx/*` moves.
- Nx project names: `nfid-wallet-client` (= `apps/nfid-frontend`), `nfid-demo`, `ui`, `integration`, `client-db`, `swr`, `utils`, `config`, `ui-tailwind-core`, `nfid-frontend-e2e`. There is no `typecheck` target — use `tsc` directly.
- Already ignored in `.github/dependabot.yml`: `@icp-sdk/core`, `@icp-sdk/auth`.
- `typescript` bumps: check the `typescript` peer ranges of `@typescript-eslint/*`, `ts-jest`, `@storybook/react-webpack5` and `@nx/*` before keeping one (e.g. `@typescript-eslint` 8.71 requires `<6.1.0`). Keep `webpack-dev-server` inside the `@nx/webpack` peer range (`^5.0.0`).

## 0. Preflight

1. `gh auth status` must succeed. `node -v` must match `.nvmrc` — if not, stop and tell the user (`nvm use`).
2. List PRs:
   ```bash
   gh pr list --author "app/dependabot" --state open --json number,title,headRefName,baseRefName,mergeable,files
   ```
3. Work in a **separate worktree** so the user's current branch is untouched:
   ```bash
   git fetch origin
   git worktree add ../nfid-deps-<PR> origin/<headRefName>
   ```
   Run everything below from that worktree. Remove it at the end (`git worktree remove`).
4. If the PR is `CONFLICTING`, merge `origin/main` into it first (same as done historically, e.g. "Merge branch 'main' into dependabot/..."). On `yarn.lock` conflicts take the PR side for `package.json`, then regenerate the lockfile with `yarn install`.

Process PRs **one at a time**, security (lockfile-only) PRs first — they are small and both PRs fight over `yarn.lock`.

## 1. Build the bump list

From `git diff origin/<base>...HEAD -- package.json` (not the PR body — it can be truncated) build a table:

| package | from | to | dep/devDep | semver jump (patch/minor/major, or `0.x` minor = major) |

For lockfile-only PRs, take the list from the PR body ("Updates `x` from a to b") and from `git diff -- yarn.lock`.

**Group packages into families that must move together**, never split a family:
`@nx/*` + `nx` · `@storybook/*` + `storybook` (keep 8.x libs and 10.x libs each consistent) · `@walletconnect/*` + `@reown/*` · `@wdio/*` + `webdriverio` · `@babel/*` · `@typescript-eslint/*` (+ `resolutions`) · `react` + `react-dom` + `@types/react*` · `@radix-ui/*` · `@lifi/*` · `@testing-library/*` · `@dfinity/*` + `@icp-sdk/*` · `eslint*` · `jest*` + `ts-jest` + `@types/jest`.

## 2. Static compatibility analysis (before running anything)

For every **major** (and `0.x` minor) bump, and for any family whose members get different versions:

- Read the release notes / CHANGELOG (PR body links, or `npm view <pkg>@<to> repository.url` then the GitHub releases). Note breaking changes.
- Grep our usage: `grep -rn "from \"<pkg>" apps packages --include=*.ts --include=*.tsx`. Decide if any breaking change hits code we actually use.
- `npm view <pkg>@<to> engines peerDependencies --json`: flag if `engines.node` excludes `22.18.0`, or if peers exclude versions we pin (e.g. `react`, `typescript`).
- Flag ESM-only / CJS removal changes for anything used by jest, babel, webpack or wdio configs.

Mark each family: `likely-ok`, `risky`, `needs-migration` (definitely requires code changes → revert without testing, it goes to the report).

## 3. Baseline

In a second worktree on the **base branch** (`git worktree add ../nfid-deps-base origin/main`), run the verification suite (step 4) once and save the output. Pre-existing failures on `main` are not caused by the bump and must not cause reverts. Also record base `yarn install` peer-dependency warnings.

## 4. Verification suite

Run in this order, stop at the first failing stage, save full logs to the scratchpad:

```bash
yarn install --non-interactive 2>&1 | tee install.log   # baseline: add --frozen-lockfile. Never "--frozen-lockfile=false" (yarn 1 parses it as `yarn install false` and aborts)
for c in apps/nfid-frontend/tsconfig.app.json apps/nfid-frontend/tsconfig.spec.json \
         apps/nfid-frontend-e2e/tsconfig.json; do
  npx tsc --noEmit -p "$c" || echo "TSC FAILED: $c"       # e2e config catches @wdio / cucumber breaks
done
# packages/*/tsconfig.lib.json are not standalone-checkable (~900 pre-existing TS6307 errors) — lint + build cover them
yarn nx run-many -t lint --all
yarn nx run-many -t test --all
yarn nx run-many -t build --all
```

A stage **fails** if it fails on the PR but not on the baseline, or if `install.log` has an engines error or a new peer-dependency warning involving a bumped package. Tell the user that E2E (`yarn test:e2e:frontend`) is **not** run locally; CI's Desktop Tests workflow runs it on push.

## 5. Find the compatible set

1. Run the suite on the full PR. All green → nothing to revert, skip to step 6 (no commit needed; just report "safe to merge").
2. Otherwise **attribute** each failure: package names in stack traces, `node_modules/<pkg>` paths, type errors in `.d.ts` of a package, failing imports. Revert the attributed family and re-run.
3. If attribution is unclear, **bisect by family**:
   - Start from the base versions.
   - Apply all `likely-ok` families together (mostly patch/minor) → verify. If red, split that set in half and repeat until the culprit family is found.
   - Then add each `risky` family **one at a time** → verify → keep if green, revert if red.
4. When a family fails at the new version, try the **highest version that still works** before giving up: `npm view <pkg> versions --json`, try the latest patch/minor inside the current major (e.g. `@wdio/*` 10.0.x red → try latest 9.x). Better a partial update than none.
5. Revert = edit root `package.json` back to the base version (keep the original `^`/exact style), then `yarn install` to regenerate `yarn.lock`. Never hand-edit `yarn.lock`.
6. Lockfile-only PRs (transitive deps): to revert one bump, copy that package's entry block from the base `yarn.lock` (`git show origin/main:yarn.lock`) over the PR's block, then run `yarn install` and confirm the lockfile is stable. Do not use `yarn upgrade` — it rewrites `package.json`. These PRs are usually security fixes: if the only option is reverting a security bump, do not revert — report it as "blocked, needs manual fix" and leave the PR alone.

Final check: run the **full** suite once more on the final set. It must be green (modulo baseline failures).

## 6. Commit & push

Only if something was reverted or changed:

```bash
git add package.json yarn.lock
git commit -m "[yarn]: drop incompatible bumps from dependabot group

Kept: <n> packages
Reverted: <pkg@to → from (reason)>, ...

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Husky's pre-commit runs lint-staged — let it run, do not use `--no-verify`.
Unless `--dry-run`: `git push origin HEAD:<headRefName>` (plain push, **never** `--force`).

Note for the user: once a human commit is on the branch, Dependabot stops rebasing it. Do **not** comment `@dependabot rebase/recreate` — that would wipe our commit.

## 7. Report

Post (unless `--dry-run`) with `gh pr comment <PR> --body-file report.md`, and print the same to the user:

```markdown
## Dependency triage (automated)

**Kept (N):** table of package | from → to
**Partially updated (N):** package | wanted → got | why
**Reverted (N):** package | from → to | stage that failed | one-line evidence (error message)
**Needs migration (N):** package | to | breaking change that hits our code | files affected
**Not verified locally:** E2E — check the Desktop Tests CI run.
```

Then suggest, but **do not apply**, `ignore` entries for `.github/dependabot.yml` for the reverted majors so Dependabot stops re-proposing them, e.g.:

```yaml
- dependency-name: "@wdio/*"
  update-types: ["version-update:semver-major"]
```

## Guardrails

- Never merge, close or approve PRs. Never push to `main`. Never force-push.
- Never modify files under `apps/` or `packages/`.
- Never bump anything beyond what Dependabot proposed.
- Stop and ask if: Node version mismatch, `gh` not authenticated, the PR branch has non-Dependabot commits you didn't author, or the baseline itself does not install.
