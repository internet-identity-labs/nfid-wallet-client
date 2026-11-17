# Plan: Upgrade Node 22.18.0 → 22.23.4

> Status: DRAFT — awaiting engineer approval. Nothing implemented yet.
> Spec: none — no file under `apps/` or `packages/` changes (tooling/CI only, see SDD directive)
> Created: 2026-11-10
> Branch (proposed): `chore/node-22.23.4`

## Why

Dependabot triage on 2026-11-10 found these bumps blocked only by `engines.node` on 22.18.0:

| Package (PR)                                                                                   | Needs                            |
| ---------------------------------------------------------------------------------------------- | -------------------------------- |
| `webdriverio` 10, `eslint-plugin-wdio` 10 (#3290); `@wdio/*` 10 (#3291); even `@wdio/*` 9.33.x | `>=22.23.4 <23 \|\| >=24.22.1 …` |
| `expect-webdriverio` 8, `geckodriver` 8 (#3290)                                                | `>=22.19.0`                      |
| `lint-staged` 17 (#3291)                                                                       | `>=22.22.1`                      |

Target **22.23.4** — latest 22.x (LTS "Jod"), released 2026-10-20, a security release. Stays on the
same major, so no runtime/API migration is expected.

## Findings — every place Node is pinned or assumed

| #   | Location                                                                | Today                                                                                   | Picks up `.nvmrc` automatically?                                                                                |
| --- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | `.nvmrc`                                                                | `22.18.0`                                                                               | — (source of truth)                                                                                             |
| 2   | `package.json` → `engines.node`                                         | `"22.18.0"` (exact)                                                                     | No. Yarn 1 enforces it: `yarn install` aborts on any other version, locally, in CI and inside the E2E container |
| 3   | `.github/workflows/desktop-tests.yml` → `unit-tests` job `setup-node`   | `node-version-file: ".nvmrc"`                                                           | Yes                                                                                                             |
| 4   | `.github/workflows/release.yml` → deploy job `setup-node` (L405)        | `node-version-file: ".nvmrc"`                                                           | Yes — **production/dev deploy builds switch Node on the first push to `main`**                                  |
| 5   | `.github/workflows/release.yml` L127–130 (commented-out job)            | `node-version: "22"`                                                                    | n/a (dead code) — leave untouched                                                                               |
| 6   | `docker-e2e-tests/Dockerfile`                                           | `ARG NODE_VERSION=22.18` → `nvm install`                                                | **No** — separate hard-coded version                                                                            |
| 7   | `desktop-tests.yml` → `docker-for-e2e` job (image build)                | Builds only if tag `<PR#>-merge` / `latest` is missing, or manual `docker_rebuild=true` | **No — see "Docker image trap"**                                                                                |
| 8   | `desktop-tests.yml` → 2 E2E run jobs (`pull_image` steps, L264+, L412+) | Recompute the same tag and `docker pull` it                                             | Must stay in sync with #7                                                                                       |
| 9   | `docker-e2e-tests/README.md` L44                                        | Says default NODE_VERSION is `16`                                                       | Stale doc                                                                                                       |
| 10  | `.claude/skills/dependabot-update/SKILL.md` L22, L64                    | Mentions `22.18.0`                                                                      | No (docs for the triage command)                                                                                |
| 11  | Developer machines + Husky `pre-commit` (`npx lint-staged`)             | nvm reads `.nvmrc`                                                                      | Each dev runs `nvm install` once; GUI git clients use whatever Node is on their PATH                            |

Checked and **not** affected:

- No other `engines`, `.node-version`, `.tool-versions`, Volta config, Netlify/Vercel config, or Node
  pin in workspace `package.json`s. `.npmrc` / `.yarnrc` have no engine settings.
- `internet-identity-labs/ci_libs` (checked out by both workflows): only `CI_LIBS.sh` (logging
  helpers) is sourced. Its `dfx_install.sh` pins Node 18 but is not used by this repo.
- `@types/node` (26.x) is independent of the runtime version — out of scope.
- All 2,566 installed packages: none whose `engines.node` accepts 22.18.0 but rejects 22.23.4.
- Ubuntu 22.04 base image (glibc 2.35) satisfies Node 22's glibc ≥ 2.28.

### Docker image trap (the one non-obvious part)

The E2E image tag is derived only from the git ref (`<PR#>-merge`, branch name, or `latest` for
`main`). A tag is rebuilt only when it is **missing** or on manual dispatch with `docker_rebuild=true`.

- Desktop Tests runs on `pull_request` and `workflow_dispatch` only — never on push to `main`.
- So every **already-open PR** keeps its cached 22.18 image. After the bump merges and that PR is
  updated from `main`, its container runs `yarn install --frozen-lockfile` on Node 22.18 against
  `engines: "22.23.4"` → **install fails, E2E red**, until someone force-rebuilds that PR's image.
- Changing only the `ARG` default is therefore not enough on its own.

Fix: make the image tag content-addressed, so any change to the Dockerfile or `.nvmrc` produces
a new tag and a fresh build everywhere automatically. Also feed `NODE_VERSION` from `.nvmrc`, so
there is one source of truth.

## Modified Files

| File                                        | Change                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `.nvmrc`                                    | `22.18.0` → `22.23.4`                                                                                                             |
| `package.json`                              | `engines.node` `"22.18.0"` → `"22.23.4"` (keep exact-pin convention, see Decisions)                                               |
| `docker-e2e-tests/Dockerfile`               | `ARG NODE_VERSION` without default + fail fast if empty; `nvm install` the exact version, `nvm alias default`                     |
| `.github/workflows/desktop-tests.yml`       | Image build passes `--build-arg NODE_VERSION=$(cat .nvmrc)`; image tag gets a content-hash suffix in all 3 places that compute it |
| `docker-e2e-tests/README.md`                | Document `NODE_VERSION` as required, sourced from `.nvmrc`                                                                        |
| `.claude/skills/dependabot-update/SKILL.md` | Replace hard-coded `22.18.0` with "the version in `.nvmrc`"                                                                       |

`yarn.lock` does not change (engines are not recorded there). No file under `apps/` or `packages/`.

## Implementation Checklist

### Phase 1 — Version pins

- [ ] `.nvmrc` → `22.23.4`.
- [ ] Root `package.json` `engines.node` → `"22.23.4"`.
- [ ] Locally: `nvm install 22.23.4 && nvm use`, then `yarn install --frozen-lockfile` succeeds
      and `yarn.lock` is unchanged (`git diff --exit-code yarn.lock`).

### Phase 2 — E2E Docker image

- [ ] `docker-e2e-tests/Dockerfile`: `ARG NODE_VERSION` (no default) plus
      `RUN test -n "${NODE_VERSION}" || (echo "NODE_VERSION build-arg is required" && exit 1)`;
      keep `nvm install "${NODE_VERSION}"`, add `&& nvm alias default "${NODE_VERSION}"`.
- [ ] `desktop-tests.yml` `docker-for-e2e` → `docker build … --build-arg NODE_VERSION=$(cat ../.nvmrc)`
      (the step `pushd`s into `docker-e2e-tests`).
- [ ] `desktop-tests.yml`, all three tag computations (image build L110+, E2E desktop L264+,
      E2E second run job L412+): after `VERSION` is resolved, append
      `IMAGE_HASH='${{ hashFiles('docker-e2e-tests/**', '.nvmrc') }}'; VERSION="${VERSION}-${IMAGE_HASH:0:12}"`.
      The logic must be identical in all three places, or the run jobs pull a tag that was never pushed.
- [ ] Keep `--cache-from ${IMAGE_ID}:latest` as-is (a cache miss is harmless). Optionally also push
      plain `latest` when building on `main`, so the cache stays warm.
- [ ] `docker-e2e-tests/README.md`: fix the `NODE_VERSION` line.
- [ ] Local smoke test: `docker build --build-arg NODE_VERSION=$(cat .nvmrc) docker-e2e-tests`, then
      `docker run --rm <img> bash -lc 'node -v'` prints `v22.23.4`. Building without the arg must fail
      with the message above.

### Phase 3 — Docs

- [ ] `.claude/skills/dependabot-update/SKILL.md`: L22 and L64 refer to "the Node version in `.nvmrc`"
      instead of the literal `22.18.0`.

### Phase 4 — Verification (PR)

- [ ] Local suite per `/dependabot-update` step 4 (install, tsc ×3, lint, test, build) on 22.23.4 vs
      the 22.18.0 baseline: same results expected.
- [ ] Open the PR. Desktop Tests must show the **Docker Image Build** job actually building (log:
      `Image '…:<PR#>-merge-<hash>' was not found`), and the container banner printing `NODE=v22.23.4`.
- [ ] Unit Tests job "Versions" step shows `v22.23.4`.
- [ ] E2E desktop + mobile green (or the same failures as the latest `main` run).

### Phase 5 — Rollout (after merge)

- [ ] Announce in the team channel: run `nvm install` in the repo (`yarn install` fails on 22.18.0).
      GUI git-client users should check which Node the Husky hook uses.
- [ ] Watch the first `release.yml` deploy run on `main`: its "Setup Node" should show 22.23.4,
      and the deploy should succeed.
- [ ] No manual image rebuild needed thanks to the hash tag. Without Phase 2, every open PR plus
      `main` would need `workflow_dispatch` with `docker_rebuild=true`.

### Phase 6 — Unblocked dependency work (separate PRs, per "small focused PRs")

- [ ] Re-run `/dependabot-update` on #3290. Note: `@wdio/*` 10 was grouped into #3291, not #3290, and
      `expect-webdriverio@8` has peer `@wdio/types@^10`. #3290 alone will most likely still fail
      (family split), so the wdio 10 family probably needs one manual PR moving `webdriverio`,
      `@wdio/*`, `expect-webdriverio`, `eslint-plugin-wdio` and `geckodriver` together.
- [ ] Investigate why Dependabot placed `@wdio/*` in the `major` group despite the
      `e2e-tooling-major` pattern (`.github/dependabot.yml`).
- [ ] `lint-staged` 17: Dependabot re-proposes it once #3291 merges (#3291 has a human commit, so it
      will not be rebased).

## Decisions for the engineer

1. **`engines.node` exact pin vs range.** Recommended: keep the exact pin `"22.23.4"` (current
   convention; guarantees CI = local = container). Alternative: `">=22.23.4 <23"`. That avoids a
   lockstep edit for every future patch release, but lets local and CI drift.
2. **Content-hash image tag (Phase 2) vs a one-off manual rebuild.** Recommended: hash tag. It also
   fixes the same trap for future Chrome/Dockerfile changes. Cost: more GHCR tags. `ci_libs`'
   `package_cleanup` already prunes old container versions — confirm its retention covers `nfid-test`.
3. **One PR or two?** Recommended: one PR for Phases 1–3 (the pin and the image must move together,
   or E2E breaks), separate PRs for Phase 6.

## Risks

| Risk                                                           | Mitigation                                                                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Open PRs' E2E fail on stale images                             | Phase 2 hash tag                                                                                           |
| First deploy after merge runs on the new Node untested in prod | Same major, patch/minor-level; the deploy build is verified in Phase 4 via `nx build`; watch the first run |
| Devs blocked by `yarn install` engine error                    | Announcement; the error message names the expected version                                                 |
| Dependabot PRs still never run tests (no secrets)              | Unrelated, known — needs repo admin to add Dependabot secrets                                              |
