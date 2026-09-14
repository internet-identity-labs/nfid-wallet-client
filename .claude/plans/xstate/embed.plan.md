# Plan: XState Migration — Embed Machine

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/xstate/embed.spec.md
> Created: 2026-09-14
> Depends on: xstate/upgrade.plan.md, xstate/root.plan.md (root machine must be migrated first)

## Modified Files

| File                                               | Change            |
| -------------------------------------------------- | ----------------- |
| `apps/nfid-frontend/src/features/embed/machine.ts` | Full v5 migration |

## Implementation Checklist

### Embed Machine (`embed/machine.ts`)

Parallel machine with three regions. Two v5-specific patterns require extra care: the inline callback actor and the `isReady` guard.

- [ ] Remove `predictableActionArguments`, `preserveActionOrder`, `tsTypes`, `schema` / `Services` type from machine config
- [ ] Import `fromCallback` from `xstate` — needed for the TTL monitor actor
- [ ] Extract the inline `Authenticated` TTL monitor into a named `fromCallback` actor:
  ```ts
  const sessionExpiryActor = fromCallback(({ sendBack }) => {
    const { delegationIdentity } = authState.get()
    if (!delegationIdentity) {
      sendBack({ type: "SESSION_EXPIRED" })
      return () => {}
    }
    const expiresIn = getExpirationDelay(delegationIdentity)
    const timeoutIn = Math.min(expiresIn * 0.8, ONE_DAY_IN_MS)
    const timeout = setTimeout(
      () => sendBack({ type: "SESSION_EXPIRED" }),
      timeoutIn,
    )
    return () => clearTimeout(timeout)
  })
  ```
- [ ] Wrap with `setup({ actors, guards, actions }).createMachine(...)`; register `RPCReceiver`, `CheckApplicationMeta`, `CheckAuthState`, `AuthenticationMachine`, `ExecuteProcedureService`, `sessionExpiryActor` in `actors`
- [ ] Change `data: (context) => context` on `AuthenticationMachine` invoke → `input: ({ context }) => context`
- [ ] Change all `cond:` → `guard:` in `RPC_RECEIVER` and `HANDLE_PROCEDURE` regions
- [ ] Fix `isReady` guard: the v4 signature uses a third meta arg `{ state }`. In v5, guards receive `({ context, event, self })` — replace `state.matches(...)` with `self.getSnapshot().matches('HANDLE_PROCEDURE.READY')`
- [ ] Change all `assign((context: ..., event: any) => ...)` → `assign(({ context, event }) => ...)` for `assignAppMeta`, `assignProcedure`, `updateProcedure`, `assignAuthSession`, `queueRequest`, `assignError`
- [ ] Move effect actions (`nfid_ready`, `nfid_authenticated`, `nfid_unauthenticated`, `sendRPCResponse`, `sendRPCCancelResponse`) into `setup({ actions })` as plain references
- [ ] Remove second arg from `createMachine` call; remove `InvokationErrors` type (was a typed `done.invoke.*` workaround)

### Tests

- [ ] Run `yarn nx test nfid-frontend --testPathPattern="embed/machine"` if a spec file exists — fix any v4 API usages

### Verification

- [ ] `yarn nx typecheck nfid-frontend` — zero errors in `machine.ts`
- [ ] `yarn nx test nfid-frontend` — all passing
- [ ] Manual smoke test: open embed iframe flow in dev server; verify `nfid_ready` fires, auth works, RPC procedure approval/cancel works

## Risks & Notes

- **`fromCallback` send signature**: In v5, `fromCallback` receives `{ sendBack, receive }` — use `sendBack` (not `send`) to fire events back to the machine.
- **`isReady` guard and `self.getSnapshot()`**: The `self` reference in v5 guards is the actor ref for the machine itself. `self.getSnapshot().matches('HANDLE_PROCEDURE.READY')` is the correct replacement. Confirm this works for parallel state matching.
- **`ExecuteProcedureService` cast**: Currently cast as `(context, event) => executeProcedureServiceImpl(context as any, event as any)`. Preserve the cast for now — do not widen the scope of this migration.
- **`order: 1` on `RPC_RECEIVER`**: This is a v4-only property for ordering parallel region entry. Remove it in v5.
