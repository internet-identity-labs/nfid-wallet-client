# Plan: Upgrade Node 22.18.0 → 22.23.5

> Status: PR OPEN — branch chore/node-22-upgrade
> Spec: none — tooling tier (only root config, `docker-e2e-tests/` and `.claude/` change; no file under `apps/` or `packages/`)
> Shortcut: —
> Created: 2026-11-10 (revised 2026-11-16 to the SDD template; 2026-11-17 engineer decisions: exact pin 22.23.5, manual image rebuild)
> Branch: `chore/node-22-upgrade`

## Goal

Move the whole repo (local dev, CI unit tests, E2E Docker image, dev/prod deploy builds) from Node
22.18.0 to 22.23.5, the latest 22.x LTS ("Jod"). Several dependency majors are blocked only by
`engines.node`, and 22.23.5 is the newest security release. The major version stays the same, so no
runtime/API migration is expected. Library updates follow in separate PRs (see Follow-ups).

## Findings

### Why: blocked dependency updates (Dependabot triage 2026-11-10)

| Package (PR)                                                                                   | Needs                            |
| ---------------------------------------------------------------------------------------------- | -------------------------------- |
| `webdriverio` 10, `eslint-plugin-wdio` 10 (#3290); `@wdio/*` 10 (#3291); even `@wdio/*` 9.33.x | `>=22.23.4 <23 \|\| >=24.22.1 …` |
| `expect-webdriverio` 8, `geckodriver` 8 (#3290)                                                | `>=22.19.0`                      |
| `lint-staged` 17 (#3291)                                                                       | `>=22.22.1`                      |

### Target version (checked 2026-11-16, `https://nodejs.org/dist/index.json`)

| Version  | Date       | LTS | Security release |
| -------- | ---------- | --- | ---------------- |
| v22.23.5 | 2026-11-11 | Jod | yes              |
| v22.23.4 | 2026-10-20 | Jod | yes              |
| v22.18.0 | 2025-07-31 | Jod | no (current pin) |

22.23.5 satisfies every range above. All 22.x releases share `NODE_MODULE_VERSION` 127, so native
addons built on 22.18 stay ABI-compatible (relevant for the cached `node_modules`, see #10).

### Every place Node is pinned or assumed

| #   | Location                                                                      | Today                                                                                                                                | Follows `.nvmrc` automatically?                                                                                                           |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `.nvmrc:1`                                                                    | `22.18.0`                                                                                                                            | — (source of truth)                                                                                                                       |
| 2   | `package.json:3-4` `engines.node`                                             | `"22.18.0"` (exact)                                                                                                                  | No. Yarn 1 enforces it: `yarn install` aborts on any other version, locally, in CI and in the E2E container                               |
| 3   | `.github/workflows/desktop-tests.yml:193-197` `unit-tests` → Set up Node.js   | `node-version-file: ".nvmrc"`                                                                                                        | Yes                                                                                                                                       |
| 4   | `.github/workflows/release.yml:404-408` deploy → Setup Node                   | `node-version-file: ".nvmrc"`                                                                                                        | Yes. **Dev/prod deploy builds switch Node on the first push to `main`**                                                                   |
| 5   | `.github/workflows/release.yml:127-130`                                       | `node-version: "22"` in a commented-out job                                                                                          | n/a (dead code), leave untouched                                                                                                          |
| 6   | `docker-e2e-tests/Dockerfile:6,28`                                            | `ARG NODE_VERSION=22.18` → `nvm install "${NODE_VERSION}"` (a partial version: nvm takes the newest 22.18.x **at image build time**) | **No.** Separate hard-coded version                                                                                                       |
| 7   | `desktop-tests.yml:109-174` `docker-for-e2e` → Pull Build Push Image          | Builds only when tag `<PR#>-merge` / `latest` is missing, or on `workflow_dispatch` with `docker_rebuild=true`                       | **No.** See "Docker image trap"                                                                                                           |
| 8   | `desktop-tests.yml:264-306` (`e2e-tests`) and `:411-434` (`e2e-mobile-tests`) | Recompute the same tag (`IMAGE_ID:VERSION`) and `docker pull`/`docker run` it                                                        | Must stay identical to #7                                                                                                                 |
| 9   | `docker-e2e-tests/docker-entrypoint.sh:21`                                    | Prints `NODE=$(node --version)`                                                                                                      | Yes. Handy proof in CI logs                                                                                                               |
| 10  | `desktop-tests.yml:310-316`, `:438-444` `actions/cache` for `**/node_modules` | Fixed keys `test-nfid-fe` / `test-nfid-fe-mobile`, not keyed on Node or lockfile                                                     | Restored modules come from 22.18; same ABI (127), and the container runs `yarn install` anyway, so harmless. Not changed here (Follow-up) |
| 11  | `docker-e2e-tests/README.md:44`                                               | Says `NODE_VERSION` default is `16`                                                                                                  | Stale doc                                                                                                                                 |
| 12  | `.claude/skills/dependabot-update/SKILL.md:22,64`                             | Literal `22.18.0`                                                                                                                    | No                                                                                                                                        |
| 13  | Developer machines + Husky `pre-commit` (`npx lint-staged`)                   | nvm reads `.nvmrc`                                                                                                                   | Each dev runs `nvm install` once; GUI git clients use whatever Node is on their PATH                                                      |

Historical mentions that are **not** changed: `.claude/plans/remove-legacy-dfinity-deps.plan.md:84`
and `.claude/plans/sdd-workflow.plan.md:208,355` (records of past state).

Checked and **not** affected:

- `package.json` is the only `package.json` with `engines`. There is no `.node-version`,
  `.tool-versions` or Volta config, and `.npmrc` / `.yarnrc` have no engine settings.
- `internet-identity-labs/ci_libs` (checked out by both workflows): only `CI_LIBS.sh` (logging
  helpers) is sourced. Its `dfx_install.sh` pins Node 18 but this repo doesn't use it.
- `@types/node` (26.x) doesn't depend on the runtime version. Out of scope.
- Installed packages (2026-11-10 scan of 2,566): none whose `engines.node` accepts 22.18.0 but
  rejects 22.23.x.
- Ubuntu 22.04 base image (glibc 2.35) meets Node 22's glibc ≥ 2.28.
- `yarn.lock` doesn't record engines, so it shouldn't change.

### Docker image trap (the one non-obvious part)

The E2E image tag comes only from the git ref, and a tag is rebuilt only when it is **missing** or on
a manual `docker_rebuild=true` dispatch (`desktop-tests.yml:139-147`). Desktop Tests runs on
`pull_request` and `workflow_dispatch` only (`desktop-tests.yml:6-8`). So every **already-open PR**
keeps its cached 22.18 image. Once the bump merges and that PR is updated from `main`, its container
runs `yarn install` on 22.18 against `engines: "22.23.5"`. **The install fails and E2E goes red**
until that PR's image is rebuilt.

**Engineer decision (2026-11-17): rebuild stale images by hand after merge; no workflow change.**

What "by hand" has to mean, from the tag logic (`desktop-tests.yml:119-133`, GNU sed on the runner):

| Run trigger                             | `github.head_ref` | Tag used                                     |
| --------------------------------------- | ----------------- | -------------------------------------------- |
| `pull_request` on PR #3301              | set               | `3301-merge` (from `refs/pull/3301/merge`)   |
| `workflow_dispatch` on branch `fix/foo` | empty             | `foo` (last path segment of the branch name) |
| `workflow_dispatch` on `main`           | empty             | `latest`                                     |

So **"Run workflow" with "Rebuild Docker image" on a PR's branch does not fix that PR**: it builds
and pushes a different tag (`foo`), and the PR's own runs keep pulling the stale `<PR#>-merge`. The
manual route that works: **delete the stale `nfid-test:<PR#>-merge` version** in GHCR
(github.com → org `internet-identity-labs` → Packages → `nfid-test` → versions). The PR's next run
finds the tag missing and builds a fresh one from the merged Dockerfile. This needs admin rights on
the package (or `gh` with `delete:packages` scope). The PR opened by this plan gets a new
`<PR#>-merge` tag, so it builds fresh with no action.

Open PRs on 2026-11-17: #3299, #3295, #3290, #3252 (#3295 and #3290 are Dependabot PRs, whose E2E
is skipped anyway because Dependabot runs get no secrets). Re-list at merge time.

### Can't be verified locally

- The CI image build for this PR, the `release.yml` deploy, and the GHCR tag list (local `gh` has no
  `read:packages` scope). Checked on the PR (Phase 4) and after merge (Phase 5).
- Unit tests that call live canisters need `LAMBDA_IDENTITY`. Compare by test name against a
  22.18.0 baseline on `main`, not by exit code.

## Modified / New Files

<!-- No apps/ or packages/ paths: the guard hook has nothing to allow-list here. -->

| File                                               | Phase | Change                                                                                                                                   |
| -------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `.nvmrc`                                           | 1     | `22.18.0` → `22.23.5`                                                                                                                    |
| `package.json`                                     | 1     | `engines.node` `"22.18.0"` → `"22.23.5"`                                                                                                 |
| `docker-e2e-tests/Dockerfile`                      | 2     | `ARG NODE_VERSION=22.18` → `ARG NODE_VERSION=22.23.5` (exact) + a comment that it must match `.nvmrc`; `nvm alias default` after install |
| `docker-e2e-tests/README.md`                       | 2     | `NODE_VERSION` line: default is the exact version in the Dockerfile, kept equal to `.nvmrc` (replaces "default: 16")                     |
| `README.md`                                        | docs  | Prerequisites: **NodeJS** `v22.10.0` (stale even before) → `v22.23.5`. Edited by the engineer (deviation, 2026-11-17)                    |
| `.claude/skills/dependabot-update/SKILL.md`        | 3     | Replace literal `22.18.0` (L22, L64) with "the version in `.nvmrc`"                                                                      |
| `.claude/plans/remove-legacy-dfinity-deps.plan.md` | docs  | `/document`: dated note at the end (COMPLETE plan says Node must be 22.18.0)                                                             |
| `.claude/plans/sdd-workflow.plan.md`               | docs  | `/document`: dated note at the end (pilot retargeted 22.23.4 → 22.23.5)                                                                  |

## E2E scope

- **None:** no user-visible behaviour changes, so no scenarios are added or edited. The whole
  existing suite (desktop + mobile) runs in CI on the PR inside the newly built image, and that run
  is this change's E2E check (Phase 4). `/implement-e2e` → `E2E N/A`.

## Implementation Checklist

### Phase 1 — Version pins

- [x] Before editing, on `main` with Node 22.18.0: record the baseline (`yarn lint`, the three `tsc`
      commands, unit tests the CI way, `yarn nx build nfid-wallet-client`), keeping failing test
      names.
- [x] `.nvmrc` → `22.23.5`.
- [x] `package.json` `engines.node` → `"22.23.5"`.
- [x] Phase check: `nvm install && nvm use` → `node -v` is `v22.23.5`;
      `yarn install --frozen-lockfile` succeeds; `git diff --exit-code yarn.lock`.
      Done 2026-11-17: `node -v` v22.23.5; frozen install OK; `yarn.lock` unchanged; on 22.18.0 yarn
      now fails with `Expected version "22.23.5". Got "22.18.0"`.
      Baseline (22.18.0, no `LAMBDA_IDENTITY`, as `/verify` will run): lint ✓, tsc app ✓, tsc spec ✓,
      tsc e2e ✗ (the 4 known strict-null errors in `apps/nfid-frontend-e2e/src/steps/swap-stake.ts`),
      build ✓, unit tests ✗ in 2 suites: `packages/integration/src/lib/lambda/passkey.spec.ts` and
      `apps/nfid-frontend/src/integration/identity-manager/index.spec.ts` (both need `LAMBDA_IDENTITY`).

### Phase 2 — E2E Docker image

- [x] `docker-e2e-tests/Dockerfile`: `ARG NODE_VERSION=22.23.5` with a comment above it
      (`# Must equal .nvmrc; bump both together`); keep `nvm install "${NODE_VERSION}"`, add
      `&& nvm alias default "${NODE_VERSION}"`.
- [x] `docker-e2e-tests/README.md`: rewrite the `NODE_VERSION` line.
- [x] No change to `.github/workflows/desktop-tests.yml` (Decision 3).
- [ ] Phase check (partial — Docker not available locally; image build deferred to the PR run, Phase 4): `docker build docker-e2e-tests -t nfid-test-local` →
      `docker run --rm --entrypoint bash nfid-test-local -lc '. $NVM_DIR/nvm.sh && node -v'` prints
      `v22.23.5`. If Docker isn't available locally, record that and rely on the PR run (Phase 4).
      Done 2026-11-17 without Docker: nvm (0.40.3 locally) resolves `22.23.5` exactly; the
      `node-v22.23.5-linux-x64.tar.xz` download returns HTTP 200; `docker-entrypoint.sh` sources
      `nvm.sh`, so the `default` alias is what the `NODE=` banner reports. Prettier clean on the
      README. Left unticked until the PR's Docker Image Build job runs.

### Phase 3 — Docs

- [x] `.claude/skills/dependabot-update/SKILL.md` L22 and L64: "the Node version in `.nvmrc`"
      instead of `22.18.0`.
- [x] Phase check: `grep -rnI "22\.18" . --exclude-dir=node_modules --exclude-dir=.git --exclude=yarn.lock`
      returns only the historical plan mentions listed in Findings. `yarn format:check` passes.
      Done 2026-11-17: remaining `22.18` matches are only historical plan text
      (`remove-legacy-dfinity-deps.plan.md:84`, this plan) and SVG path coordinates in
      `packages/ui/.../image.tsx`, `apps/nfid-frontend/.../image.tsx`, `add-passkey-success.svg`
      (false positives). `yarn format:check` fails on 90 files, **none changed by this plan, same 90
      on Node 22.18.0** → pre-existing on `main`, not fixed here (Follow-up). The changed files
      themselves pass Prettier.

### Phase 4 — Verification (local + PR)

- [ ] Local, on 22.23.5: lint, `tsc` ×3, unit tests the CI way, `yarn nx build nfid-wallet-client`.
      Same results as the Phase 1 baseline (compare failing test names).
- [ ] On the PR, Desktop Tests: **Docker Image Build** actually builds (log:
      `Image '…:<PR#>-merge' was not found`), and the E2E container banner prints
      `NODE=v22.23.5`.
- [ ] Unit Tests job "Versions" step shows `v22.23.5`.
- [ ] E2E desktop + mobile green, or the same failures as the latest `main` run.

### Phase 5 — Rollout (after merge)

- [ ] Announce in the team channel: run `nvm install` in the repo. On 22.18.0 yarn refuses
      **every** command (`yarn lint`, `yarn format`, …), not only `install`. GUI git-client users
      should check which Node the Husky hook (`npx lint-staged`) uses.
- [ ] For every open PR with E2E (re-list with `gh pr list --state open`): delete its
      `nfid-test:<PR#>-merge` version in GHCR, then tell the author to update from `main`. The next
      run rebuilds the image (log `was not found`, banner `NODE=v22.23.5`).
- [ ] Run Desktop Tests once via `workflow_dispatch` on `main` with "Rebuild Docker image" =
      `true`, so `nfid-test:latest` (cache + manual runs on `main`) is rebuilt on 22.23.5.
- [ ] Watch the first `release.yml` run on `main`: "Setup Node" shows 22.23.5 and the deploy
      succeeds.
- [ ] `/plan node-22-23-upgrade done`.

## Decisions

| Question                                             | Decision                                           | Why                                                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1. Target version                                    | **22.23.5** (engineer, 2026-11-16)                 | Newest 22.x (re-checked 2026-11-17), a security release from 2026-11-11; meets all blocked ranges                         |
| 2. `engines.node`: exact pin or range                | **Exact pin `"22.23.5"`** (engineer, 2026-11-17)   | Current convention; CI = local = container. Every future patch is a lockstep edit of `.nvmrc`, `package.json`, Dockerfile |
| 3. Docker image: content-hash tag or manual rebuild  | **Manual rebuild** (engineer, 2026-11-17)          | Smaller PR, no workflow change. Mechanism: delete stale `<PR#>-merge` tags in GHCR after merge (see Findings)             |
| 4. Also push plain `latest` when building on `main`? | **No** (engineer, 2026-11-17)                      | No workflow change; `latest` only serves as build cache and for manual runs on `main`                                     |
| 5. One PR or several                                 | **One PR, Node only** (engineer, 2026-11-16)       | Dependency updates go in separate PRs ("small focused PRs")                                                               |
| 6. Branch name                                       | **`chore/node-22-upgrade`** (engineer, 2026-11-16) | Doesn't encode the patch number                                                                                           |

## Risks

| Risk                                                                 | Mitigation                                                                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Open PRs' E2E fail on stale 22.18 images                             | Phase 5: delete their `<PR#>-merge` tags in GHCR. Note: a "Rebuild Docker image" dispatch on the branch does **not** fix it |
| Nobody with GHCR package admin rights is available after merge       | Ask for package access before merging; otherwise authors see a `yarn install` engine error in E2E until it's done           |
| Manual `workflow_dispatch` on `main` uses the stale `latest` (22.18) | Dispatch on `main` with "Rebuild Docker image" = `true` the first time after merge                                          |
| Dockerfile version drifts from `.nvmrc` on a future bump             | Comment in the Dockerfile; `/dependabot-update` skill points at `.nvmrc`; Follow-up below                                   |
| First deploy after merge runs on a Node version untested in prod     | Same major; `nx build` verified locally and in CI (Phase 4); watch the first `release.yml` run (Phase 5)                    |
| Devs blocked by the `yarn install` engine error                      | Announcement; the error message names the expected version                                                                  |
| Node 22.23.6+ ships before merge                                     | Re-check `nodejs.org/dist/index.json` in `/verify`; a patch bump is a one-line deviation in `.nvmrc` + `package.json`       |

## Follow-ups (not in this plan)

- Re-run `/dependabot-update` on #3290. `@wdio/*` 10 ended up in #3291's group and
  `expect-webdriverio@8` peers `@wdio/types@^10`, so the wdio 10 family (`webdriverio`, `@wdio/*`,
  `expect-webdriverio`, `eslint-plugin-wdio`, `geckodriver`) probably needs one manual PR.
- Investigate why Dependabot put `@wdio/*` in the `major` group despite the `e2e-tooling-major`
  pattern (`.github/dependabot.yml`).
- `lint-staged` 17: Dependabot re-proposes it once #3291 is closed or merged.
- `nx migrate 24` PR (removed executors + `composePlugins` in `apps/*/webpack.config.js`).
- Key the E2E `node_modules` cache on `.nvmrc` + `yarn.lock` (#10 in Findings).
- `/verify` and `/dependabot-update` run the `main` baseline with whatever Node is active. For a
  change that moves the Node pin, the two sides need different versions (`main` 22.18.0, branch
  22.23.5 here — done by hand with `nvm use` per run). Consider having `verify.sh run` do
  `nvm use` from the worktree's `.nvmrc`.
- `.claude/plans/sdd-workflow.plan.md` is still `PR OPEN` although #3297 is merged: run
  `/plan sdd-workflow done`.
- `yarn format:check` fails on 90 files on `main` (found 2026-11-17, independent of the Node version): a separate formatting PR.
- Revisit the content-hash image tag (rejected for now) if manual rebuilds become a recurring chore.
- Dependabot secrets (repo admin) so Dependabot PRs run tests.

## Verify findings

<!-- Written by /verify. /implement fixes open findings before any new phase. -->

### Run 2026-11-17 — 1 finding

Baseline: `origin/main` 3c5e03003 on Node 22.18.0; branch on Node 22.23.5; both without
`LAMBDA_IDENTITY`. `verify.sh compare`: every stage the same (install, tsc ×3, lint, build ✓; test ✗
on both), no new tsc/lint/build errors, no new failing test files, no new peer/engine warnings,
passing counts the same (integration 30 suites / 129 tests, nfid-wallet-client 47 / 164).
Code review (`/code-review low`) on the working-tree diff: no findings. Changed files = plan file
table exactly (+ this plan). Every workflow job that runs `yarn` gets Node from `.nvmrc`
(`desktop-tests.yml` unit-tests, `release.yml` build-frontend) or from the E2E image; the
`actions/setup-node` manifest already has `22.23.5`.

- [x] F1 minor — **accepted by engineer (2026-11-17)** — Findings #10 and its Follow-up cover only the E2E `node_modules` caches; the deploy
      job has the same fixed-key cache — `.github/workflows/release.yml:414-422` (`key: nfid-fe-yarn`,
      restores `**/node_modules` + yarn cache, never re-saved under a fixed key). Harmless for this
      change (same ABI 127, `yarn --frozen-lockfile` runs after the restore) — add it to Findings #10 and
      the Follow-up so the cache-key work covers all three caches.

Not verifiable locally: Docker image build and the `NODE=v22.23.5` banner (no Docker on this machine →
Phase 2 phase check and Phase 4 PR boxes, on the PR's Desktop Tests run); full E2E desktop + mobile
(CI); live-canister suites `packages/integration/src/lib/lambda/passkey.spec.ts` and
`apps/nfid-frontend/src/integration/identity-manager/index.spec.ts` (`LAMBDA_IDENTITY` unset; fail the
same way on `main`); the `release.yml` deploy (Phase 5).
Flaky (re-run passed, 27/27): `apps/nfid-frontend/src/integration/address-book/address-book.facade.spec.ts`
— live dev address-book canister, a different test failed on each side (`DuplicateName` on `main`,
`AddressNotFound` on the branch); the two suites ran in parallel against the same test account.
Environmental (also fails on main): the two `LAMBDA_IDENTITY` suites above. `yarn format:check`: 90
files on `main` (Phase 3 note).

## Docs sync

<!-- Written by /document. -->

### 2026-11-17

Search terms: `22.18`, `22.18.0`, `22.23.4`, `22.23.5`, `.nvmrc`, `engines` / `engines.node`,
`NODE_VERSION`, `docker-e2e-tests`, `Dockerfile`, `nvm use` / `nvm install`, `node -v`, `setup-node`,
`node-version-file`, `nfid-test`, `docker_rebuild`.

Updated:

- `.claude/plans/remove-legacy-dfinity-deps.plan.md` — COMPLETE plan states "Node must be 22.18.0";
  dated note added, history untouched.
- `.claude/plans/sdd-workflow.plan.md` — names this pilot as "Node 22.23.4"; dated note added.
- This plan — file table (+2 doc rows), Phase 5 (yarn refuses every command on 22.18.0; rebuild
  `latest` via dispatch on `main`, which was only in Risks), Deviations, Follow-ups.

Reviewed, no change needed:

- `CLAUDE.md` ("Node from .nvmrc"), `.claude/rules/*`, `.claude/sdd/workflow.md` — no version pinned.
- `.claude/skills/dependabot-update/SKILL.md` — updated in Phase 3; L32 (`node -v` must match
  `.nvmrc`) and L150 still correct.
- `.claude/skills/verify/**`, `.claude/skills/plan/**` — generic `engines` wording only.
- `.github/workflows/desktop-tests.yml`, `.github/workflows/release.yml` — read Node from `.nvmrc`;
  no `.github/` docs or templates mention Node.
- `.claude/specs/**` — no matches.

READMEs reviewed:

- `docker-e2e-tests/README.md` — current (updated in Phase 2).
- Root `README.md` — **missed by /document**: Prerequisites listed **NodeJS** `v22.10.0`. Fixed by the
  engineer to `v22.23.5` (see Deviations).
- `apps/*/README.md`, `packages/*/README.md` — no Node version, `.nvmrc` or nvm instructions; current
  (re-checked for `NodeJS`/`Node.js`/`v22`).

## Deviations

<!-- Anything that differs from the approved plan. An out-of-plan file sets Status back to DRAFT. -->

- 2026-11-17 — Phase 2 phase check (local `docker build` + `node -v` in the image) not run: Docker is
  not available on the engineer's machine. Replaced by static checks (recorded in Phase 2) and
  deferred to the PR's Docker Image Build / E2E banner (Phase 4). No file change.
- 2026-11-17 — Root `README.md` was stale (Prerequisites said **NodeJS** `v22.10.0`) and missing from
  the plan; `/plan` and `/document` searched only for `22.18`/`22.23`. The engineer fixed it by hand
  and approved committing it with this PR. Lesson: also grep for `NodeJS`/`Node.js`/`node v` lines.
- 2026-11-17 — `/document` added dated notes to two older plans (rows "docs" in the file table). No
  code or config file outside the approved table changed.
