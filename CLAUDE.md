# NFID Frontend — Claude Code Constitution

## Architecture Map

```
nfid-wallet-client/              ← Nx monorepo (yarn 1.22 / Node from .nvmrc)
├── apps/
│   ├── nfid-frontend/src/       ← the wallet app (Nx project `nfid-wallet-client`)
│   │   ├── apps/                ← Sub-apps (auth, identity-manager, embed, marketing)
│   │   ├── features/            ← Feature modules (transfer-modal, wallet, staking…) + XState machines
│   │   ├── integration/         ← Service/API layer (ethereum, bitcoin, ICP canisters)
│   │   ├── hooks/               ← Shared React hooks
│   │   ├── contexts/            ← React context providers
│   │   ├── state/               ← Global auth state (authentication, authorization)
│   │   ├── types/               ← Global TypeScript types
│   │   └── App.tsx / provider.tsx
│   ├── nfid-demo/               ← Demo dapp, built and served for the E2E suite
│   └── nfid-frontend-e2e/       ← WebDriverIO + Cucumber E2E suite
└── packages/
    ├── ui/src/{atoms,molecules,organisms,pages,templates}  ← Design system (Radix + Tailwind)
    ├── ui-tailwind-core/        ← Custom Tailwind plugin
    ├── integration/             ← Shared integration package
    ├── swr/                     ← SWR data-fetching wrapper
    ├── client-db/               ← IndexedDB wrapper
    ├── config/ constants/ utils/
```

**State:** XState 5 machines (`features/**/*machine.ts`) + Jotai atoms
**Routing:** React Router DOM 7 — `BrowserRouter` → lazy-loaded `<Route>` tree in `App.tsx`
**Styling:** Tailwind CSS 4 utility-first; no CSS Modules, no styled-components
**Data:** SWR via `@nfid/swr` wrapper; Ethereum via ethers 6; ICP via `@icp-sdk/*`

---

## Verification Commands

Nx project names differ from folder names: `apps/nfid-frontend` is **`nfid-wallet-client`**;
the others are `nfid-demo`, `nfid-frontend-e2e`, `ui`, `integration`, `client-db`, `swr`, `utils`,
`config` and `ui-tailwind-core`.

| Purpose               | Command                                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev server            | `yarn nx serve nfid-wallet-client` (port 9090)                                                                                                                                                       |
| Production build      | `yarn nx build nfid-wallet-client`                                                                                                                                                                   |
| TypeScript check      | `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json` and `-p apps/nfid-frontend/tsconfig.spec.json`                                                                                            |
| TypeScript check, E2E | `npx tsc --noEmit -p apps/nfid-frontend-e2e/tsconfig.json`                                                                                                                                           |
| Lint (all)            | `yarn lint` → `yarn nx run-many --target=lint --all`                                                                                                                                                 |
| Lint (single project) | `yarn nx lint nfid-wallet-client`                                                                                                                                                                    |
| Format check          | `yarn format:check`                                                                                                                                                                                  |
| Format fix            | `yarn format`                                                                                                                                                                                        |
| Unit tests            | `yarn nx test nfid-wallet-client` (as CI: `npx env-cmd -f .env.test nx run-many -t test --runInBand`, needs `LAMBDA_IDENTITY`)                                                                       |
| Unit tests (one file) | `yarn nx test nfid-wallet-client --testPathPatterns=<file>` (Jest 30: `--testPathPatterns`, plural)                                                                                                  |
| Unit tests (watch)    | `yarn nx test nfid-wallet-client --watch`                                                                                                                                                            |
| Storybook             | `yarn nx storybook nfid-wallet-client` or `yarn nx storybook ui` (port 4400)                                                                                                                         |
| E2E tests             | `yarn test:e2e:frontend`                                                                                                                                                                             |
| E2E tests (one area)  | `.claude/skills/verify/scripts/e2e-local.sh '@sendft' <outdir>`. Passing raw `--cucumberOpts.tags` replaces the default `not @pending and not @mobile and not @skip` filter; the script adds it back |

There is no `typecheck` Nx target. `packages/*/tsconfig.lib.json` can't be type-checked on its own
(hundreds of pre-existing TS6307 errors); lint and build cover those packages.

---

## Frontend Code Etiquette

TypeScript, components, state, styling, a11y and import order rules are in
`.claude/rules/frontend.md`. It's a path-scoped rule that loads automatically when a file under
`apps/` or `packages/` is read or edited.

---

## SDD Workflow (spec-driven development)

> **No file under `apps/` or `packages/` may be created or modified without an approved spec and an
> approved plan that lists the file's exact path.** Feature work (anything under `apps/` or
> `packages/`) needs both; tooling work (root config, `.github/`, `docker-*`, `.claude/`, lockfile)
> needs only the plan.

The engineer runs one command at a time; each checks the plan's `> Status:` and names the next:

```
/spec → /plan → /implement → /implement-e2e → /verify → /document → /pr      (/plan alone: status of all plans)
```

- **No commits before `/pr`**, and no destructive git. Claude Code prompts the engineer for
  `git commit`, `git push` and the `gh pr` write commands (`permissions.ask` in
  `.claude/settings.json`; exact list in `.claude/sdd/workflow.md`).
- **`/verify` only reports findings**; `/implement` fixes them. A file outside the plan → record a
  deviation, set `DRAFT`, get it re-approved.
- Hooks in `.claude/hooks/` guard against accidental changes (not a security boundary): edits under
  `apps/`/`packages/` must be in an active plan, risky shell commands ask first, and unplanned shell
  changes are reported afterwards.

Full rules, statuses and hook details: `.claude/sdd/workflow.md`. The older UI-only flow
(`/ui-brainstorming` → `/ui-planning` → `/execute-ui-plan`) is still supported.
