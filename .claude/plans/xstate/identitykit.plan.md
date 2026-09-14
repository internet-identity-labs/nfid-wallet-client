# Plan: XState Migration — IdentityKit RPC Machine

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/xstate/identitykit.spec.md
> Created: 2026-09-14
> Depends on: xstate/upgrade.plan.md, xstate/root.plan.md (root machine must be migrated first)

## Modified Files

| File                                                     | Change            |
| -------------------------------------------------------- | ----------------- |
| `apps/nfid-frontend/src/features/identitykit/machine.ts` | Full v5 migration |

## Implementation Checklist

### IdentityKit RPC Machine (`identitykit/machine.ts`)

Currently split across two objects (`machineConfig` + `machineServices`) that are merged at `createMachine` call time. In v5, consolidate into a single `setup().createMachine()` call.

- [ ] Remove `predictableActionArguments`, `tsTypes`, `schema` from the config spread
- [ ] Merge `machineConfig` and `machineServices` — move everything into `setup({ actors, guards, actions }).createMachine({ ...machineConfig })`
- [ ] Register all services in `actors`: `RPCReceiverV3` (currently cast via `((...args) => (RPCReceiverV3 as any)(...args)) as any` — clean up the cast by wrapping properly with `fromCallback` if `RPCReceiverV3` is a callback-style service, otherwise `fromPromise`), `executeSilentMethod`, `validateRequest`, `getInteractiveMethodData`, `executeInteractiveMethod`, `checkAuthenticationStatus`, `AuthenticationMachine`, `prepareCancelResponse`, `sendResponse`
- [ ] Change `data: (context) => ({ authRequest: ..., appMeta: ... })` on `AuthenticationMachine` invoke → `input: ({ context }) => ({ authRequest: context.activeRequest?.origin ? { hostname: context.activeRequest.origin } : undefined, appMeta: { url: context.activeRequest?.origin } })`
- [ ] Change all `cond:` → `guard:` in `RPCReceiverV3` region and `Main` region (`hasActiveRequest`, `shouldAuthenticate`, `isSilentRequest`, `isRequestProcessing`)
- [ ] Change all `assign((context: ..., event: any) => ...)` → `assign(({ context, event }) => ...)` for `assignRequest`, `assignRequestMetadata`, `moveQueue`, `resetActiveRequest`, `assignComponentData`, `assignError`
- [ ] Move `prepareFailedResponse` effect action into `setup({ actions })`
- [ ] Remove `machineConfig` and `machineServices` intermediate objects — inline everything via `setup().createMachine()`
- [ ] Verify `IdentityKitRPCMachine` named export still works (used in `coordinator.tsx`)

### Tests

- [ ] Run `yarn nx test nfid-frontend --testPathPattern="identitykit/machine"` if a spec file exists — fix any v4 API usages

### Verification

- [ ] `yarn nx typecheck nfid-frontend` — zero errors in `machine.ts`
- [ ] `yarn nx test nfid-frontend` — all passing
- [ ] Manual smoke test: open identitykit coordinator in dev server; verify RPC request queuing, silent method bypass, and interactive approval flow work

## Risks & Notes

- **`RPCReceiverV3` actor type**: Currently wrapped as `((...args: any[]) => (RPCReceiverV3 as any)(...args)) as any`. Inspect `RPCReceiverV3` implementation to determine if it is a callback-style service (returns cleanup fn) or promise-based — wrap with `fromCallback` or `fromPromise` accordingly, then register cleanly in `setup({ actors })`.
- **`sendResponse` has `NoActionError` guard**: The inline `sendResponse` service skips `sendResponseEffect` when `event.data instanceof NoActionError`. This logic must be preserved when registering it as an actor in `setup`.
- **`initial: "Initializing"` on parallel machine**: The `machineConfig` sets `initial: "Initializing"` but the machine is `type: 'parallel'` — parallel machines ignore `initial`. This is a pre-existing no-op; leave it as-is.
- **`CancelInteractiveRequest` `onError`**: Currently targets `Error` state with `assignError` — but looking at the code it goes to `SendResponse` on both `onDone` and `onError`. Preserve existing behaviour exactly.
