# Plan: Major Dependency Updates

> Status: APPROVED
> Spec: .claude/specs/major-dependency-updates.spec.md
> Created: 2026-09-07

## Key Files Identified

| File                                                                                  | Relevant To                           |
| ------------------------------------------------------------------------------------- | ------------------------------------- |
| `babel.config.json`                                                                   | Group 2 — Babel 8                     |
| `nx.json`                                                                             | Group 1 — Nx 23                       |
| `apps/nfid-frontend/tailwind.config.js`                                               | Group 5 — Tailwind 4                  |
| `apps/nfid-demo/tailwind.config.js`                                                   | Group 5 — Tailwind 4                  |
| `packages/ui/tailwind.config.js`                                                      | Group 5 — Tailwind 4                  |
| `eslint.config.js` (root)                                                             | Group 4 — ESLint 10                   |
| `apps/nfid-frontend-e2e/src/.eslintrc.yaml`                                           | Group 4 — must migrate to flat config |
| `packages/*/eslint.config.js` (6 files)                                               | Group 4 — verify compat               |
| `apps/nfid-frontend/src/features/authentication/nfid/nfid-machine.ts`                 | Group 6 — XState 5                    |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.ts`                 | Group 6 — XState 5                    |
| `apps/nfid-frontend/src/features/embed/machine.ts`                                    | Group 6 — XState 5                    |
| `apps/nfid-frontend/src/features/identitykit/machine.ts`                              | Group 6 — XState 5                    |
| `apps/nfid-frontend/src/features/authentication/3rd-party/third-party-machine.ts`     | Group 6 — XState 5                    |
| `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.ts` | Group 6 — XState 5                    |
| `apps/nfid-frontend/src/features/transfer-modal/machine.ts`                           | Group 6 — XState 5                    |

---

## Implementation Checklist

<!-- Execute EXACTLY ONE checkbox at a time using /execute-ui-plan -->

---

### GROUP 1 — Nx 23

- [x] Bump `nx` and all `@nx/*` packages to `23.2.0` in `package.json`
- [x] Run `yarn install`
- [x] Run `npx nx migrate --run-migrations` to auto-apply workspace config patches
- [x] Verify `nx.json` schema is still valid (check for renamed/removed fields)
- [x] Run `yarn nx run-many --target=build --all` and fix any executor errors
- [ ] Run `yarn nx test nfid-frontend` — all passing
- [ ] Run `yarn test:e2e:frontend` — all passing

---

### GROUP 2 — Babel 8

- [x] Bump all `@babel/*` packages and `babel-plugin-polyfill-regenerator` to new major versions in `package.json`
- [x] Run `yarn install`
- [x] Update `babel.config.json`: remove `@babel/plugin-proposal-private-property-in-object` (merged into Babel 8 core — no longer needed as a plugin); verify `@babel/preset-env` `targets.ios` still accepted
- [x] Verify dev build starts without transpilation errors: `yarn nx serve nfid-frontend`
- [ ] Run `yarn nx test nfid-frontend` — all passing
- [ ] Run `yarn test:e2e:frontend` — all passing

---

### GROUP 3 — TypeScript 6

- [x] Bump `typescript` to `6.0.3`, `ts-jest` to `29.4.12`, `@typescript-eslint/eslint-plugin` to `8.70.0`, `@typescript-eslint/parser` to `8.70.0` in `package.json`; add `"@typescript-eslint/utils": "8.70.0"` and `"@nx/eslint-plugin/@typescript-eslint/utils": "8.70.0"` to `resolutions` to force deduplication of the nested copy inside `@nx/eslint-plugin`
- [x] Run `yarn install`
- [x] Run `yarn nx run nfid-frontend:typecheck` and address any new strict-mode errors
- [x] Run typecheck across all packages: `yarn nx run-many --target=typecheck --all`
- [x] Run `yarn nx test nfid-frontend` — 46/63 suites fail with `Must use import to load ES Module: @icp-sdk/canisters` (pre-existing before TS6, no regression; 17 suites pass same as baseline)
- [ ] Run `yarn test:e2e:frontend` — all passing

---

### GROUP 4 — ESLint 10

- [x] Bump `eslint` to `10.10.0` in `package.json`
- [x] Run `yarn install`
- [x] Migrate `apps/nfid-frontend-e2e/src/.eslintrc.yaml` to flat config format (inline the `env`, `globals`, and `rules` into the nearest `eslint.config.js` for that workspace package)
- [x] Verify root `eslint.config.js` and all `packages/*/eslint.config.js` are ESLint 10 compatible (check for removed rule names and deprecated config keys); bump `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to `8.70.0` (first version with `^10.0.0` peer dep) and add `"@typescript-eslint/utils": "8.70.0"` to `resolutions` to deduplicate the nested copy inside `@nx/eslint-plugin`; run `yarn install`
- [x] Run `yarn lint` and fix any rule-name or config errors
- [ ] Run `yarn nx test nfid-frontend` — all passing
- [ ] Run `yarn test:e2e:frontend` — all passing

---

### GROUP 5 — Tailwind CSS 4

- [x] Bump `tailwindcss` to `4.3.3`, `tailwindcss-radix` to `4.0.2`, `tailwind-scrollbar` to `4.0.2`, add `@tailwindcss/postcss` to `4.3.3` in `package.json`
- [x] Run `yarn install`
- [x] Migrate CSS entry point `apps/nfid-frontend/src/index.css` from three `@import "tailwindcss/base/components/utilities"` to single `@import "tailwindcss"` + `@config "../tailwind.config.js"` — JS config files kept as-is (v4 supports them via `@config`); `tailwindcss/plugin`, `tailwindcss/colors`, `tailwindcss/defaultTheme` all work via ESM in v4
- [x] Migrate `apps/nfid-demo/src/index.scss` → `index.css` (no SCSS features were used); updated import in `index.tsx`; added `@import "tailwindcss"` + `@config`
- [x] Packages `tailwindcss-radix@4.0.2` and `tailwind-scrollbar@4.0.2` both still use `plugin.withOptions` API — no registration changes needed; `packages/ui-tailwind-core` plugin unchanged
- [x] Updated all three `postcss.config.mjs` files to use `@tailwindcss/postcss` instead of `tailwindcss`
- [x] Fixed `packages/ui/src/atoms/range-slider/index.css` — replaced `@apply bg-primaryButtonColor` with direct CSS variable `rgb(var(--color-primaryButtonColor))` (v4 isolated CSS files cannot resolve custom utilities without `@reference`)
- [x] Removed stale `import "tailwindcss/tailwind.css"` from `apps/nfid-frontend/src/App.tsx` (v4 no longer exports this path)
- [x] Run `yarn nx build nfid-wallet-client` — compiled clean (3 pre-existing warnings only)
- [ ] Visual smoke-test: auth page, wallet page, transfer modal — check dark mode, scrollbars, Radix states
- [ ] Run `yarn nx test nfid-frontend` — all passing
- [ ] Run `yarn test:e2e:frontend` — all passing

---

### GROUP 6 — XState 5

> All 7 machines must be migrated. XState 5 is a full rewrite of the API — each machine is a separate sub-task.

- [ ] Read XState v5 migration guide before starting; key changes: `services` → `actors`, `assign` object shorthand removed (use function form), `useInterpret` → `createActor`, `invoke.src` must be actor creator
- [ ] Migrate `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.ts` to XState 5 API
- [ ] Migrate `apps/nfid-frontend/src/features/authentication/nfid/nfid-machine.ts` to XState 5 API
- [ ] Migrate `apps/nfid-frontend/src/features/authentication/3rd-party/third-party-machine.ts` to XState 5 API
- [ ] Migrate `apps/nfid-frontend/src/features/authentication/root/root-machine.ts` to XState 5 API
- [ ] Migrate `apps/nfid-frontend/src/features/embed/machine.ts` to XState 5 API
- [ ] Migrate `apps/nfid-frontend/src/features/identitykit/machine.ts` to XState 5 API
- [ ] Migrate `apps/nfid-frontend/src/features/transfer-modal/machine.ts` to XState 5 API
- [ ] Update all `@xstate/react` call sites (`useMachine`, `useActor`, `useInterpret`) to v6 API throughout `apps/nfid-frontend/src/`
- [ ] Run `yarn nx test nfid-frontend` and fix failing machine tests
- [ ] Smoke-test: auth flow, transfer modal, wallet-connect end-to-end in dev server
- [ ] Run `yarn nx test nfid-frontend` — all passing
- [ ] Run `yarn test:e2e:frontend` — all passing

---

### GROUP 7 — React 19

- [x] Bump `react`, `react-dom`, `@types/react`, `@types/react-dom` to `19.x`, `react-helmet-async` to `3.0.0`, `framer-motion` to `13.2.0` in `package.json`
- [x] Run `yarn install`
- [x] Search for any `ReactDOM.render` / `ReactDOM.hydrate` / `findDOMNode` / `createFactory` / `defaultProps` on function components usages and replace with React 19 equivalents
- [x] Update `react-helmet-async` usage to v3 provider API (check `HelmetProvider` import and usage in `App.tsx` / `provider.tsx`)
- [x] Check `framer-motion` `AnimatePresence` and `motion.*` static variant usage for v13 removals
- [x] Run `yarn nx run nfid-frontend:typecheck` and fix new React 19 type errors
- [x] Run `yarn nx test nfid-frontend` and fix failures
- [ ] Full smoke-test: auth flow, wallet, transfer modal, identity manager
- [ ] Run `yarn nx test nfid-frontend` — all passing
- [ ] Run `yarn test:e2e:frontend` — all passing

---

### GROUP 8 — Misc Dev & Test Tools

- [x] Bump `@testing-library/jest-dom` to `7.0.1`, `lottie-react` to `3.1.1`, `react-infinite-scroll-component` to `7.2.1`, `puppeteer` to `25.9.0`, `fake-indexeddb` to `6.2.5`, `expect-webdriverio` to `6.0.9`, `cucumber-html-reporter` to `7.2.0`, `@types/node` to `26.4.0`, `lint-staged` to `17.4.1` in `package.json`
- [x] Run `yarn install`
- [x] Update `@testing-library/jest-dom` import in test setup files (v7 may require explicit `import '@testing-library/jest-dom'` in each test or setup file)
- [x] Fix any `fake-indexeddb` usage breaking from 4→6 (constructor API and structuredClone changes)
- [x] Check `lint-staged` config in `package.json` for v17 format changes
- [x] Fix any `cucumber-html-reporter` config option renames in E2E report config
- [ ] Run `yarn nx test nfid-frontend` — all passing
- [ ] Run `yarn test:e2e:frontend` — all passing

---

## Verification per Group

| Check      | Command                                   |
| ---------- | ----------------------------------------- |
| TypeScript | `yarn nx run nfid-frontend:typecheck`     |
| Lint       | `yarn lint`                               |
| Unit tests | `yarn nx test nfid-frontend`              |
| Build      | `yarn nx build nfid-frontend`             |
| Dev server | `yarn nx serve nfid-frontend` (port 9090) |
| E2E        | `yarn test:e2e:frontend`                  |

## Risks & Notes

- **XState 5** is the highest-effort item — every machine file requires manual review; do not auto-replace patterns blindly.
- **Tailwind 4** config migration may break custom design tokens in `packages/ui-tailwind-core/` — test that component styles in Storybook still render correctly after migration.
- **Babel 8**: `@babel/plugin-proposal-private-property-in-object` is removed — it was merged into the core transform. Leaving it in `babel.config.json` will cause an error; it must be removed.
- **ESLint 10**: The only legacy config file is `apps/nfid-frontend-e2e/src/.eslintrc.yaml` — it's small (4 rules) and safe to inline into a flat config for that package.
- **TypeScript 6**: Companion bumps required — `ts-jest` to `29.4.12` (first `<7` peer) and `@typescript-eslint/*` to `8.70.0` (supports `<6.1.0`). The `@nx/eslint-plugin` bundles an older `@typescript-eslint/utils`; force it via yarn `resolutions`.
- Do not combine groups into a single PR — keep them separated for easier bisect if a regression is found.
