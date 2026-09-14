# Plan: XState Migration — Transfer Modal Machine

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/xstate/transfer.spec.md
> Created: 2026-09-14
> Depends on: xstate/upgrade.plan.md

## Modified Files

| File                                                             | Change                         |
| ---------------------------------------------------------------- | ------------------------------ |
| `apps/nfid-frontend/src/features/transfer-modal/machine.ts`      | Full v5 migration              |
| `apps/nfid-frontend/src/provider.tsx`                            | `useInterpret` → `useActorRef` |
| `apps/nfid-frontend/src/features/transfer-modal/machine.spec.ts` | Update test API if broken      |

## Implementation Checklist

### Transfer Modal Machine (`transfer-modal/machine.ts`)

No child machine invocations, no async services — only guards and assign actions. Straightforward migration.

- [ ] Remove `predictableActionArguments`, `tsTypes`, `schema` from machine config
- [ ] Wrap with `setup({ guards, actions }).createMachine(...)`; this machine has no `actors` (no invoke/service)
- [ ] Move all guards into `setup({ guards })`: `isSendMachine`, `isReceiveMachine`, `isSwapMachine`, `isConvertMachine`, `isBridgeMachine`, `isEarnMachine`, `isWithdrawMachine`, `isPayMachine`, `isPromoteMachine`, `isStakeMachine`, `isRedeemMachine`, `isSendFungible`
- [ ] Move all assign actions into `setup({ actions })`; change every `assign((_: ..., event: any) => ...)` → `assign(({ context, event }) => ...)`
- [ ] Change every `cond:` → `guard:` in `always` transitions under `TransferModal` and `SendMachine.CheckSendType`
- [ ] Remove second arg from `createMachine` call
- [ ] Verify `TransferMachineActor` export (used in `provider.tsx` and `ProfileContext`) still works

### React hook update (`provider.tsx`)

- [ ] Change `import { useInterpret } from "@xstate/react"` → `import { useActorRef } from "@xstate/react"`
- [ ] Change `const transferService: TransferMachineActor = useInterpret(transferMachine)` → `const transferService: TransferMachineActor = useActorRef(transferMachine)`

### Tests

- [ ] Run `yarn nx test nfid-frontend --testPathPattern="transfer-modal/machine"` — fix any v4 API usages in spec file

### Verification

- [ ] `yarn nx typecheck nfid-frontend` — zero errors in `machine.ts` and `provider.tsx`
- [ ] `yarn nx test nfid-frontend --testPathPattern="transfer-modal/machine"` — all passing
- [ ] Confirm all `useActor(globalServices.transferService)` call sites compile — these do not change in v5

## Risks & Notes

- **`useActor` consumers**: 10+ feature files call `useActor(transferService)` or `useActor(globalServices.transferService)`. The `useActor` API is unchanged in `@xstate/react` v4, so these should not need modification — but run typecheck to confirm.
- **`CHANGE_TOKEN_TYPE` targets `#SendMachine.CheckSendType`**: This uses an ID-based target string. Verify XState v5 still resolves machine-level `id`-prefixed targets the same way.
