# NFID Frontend — Claude Code Constitution

## Architecture Map

```
nfid-frontend/                   ← Nx monorepo (yarn 1.22 / Node 22)
├── apps/
│   ├── nfid-frontend/src/
│   │   ├── apps/                ← Sub-apps (auth, identity-manager, embed, marketing)
│   │   ├── features/            ← Feature modules (transfer-modal, wallet, staking…)
│   │   ├── integration/         ← Service/API layer (ethereum, bitcoin, ICP canisters)
│   │   ├── hooks/               ← Shared React hooks
│   │   ├── contexts/            ← React context providers
│   │   ├── state/               ← Jotai atoms + XState machine definitions
│   │   ├── types/               ← Global TypeScript types
│   │   └── App.tsx / provider.tsx
│   ├── nfid-wallet/             ← Wallet-specific app
│   └── nfid-frontend-e2e/       ← WebDriverIO + Cucumber E2E suite
└── packages/
    ├── ui/src/{atoms,molecules,organisms,pages,templates}  ← Design system (Radix + Tailwind)
    ├── ui-tailwind-core/        ← Custom Tailwind plugin
    ├── integration/             ← Shared integration package
    ├── integration-ethereum/    ← Ethereum integration
    ├── swr/                     ← SWR data-fetching wrapper
    ├── client-db/               ← IndexedDB wrapper
    ├── config/ constants/ utils/
```

**State:** XState 4 machines (`features/**/*machine.ts`) + Jotai atoms (`state/`)
**Routing:** React Router DOM 7 — `BrowserRouter` → lazy-loaded `<Route>` tree in `App.tsx`
**Styling:** Tailwind CSS 3 utility-first; no CSS Modules, no styled-components
**Data:** SWR via `@nfid/swr` wrapper; Ethereum via ethers 6; ICP via `@icp-sdk/*`

---

## Verification Commands

Nx project names differ from folder names: `apps/nfid-frontend` is **`nfid-wallet-client`**;
the others are `nfid-demo`, `nfid-frontend-e2e`, `ui`, `integration`, `client-db`, `swr`, `utils`,
`config` and `ui-tailwind-core`.

| Purpose               | Command                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev server            | `yarn nx serve nfid-wallet-client` (port 9090)                                                                                                                                         |
| Production build      | `yarn nx build nfid-wallet-client`                                                                                                                                                     |
| TypeScript check      | `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json` and `-p apps/nfid-frontend/tsconfig.spec.json`                                                                              |
| TypeScript check, E2E | `npx tsc --noEmit -p apps/nfid-frontend-e2e/tsconfig.json`                                                                                                                             |
| Lint (all)            | `yarn lint` → `yarn nx run-many --target=lint --all`                                                                                                                                   |
| Lint (single project) | `yarn nx lint nfid-wallet-client`                                                                                                                                                      |
| Format check          | `yarn format:check`                                                                                                                                                                    |
| Format fix            | `yarn format`                                                                                                                                                                          |
| Unit tests            | `yarn nx test nfid-wallet-client` (as CI: `npx env-cmd -f .env.test nx run-many -t test --runInBand`, needs `LAMBDA_IDENTITY`)                                                         |
| Unit tests (one file) | `yarn nx test nfid-wallet-client --testPathPatterns=<file>` (Jest 30: `--testPathPatterns`, plural)                                                                                    |
| Unit tests (watch)    | `yarn nx test nfid-wallet-client --watch`                                                                                                                                              |
| Storybook             | `yarn nx storybook nfid-wallet-client` or `yarn nx storybook ui` (port 4400)                                                                                                           |
| E2E tests             | `yarn test:e2e:frontend`                                                                                                                                                               |
| E2E tests (one area)  | `.claude/scripts/e2e-local.sh '@sendft' <outdir>`. Passing raw `--cucumberOpts.tags` replaces the default `not @pending and not @mobile and not @skip` filter; the script adds it back |

There is no `typecheck` Nx target. `packages/*/tsconfig.lib.json` can't be type-checked on its own
(hundreds of pre-existing TS6307 errors); lint and build cover those packages.

---

## Frontend Code Etiquette

### TypeScript

- **No `any`** — ESLint enforces `@typescript-eslint/no-explicit-any: warn`; treat as error in new code
- Prefer `unknown` + type narrowing over `any`; use `as` casts only at integration/API boundaries
- All props, hook return types, and service interfaces must be explicitly typed

### Component Rules

- Functional components only — no class components
- Co-locate component, test, and stories in the same directory
- Use Radix UI primitives from `packages/ui/` before reaching for `@radix-ui/*` directly
- Atomic design hierarchy: atoms → molecules → organisms; never import child atoms directly in pages
- Error boundaries required on all lazy-loaded route segments and async feature boundaries

### State Management

- XState machines for multi-step flows with side effects (auth, transfer, wallet-connect)
- Jotai atoms for lightweight global UI state only (no derived business logic in atoms)
- No prop drilling beyond 2 levels — lift to context or atom

### Styling

- Tailwind utility classes only — no inline `style={{}}` except dynamic numeric values
- Dark mode via `dark:` Tailwind variant (class-based, `darkMode: "class"`)
- Responsive breakpoints must follow Tailwind defaults (`sm` / `md` / `lg` / `xl`)
- Custom design tokens live in `packages/ui-tailwind-core/` — never hardcode colors/spacing

### Accessibility (a11y)

- All interactive elements need `aria-label` or visible text
- Keyboard navigation required for all modals, dropdowns, and dialogs (Radix handles this)
- Color contrast must meet WCAG AA minimum

### Import Order (enforced by Prettier)

`third-party → @nfid* → frontend/* → components/* → ./local`

---

## SDD Workflow (spec-driven development)

> **No file under `apps/` or `packages/` may be created or modified without an approved spec
> and an approved plan that lists the file.** Two hooks enforce the plan half:
>
> - `.claude/hooks/pre-tool-use.js` allows an Edit/Write only if a plan on the file's checkout branch
>   is in an editing status and the first column of its file table lists the file's **exact path**
>   (no folders or globs). `_ic_api/` is always blocked.
> - `.claude/hooks/pre-bash.js` asks the engineer before shell commands that look like they write
>   under `apps/` or `packages/` (including after a `cd` into them), or rewrite the working tree.
> - `.claude/hooks/post-bash.js` is the backstop: after every shell command it reports any changed
>   `apps/`/`packages/` file that no plan on this branch lists (any status but `DONE`/`COMPLETE`),
>   whatever the command looked like.
>
> `/plan` and `/implement` enforce the approved spec. The hooks prevent accidental changes; they are
> not a security boundary. Approval is always the engineer's "approved".

### Tiers

| Tier    | When                                                           | Needs                                                  |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| Feature | Any change under `apps/` or `packages/`                        | Approved spec **and** approved plan                    |
| Tooling | Only root config, `.github/`, `docker-*`, `.claude/`, lockfile | Approved plan (header `Spec: none — tooling tier (…)`) |

### Pipeline

The engineer runs one command at a time. Each command checks the plan's `> Status:` line, refuses if
it's out of order, and ends by naming the next command.

```
/spec <name>           → .claude/specs/<name>.spec.md          DRAFT → "approved" → APPROVED
/plan <name> [sc-XXXX] → .claude/plans/<name>.plan.md          DRAFT → "approved" → APPROVED
/implement <name>      → code + unit tests, one phase per call  → IN PROGRESS … IMPLEMENTED
/implement-e2e <name>  → E2E scenarios per the plan's E2E scope → E2E READY / E2E N/A
/verify <name>         → findings only (checks vs main, local E2E, review) → VERIFIED or back to IN PROGRESS
/document <name>       → docs sync: plans, specs, docs, context, memory   → DOCUMENTED
/pr <name>             → the commit, push, PR                             → PR OPEN
/plan                  → status of all plans  ·  /plan <name> done → DONE after merge
```

Rules (full text in `.claude/templates/workflow.md`):

- **No commits before `/pr`**, and no destructive git (`reset --hard`, `stash`, `checkout --`, `clean`).
- **`/verify` never edits code.** It writes findings into the plan; `/implement` fixes them.
- **Deviations:** a file outside the plan → record it under `## Deviations`, set `DRAFT`, re-approve.
  No exceptions, READMEs included.
- **READMEs** are updated by `/implement` together with the code they describe; `/plan` lists them
  and `/document` only reviews them (a stale one is a finding).
- New unit tests **mock canister and network calls**.
- Templates: `.claude/templates/{plan,spec}.md`. Scripts: `.claude/scripts/verify.sh` (checks vs a
  `main` baseline), `.claude/scripts/e2e-local.sh` (E2E by tag).

The older UI-only flow, `/ui-brainstorming` → `/ui-planning` → `/execute-ui-plan`, is still supported.
