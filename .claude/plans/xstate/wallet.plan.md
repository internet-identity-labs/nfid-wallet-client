# Plan: XState Migration — NFID Auth Wrapper + 3rd-Party Auth Machines

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/xstate/wallet.spec.md
> Created: 2026-09-14
> Depends on: xstate/upgrade.plan.md, xstate/root.plan.md (root machine must be migrated first)

## Modified Files

| File                                                                                   | Change                    |
| -------------------------------------------------------------------------------------- | ------------------------- |
| `apps/nfid-frontend/src/features/authentication/nfid/nfid-machine.ts`                  | Full v5 migration         |
| `apps/nfid-frontend/src/features/authentication/3rd-party/third-party-machine.ts`      | Full v5 migration         |
| `apps/nfid-frontend/src/features/authentication/nfid/nfid-machine.spec.ts`             | Update test API if broken |
| `apps/nfid-frontend/src/features/authentication/3rd-party/third-party-machine.spec.ts` | Update test API if broken |

## Implementation Checklist

### NFID Auth Wrapper Machine (`nfid-machine.ts`)

Thinnest machine in the codebase — one invoke, one final state, one action.

- [ ] Remove `predictableActionArguments`, `tsTypes`, `schema`, `Schema` interface, `Events` union
- [ ] Wrap with `setup({ actors: { AuthenticationMachine }, actions: { assignAuthSession } }).createMachine(...)`
- [ ] Change `data: { verificationEmail: "", authRequest: { hostname: window.location.origin } }` on the invoke → `input: () => ({ verificationEmail: "", authRequest: { hostname: window.location.origin } })`
- [ ] Change `assign((_: ..., event: any) => ...)` → `assign(({ event }) => ...)`
- [ ] Remove second arg from `createMachine` call
- [ ] Verify `NFIDAuthMachineActor` and `NFIDAuthMachineType` exports still work

### 3rd-Party Auth Machine (`third-party-machine.ts`)

Parallel `Start` region with compound sub-states; invokes root auth machine.

- [ ] Remove `predictableActionArguments`, `tsTypes`, `schema` / `Schema` interface, all `done.invoke.*` and `error.platform.*` event types from `ThirdPartyAuthMachineEvents`
- [ ] Wrap with `setup({ actors, actions }).createMachine(...)`; move `handshake`, `getAppMeta`, `postDelegation`, `AuthenticationMachine` into `actors`
- [ ] Change all `assign((_: ..., event: any) => ...)` → `assign(({ event }) => ...)` for `assignAuthRequest`, `assignAppMeta`, `assignAuthoSession`, `assignAuthSession`, `assignError`
- [ ] Change `data: (context) => ({ appMeta, authRequest, authSession })` on the `AuthenticationMachine` invoke → `input: ({ context }) => ({ appMeta: context.appMeta, authRequest: context.authRequest, authSession: context.authSession })`
- [ ] `End` state invokes `postDelegation` — it is also `type: 'final'`. Confirm v5 supports `invoke` on a final state; if not, move `postDelegation` invocation to an `entry` action or the preceding `Authorization` state's `CHOOSE_ACCOUNT` transition
- [ ] Remove second arg from `createMachine` call
- [ ] Verify `IDPActor` and `ThirdPartyAuthMachineType` exports still work

### Tests

- [ ] Run `yarn nx test nfid-frontend --testPathPattern="nfid-machine|third-party-machine"` — fix any v4 API usages in spec files

### Verification

- [ ] `yarn nx typecheck nfid-frontend` — zero errors in these two files
- [ ] `yarn nx test nfid-frontend --testPathPattern="nfid-machine|third-party-machine"` — all passing

## Risks & Notes

- **`invoke` on a final state**: In v4, `End` in `ThirdPartyAuthMachine` has both `type: 'final'` and an `invoke` for `postDelegation`. XState v5 does not support `invoke` on final states — `postDelegation` must move to the `CHOOSE_ACCOUNT` transition's `actions` array or to an `entry` action on `End` before it becomes final. Investigate before implementing.
- **`assignAuthoSession` typo**: The existing action name has a typo (`assignAuthoSession`). Do not rename it in this migration — behavioural change is out of scope.
