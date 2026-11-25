# Plan: Stay Signing UI Preference & Local Storage Handling

> Status: VERIFIED
> Spec: .claude/specs/stay-signing-preference.spec.md
> Created: 2026-11-25
> Branch: `feature/sc-19807-implement-stay-signing-ui-preference-local`

## New Files

None.

## Modified Files

| File                                                                  | Change                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `packages/ui/src/organisms/authentication/choose-wallet/index.tsx`    | Add `staySignedIn` + `onStaySignedInChange` props; render `Checkbox`                      |
| `packages/ui/src/organisms/authentication/auth-selection/index.tsx`   | Add `staySignedIn` + `onStaySignedInChange` props; render `Checkbox`                      |
| `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx` | Add `useState(false)` for `staySignedIn`; pass to both screens; write to module-level ref |
| `apps/nfid-frontend/src/features/authentication/nfid/coordinator.tsx` | Call `doNotRememberMe()` before navigate in "End" effect, reading the module-level ref    |

## Implementation Checklist

### Components — UI organisms

- [ ] **`ChooseWallet`** — add `staySignedIn: boolean` and `onStaySignedInChange: (v: boolean) => void` to `ChooseWalletProps`; render `<Checkbox id="stay-signed-in-choose" value="staySignedIn" isChecked={staySignedIn} onChange={(_, ) => onStaySignedInChange(!staySignedIn)} labelText="Stay signed in" />` at the bottom of the component, above the "Use a different wallet" button

- [ ] **`AuthSelection`** — add same two props to `AuthSelectionProps`; render identical `<Checkbox>` below the "Other connection options" button

### Coordinator wiring

- [x] **`coordinator.tsx`** — `useState(() => rememberMeService.isRemembered())` for initial checkbox state; pass props to both screens; `useEffect` subscribes to `actor` directly (not React state) so the subscription fires synchronously on machine transition — before the outer coordinator unmounts this component — and calls `doNotRememberMe()` if `!staySignedIn`

### Verification

- [ ] `yarn nx lint nfid-wallet-client` — zero new errors
- [ ] `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json` — zero errors
- [ ] `yarn nx test nfid-wallet-client` — no new failures
- [ ] Manual smoke test: dev server, verify checkbox appears on both screens; unchecked → after login `localStorage.getItem("anchor")` is null; checked → `anchor` persists

## Risks & Notes

- `rememberMeService.doNotRememberMe()` is idempotent (no-op if already MEMORY) — safe to call.
- `Checkbox` `onChange` signature is `(isChecked: boolean, value: string) => void` where `isChecked` is the **previous** value, so toggle with `!isChecked` (or `onStaySignedInChange(!staySignedIn)`).
- Actor subscription fires synchronously on machine transition; re-subscribes on `staySignedIn` change via `[actor, staySignedIn]` deps so the closure is never stale. `doNotRememberMe()` is idempotent so multiple calls are safe.
- No XState machine changes required.
- No new files — all changes are additive props on existing components.
