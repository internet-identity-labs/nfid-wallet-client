# Spec: Major Dependency Updates

> Status: APPROVED
> Created: 2026-09-07

## Overview

Routine maintenance upgrade of all dependencies that have crossed a major version boundary. Each group ships as its own PR. `@icp-sdk/*` packages are excluded. Minor and patch bumps in the original list are out of scope.

## Scope

- App/area: Entire monorepo (`apps/`, `packages/`)
- Entry point: N/A — dependency-only changes
- Exit state: All grouped PRs merged, CI green, no runtime regressions

---

## Update Groups & PRs

Updates are ordered by dependency-graph depth: build tooling → type system → linting → styling → state → framework.

### Group 1 — Nx 23 (build system)

| Package           | From   | To     |
| ----------------- | ------ | ------ |
| nx                | 22.7.2 | 23.1.2 |
| @nx/eslint        | 22.7.2 | 23.1.2 |
| @nx/eslint-plugin | 22.7.2 | 23.1.2 |
| @nx/jest          | 22.7.2 | 23.1.2 |
| @nx/js            | 22.7.2 | 23.1.2 |
| @nx/react         | 22.7.2 | 23.1.2 |
| @nx/storybook     | 22.7.2 | 23.1.2 |
| @nx/webpack       | 22.7.2 | 23.1.2 |

**Known breaking changes:**

- Executor/generator API changes — run `nx migrate` to auto-apply workspace config patches.
- `nx.json` schema may have fields renamed or removed.

**Verification:** `yarn nx run-many --target=build --all` passes.

---

### Group 2 — Babel 8

| Package                           | From   | To    |
| --------------------------------- | ------ | ----- |
| @babel/core                       | 7.29.6 | 8.0.1 |
| @babel/eslint-parser              | 7.28.6 | 8.0.1 |
| @babel/plugin-syntax-flow         | 7.28.6 | 8.0.1 |
| @babel/plugin-transform-react-jsx | 7.28.6 | 8.0.1 |
| @babel/preset-env                 | 7.29.2 | 8.0.2 |
| @babel/preset-react               | 7.28.5 | 8.0.1 |
| @babel/preset-typescript          | 7.28.5 | 8.0.1 |
| babel-plugin-polyfill-regenerator | 0.6.8  | 1.0.0 |

**Known breaking changes:**

- `@babel/preset-env` dropped several legacy `targets` shorthands.
- Flow plugin may conflict with TS-only setups — verify `babel.config.*` still resolves correctly.
- `babel-plugin-polyfill-regenerator` 0→1: entry-point exports changed.

**Verification:** Dev build (`yarn nx serve nfid-frontend`) boots without transpilation errors.

---

### Group 3 — TypeScript 7

| Package    | From  | To    |
| ---------- | ----- | ----- |
| typescript | 5.5.4 | 7.0.2 |

**Known breaking changes:**

- TS 7 enforces stricter `isolatedModules` behavior.
- Some decorator emits changed; check any `experimentalDecorators` usage.
- `verbatimModuleSyntax` may become default — `import type` enforcement.
- Removed deprecated `--importsNotUsedAsValues` flag.

**Verification:** `yarn nx run nfid-frontend:typecheck` exits 0.

---

### Group 4 — ESLint 10

| Package | From   | To     |
| ------- | ------ | ------ |
| eslint  | 9.39.2 | 10.9.1 |

**Known breaking changes:**

- ESLint 10 fully removes legacy `.eslintrc.*` support — only flat config (`eslint.config.*`) is valid. If the project still uses `.eslintrc`, it must be migrated to `eslint.config.js`.
- Several built-in rules renamed or removed.

**Verification:** `yarn lint` exits 0 with no config-parsing errors.

---

### Group 5 — Tailwind CSS 4

| Package            | From  | To    |
| ------------------ | ----- | ----- |
| tailwindcss        | 3.4.3 | 4.3.3 |
| tailwindcss-radix  | 2.6.1 | 4.0.2 |
| tailwind-scrollbar | 3.1.0 | 4.0.2 |

**Known breaking changes:**

- Tailwind 4 replaces `tailwind.config.js` with CSS-native `@theme` blocks — full config migration required.
- JIT is now always on; `content` array config syntax changed.
- `tailwindcss-radix` and `tailwind-scrollbar` both target Tailwind 4 in their new majors; check plugin registration syntax.
- Several utility class names changed (e.g., `shadow-sm` values updated, `ring` defaults shifted).

**Verification:** Visual smoke-test of key pages; `yarn nx build nfid-frontend` produces no PostCSS errors.

---

### Group 6 — XState 5

| Package       | From   | To     |
| ------------- | ------ | ------ |
| xstate        | 4.38.3 | 5.32.6 |
| @xstate/react | 3.2.2  | 6.1.0  |

**Known breaking changes — this is the highest-effort migration:**

- `createMachine` config shape changed: `states`, `on`, `context` initialization all have new syntax.
- `services` key renamed to `actors`.
- `assign` now uses a function-only form (object shorthand removed).
- `send` replaced by `actor.send`; `useInterpret` / `useMachine` APIs changed in `@xstate/react`.
- `invoke` `src` must now be an actor creator, not a raw Promise function.
- Every machine file under `features/**/*machine.ts` needs to be reviewed.

**Verification:** All XState-driven flows (auth, transfer, wallet-connect) manually smoke-tested; `yarn nx test nfid-frontend` passes.

---

### Group 7 — React 19

| Package            | From    | To      |
| ------------------ | ------- | ------- |
| react              | 18.3.1  | 19.2.8  |
| react-dom          | 18.3.1  | 19.2.8  |
| @types/react       | 18.3.1  | 19.2.18 |
| @types/react-dom   | 18.3.0  | 19.2.5  |
| react-helmet-async | 2.0.5   | 3.0.0   |
| framer-motion      | 12.38.0 | 13.1.1  |

**Known breaking changes:**

- `ReactDOM.render` and `ReactDOM.hydrate` removed (replaced by `createRoot` / `hydrateRoot`) — likely already using new API, but verify.
- `findDOMNode` removed — any usages must be replaced with refs.
- `createFactory` removed.
- `defaultProps` on function components removed (was deprecated in 18).
- `useEffect` cleanup timing tightened in StrictMode.
- `react-helmet-async` 3.x has a new provider API.
- `framer-motion` 13 drops several legacy `motion.*` static variants — check `AnimatePresence` usage.

**Verification:** Full app smoke-test (auth flow, wallet, transfer modal); `yarn nx test nfid-frontend` passes.

---

### Group 8 — Misc Dev & Test Tools

| Package                         | From    | To     |
| ------------------------------- | ------- | ------ |
| @testing-library/jest-dom       | 6.9.1   | 7.0.1  |
| lottie-react                    | 2.4.1   | 3.1.1  |
| react-infinite-scroll-component | 6.1.1   | 7.2.1  |
| puppeteer                       | 24.40.0 | 25.9.0 |
| fake-indexeddb                  | 4.0.1   | 6.2.5  |
| expect-webdriverio              | 5.6.5   | 6.0.9  |
| cucumber-html-reporter          | 6.0.0   | 7.2.0  |
| @types/node                     | 25.5.2  | 26.4.0 |
| lint-staged                     | 16.4.0  | 17.4.1 |

**Known breaking changes:**

- `@testing-library/jest-dom` 7: matchers now require explicit import from `@testing-library/jest-dom` (auto-import from `@testing-library/jest-dom/matchers` changes).
- `fake-indexeddb` 4→6: two major jumps — constructor API and structuredClone behavior changed.
- `expect-webdriverio` 5→6: matcher signatures tightened.
- `cucumber-html-reporter` 6→7: report config options renamed.
- `lint-staged` 16→17: config file format change (`.lintstagedrc` vs `package.json`).

**Verification:** `yarn nx test nfid-frontend` and `yarn test:e2e:frontend` pass.

---

## Execution Order

```
Group 1 (Nx)  →  Group 2 (Babel)  →  Group 3 (TS)  →  Group 4 (ESLint)
    →  Group 5 (Tailwind)  →  Group 6 (XState)  →  Group 7 (React 19)
    →  Group 8 (Misc)
```

Each group: update `package.json` → `yarn install` → fix compilation/lint errors → verify commands → open PR.

## Packages Excluded

- `@icp-sdk/auth` (7→8) — excluded per engineer instruction
- `@icp-sdk/core` (5→6) — excluded per engineer instruction
- All minor and patch bumps from the original list

## Verification Commands

| Check      | Command                                   |
| ---------- | ----------------------------------------- |
| TypeScript | `yarn nx run nfid-frontend:typecheck`     |
| Lint       | `yarn lint`                               |
| Unit tests | `yarn nx test nfid-frontend`              |
| Build      | `yarn nx build nfid-frontend`             |
| Dev server | `yarn nx serve nfid-frontend` (port 9090) |
| E2E        | `yarn test:e2e:frontend`                  |

## Accessibility

N/A — no UI changes.

## Out of Scope

- Minor and patch version bumps
- `@icp-sdk/auth` and `@icp-sdk/core`
- Runtime feature changes beyond what library migrations require
- New features piggy-backed onto this branch
