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

| Purpose               | Command                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Dev server            | `yarn nx serve nfid-frontend` (port 9090)                                                   |
| Production build      | `yarn nx build nfid-frontend`                                                               |
| TypeScript check      | `yarn nx run nfid-frontend:typecheck` or `tsc --noEmit -p apps/nfid-frontend/tsconfig.json` |
| Lint (all)            | `yarn lint` → `yarn nx run-many --target=lint --all`                                        |
| Lint (single project) | `yarn nx lint nfid-frontend`                                                                |
| Format check          | `yarn format:check`                                                                         |
| Format fix            | `yarn format`                                                                               |
| Unit tests            | `yarn nx test nfid-frontend`                                                                |
| Unit tests (watch)    | `yarn nx test nfid-frontend --watch`                                                        |
| Storybook             | `yarn nx storybook nfid-frontend` (port 4400)                                               |
| E2E tests             | `yarn test:e2e:frontend`                                                                    |

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

## SDD Enforcement Directive

> **NO file under `apps/` or `packages/` may be created or modified without:**
>
> 1. An approved spec at `.claude/specs/[feature-name].spec.md`
> 2. An active plan at `.claude/plans/[feature-name].plan.md` with an unchecked task checkbox

**Workflow:**

```
/ui-brainstorming  →  .claude/specs/[feature].spec.md   (human-approved)
        ↓
/ui-planning       →  .claude/plans/[feature].plan.md   (human-approved)
        ↓
/execute-ui-plan   →  one checkbox at a time → lint → test → next checkbox
```

Specs and plans must be explicitly approved by the engineer before execution begins.
Any deviation from a plan requires updating the plan file and re-approval.
