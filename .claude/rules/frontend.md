---
paths:
  - "apps/**/*"
  - "packages/**/*"
---

# Frontend Code Etiquette

Loaded only when Claude reads or edits a file under `apps/` or `packages/` (path-scoped rule), so
tooling work doesn't carry it.

## TypeScript

- **No `any`** — ESLint enforces `@typescript-eslint/no-explicit-any: warn`; treat as error in new code
- Prefer `unknown` + type narrowing over `any`; use `as` casts only at integration/API boundaries
- All props, hook return types, and service interfaces must be explicitly typed

## Component Rules

- Functional components only — no class components
- Co-locate component, test, and stories in the same directory
- Use Radix UI primitives from `packages/ui/` before reaching for `@radix-ui/*` directly
- Atomic design hierarchy: atoms → molecules → organisms; never import child atoms directly in pages
- Error boundaries required on all lazy-loaded route segments and async feature boundaries

## State Management

- XState machines for multi-step flows with side effects (auth, transfer, wallet-connect)
- Jotai atoms for lightweight global UI state only (no derived business logic in atoms)
- No prop drilling beyond 2 levels — lift to context or atom

## Styling

- Tailwind utility classes only — no inline `style={{}}` except dynamic numeric values
- Dark mode via `dark:` Tailwind variant (class-based, `darkMode: "class"`)
- Responsive breakpoints must follow Tailwind defaults (`sm` / `md` / `lg` / `xl`)
- Custom design tokens live in `packages/ui-tailwind-core/` — never hardcode colors/spacing

## Accessibility (a11y)

- All interactive elements need `aria-label` or visible text
- Keyboard navigation required for all modals, dropdowns, and dialogs (Radix handles this)
- Color contrast must meet WCAG AA minimum

## Unit tests

- New unit tests mock canister and network calls; never hit live dev canisters (details in the
  `/write-unit-tests` skill, `.claude/skills/write-unit-tests/SKILL.md`)

## Import Order (enforced by Prettier)

`third-party → @nfid* → frontend/* → components/* → ./local`
