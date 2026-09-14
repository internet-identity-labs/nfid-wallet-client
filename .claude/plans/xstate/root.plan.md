# Plan: XState Migration — Root Auth + Email Flow Machines

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/xstate/root.spec.md
> Created: 2026-09-14
> Depends on: xstate/upgrade.plan.md

## Modified Files

| File                                                                                                 | Change                                                                                                          |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.ts`                                | Full v5 migration + `CheckWallets` / `ChooseWallet` states                                                      |
| `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.ts`                | Full v5 migration                                                                                               |
| `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/auth-with-google.ts`      | Full v5 migration                                                                                               |
| `apps/nfid-frontend/src/features/authentication/root/coordinator.tsx`                                | Add `ChooseWallet` render branch; remove `getAllWalletsFromThisDevice` prop                                     |
| `packages/ui/src/organisms/authentication/auth-selection/index.tsx`                                  | Remove `walletState` local state, `isChooseWallet`, `isChooseWalletLoading`, `getAllWalletsFromThisDevice` prop |
| `apps/nfid-frontend/src/features/authentication/root/root-machine.spec.ts`                           | Update test API if broken                                                                                       |
| `apps/nfid-frontend/src/features/authentication/auth-selection/email-flow/machine.spec.ts`           | Update test API if broken                                                                                       |
| `apps/nfid-frontend/src/features/authentication/auth-selection/google-flow/auth-with-google.spec.ts` | Update test API if broken                                                                                       |

## Universal v4 → v5 Rules (apply to every machine in this plan)

| v4                                                     | v5                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| `createMachine(config, { guards, actions, services })` | `setup({ actors, guards, actions }).createMachine(config)` |
| `services: { ... }`                                    | `actors: { ... }` in `setup()`                             |
| `cond: 'name'` / `cond: fn`                            | `guard: 'name'` / `guard: fn`                              |
| `assign((_ctx, ev) => ...)`                            | `assign(({ context, event }) => ...)`                      |
| `data:` on `invoke`                                    | `input:` on `invoke`                                       |
| `data:` on final state                                 | `output:` on final state                                   |
| `predictableActionArguments: true`                     | Remove                                                     |
| `tsTypes: {} as import(...).Typegen0`                  | Remove                                                     |
| `schema: { ... }`                                      | Remove                                                     |
| `done.invoke.*` event types in `Events` union          | Remove                                                     |

## Implementation Checklist

### Google Flow Machine (`auth-with-google.ts`)

Simplest machine — single invoke, single final state. Migrate first as a warm-up.

- [ ] Remove `predictableActionArguments`, `tsTypes`, `schema`, `Schema` interface, `Events` union
- [ ] Wrap with `setup({ actors: { signWithGoogleService }, actions: { assignAuthSession } }).createMachine(...)`
- [ ] Change `assign((_: ..., event: any) => ...)` → `assign(({ event }) => ...)`
- [ ] Change final state `data: (context) => context.authSession` → `output: ({ context }) => context.authSession`
- [ ] Remove second arg from `createMachine` call
- [ ] Verify `ActorRefFrom<typeof AuthWithGoogleMachine>` export still works

### Email Flow Machine (`email-flow/machine.ts`)

- [ ] Remove `predictableActionArguments`, `tsTypes`, `schema`, `Schema` interface, `Events` union (keep only the types needed by services)
- [ ] Wrap with `setup({ actors, guards, actions }).createMachine(...)`; move `sendVerificationEmail`, `checkEmailVerification`, `authorizeWithEmail` into `actors`
- [ ] Move `isRequestNotExpired` guard into `setup({ guards })`
- [ ] Change all `assign((_: ..., event: any) => ...)` → `assign(({ context, event }) => ...)`; fix `assignVerificationData`, `assignAuthSession`, `assignEmailDelegation`
- [ ] Change final state `data: (context) => context.authSession` → `output: ({ context }) => context.authSession`
- [ ] `stopIntervalVerification` is used as both an action and imported directly — confirm it stays as a plain action reference in `setup({ actions })`
- [ ] Remove second arg from `createMachine` call

### Root Auth Machine (`root-machine.ts`)

Most complex — invokes Google, Email, and II services; has 6 guards and 8 actions. Also adds `CheckWallets` and `ChooseWallet` states.

- [ ] Remove `predictableActionArguments`, `tsTypes`, `schema`, `Schema` interface, `Events` union
- [ ] Add `wallets: ExistingWallet[]` (default `[]`) to machine context
- [ ] Add `CheckWallets` as new `initial` state: invokes `getAllWalletsFromThisDevice`; `onDone [hasWallets && isPasskeySupported]` → `ChooseWallet` + `assignWallets`; `onDone [else]` → `AuthSelection`
- [ ] Add `ChooseWallet` state: `AUTH_WITH_PASSKEY` → `checkRecovery8th` + `assignAuthSession`; `CHOOSE_WALLET` → `AuthSelection`; `BACK` → `AuthSelection`
- [ ] Add `CHOOSE_WALLET` handler to `AuthSelection`: → `ChooseWallet` (coordinator sends this when user clicks the back arrow and wallets exist in context)
- [ ] Wrap with `setup({ actors, guards, actions }).createMachine(...)`
- [ ] Add to `actors`: `getAllWalletsFromThisDevice`, `AuthWithEmailMachine`, `AuthWithGoogleMachine`, `checkIf2FAEnabled`, `shouldShowPasskeysEvery6thTime`, `shouldShowRecoveryPhraseEvery8thTime`, `shouldShowPasskeys`; wrap `signWithIIService` as `fromPromise(() => signWithIIService())`
- [ ] Add to `guards`: `hasWallets` (`({ event }) => event.output.length > 0`), `isPasskeySupported` (`() => isWebAuthNSupported()`)
- [ ] Add `assignWallets` action: `assign(({ event }) => ({ wallets: event.output }))`
- [ ] Change all `cond:` → `guard:` across every `onDone`, `on`, and `always` transition
- [ ] Change inline guard in `checkPasskeys6th` → named guard `shouldShowRecoveryEvery8th` in `setup({ guards })`
- [ ] Change all `assign((_: ..., event: any) => ...)` → `assign(({ context, event }) => ...)`; fix all actions
- [ ] Change `data:` on child machine invokes → `input:`
- [ ] Change final state `data: (context) => ({ ...context })` → `output: ({ context }) => ({ ...context })`
- [ ] Remove second arg from `createMachine` call
- [ ] Verify `AuthenticationMachineActor` and `AuthenticationMachineType` exports still work

### Coordinator (`root/coordinator.tsx`)

- [ ] Add `state.matches('ChooseWallet')` render branch that shows `<ChooseWallet>` component
- [ ] In `ChooseWallet` branch, pass `wallets={state.context.wallets}`, `onLoginWithPasskey` (fires `AUTH_WITH_PASSKEY`), `onAuthSelection` (fires `CHOOSE_WALLET`)
- [ ] Remove `getAllWalletsFromThisDevice` prop from `<AuthSelection>` (machine now owns this)
- [ ] In `AuthSelection` render branch, fire `CHOOSE_WALLET` event when the back arrow is clicked (only shown when `state.context.wallets.length > 0`)

### `AuthSelection` component (`packages/ui/src/organisms/authentication/auth-selection/index.tsx`)

- [ ] Remove `WalletState` type, `walletState` useState, `isChooseWalletLoading`, `isChooseWallet` fields
- [ ] Remove `useEffect` that calls `getAllWalletsFromThisDevice`
- [ ] Remove `getAllWalletsFromThisDevice` from `AuthSelectionProps` interface
- [ ] Remove `isPasskeySupported` memo and `walletState.isChooseWallet && isPasskeySupported` conditional — the coordinator handles `ChooseWallet` rendering now
- [ ] Remove back-arrow `IconCmpArrow` that toggled `isChooseWallet` — replace with a prop `onShowWallets?: () => void` that the coordinator wires to `send('CHOOSE_WALLET')`, rendered only when `wallets.length > 0` (passed as prop)
- [ ] Keep `isPasskeySupported` memo only for the "Continue with a Passkey" button visibility (line 190)

### Tests

- [ ] Run `yarn nx test nfid-frontend --testPathPattern="auth-with-google|email-flow|root-machine"` — fix any v4 API usages (`interpret`, `createMachine` second arg) in spec files

### Verification

- [ ] `yarn nx typecheck nfid-frontend` — zero errors in these three files
- [ ] `yarn nx test nfid-frontend --testPathPattern="auth-with-google|email-flow|root-machine"` — all passing

## Risks & Notes

- **`CheckWallets` only runs in sign-in mode**: The existing component only calls `getAllWalletsFromThisDevice` when `type === "sign-in"`. The machine always runs `CheckWallets` as initial state — ensure the coordinator passes context so the machine can skip `CheckWallets` when in sign-up mode, or guard the invoke result accordingly.
- **`isPasskeySupported` in guard vs. component**: Moving `isWebAuthNSupported()` into the machine guard means it runs once at `CheckWallets` entry. This is fine — it's a sync capability check. Confirm `isWebAuthNSupported` is importable from the integration package in the machine file.
- **`CHOOSE_WALLET` dual role**: The event now fires in two directions — from `ChooseWallet` → `AuthSelection` and from `AuthSelection` → `ChooseWallet`. XState handles this correctly since each state defines its own `on.CHOOSE_WALLET` handler independently.
- **`signWithIIService` is inline**: `AuthWithII` and `SignUpWithII` use `src: () => signWithIIService()`. In v5, wrap it as `fromPromise(() => signWithIIService())` and register in `setup({ actors })`.
- **`input:` on child machines**: Email and Google machines must declare their `input` type in their own `setup()` so the parent's `input:` passes through correctly. Migrate Google and Email machines first.
- **`checkIf2FAEnabled` service shape**: Returns `{ allowedPasskeys, email }` or `undefined`. Confirm the v5 `fromPromise` actor wrapping preserves this return type.
- **`shouldShowPasskeysEvery6thTime` takes context**: `src: (context) => shouldShowPasskeysEvery6thTime(context)` — in v5 use `fromPromise(({ input }) => shouldShowPasskeysEvery6thTime(input))` and pass context fields via `input:`.
