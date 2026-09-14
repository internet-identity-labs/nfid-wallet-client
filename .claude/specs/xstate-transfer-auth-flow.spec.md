# XState Transfer Modal & Auth Flow — Index

> This spec has been split into per-product files under `.claude/specs/xstate/`.

| Product                 | Spec                                                       |
| ----------------------- | ---------------------------------------------------------- |
| Wallet — auth machines  | [xstate/wallet.spec.md](./xstate/wallet.spec.md)           |
| Wallet — transfer modal | [xstate/transfer.spec.md](./xstate/transfer.spec.md)       |
| Embed (iframe SDK)      | [xstate/embed.spec.md](./xstate/embed.spec.md)             |
| IdentityKit RPC handler | [xstate/identitykit.spec.md](./xstate/identitykit.spec.md) |

## Migration Constraints (XState v4 → v5)

Applies to all three specs.

| Pattern                      | v4 usage                                               | v5 change needed                          |
| ---------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| Machine creation             | `createMachine(config, { guards, actions, services })` | `setup({ ... }).createMachine(config)`    |
| `services` option            | Second arg of `createMachine`                          | `setup({ actors: { ... } })`              |
| `assign` actions             | `assign((_ctx, ev) => ...)`                            | `assign(({ context, event }) => ...)`     |
| `cond` → `guard`             | `cond: 'guardName'`                                    | `guard: 'guardName'`                      |
| `always` transitions         | `always: [{ target, cond }]`                           | `always: [{ target, guard }]`             |
| Invoke input                 | `data:` on `invoke`                                    | `input:` on `invoke`                      |
| Final state output           | `data:` on final state                                 | `output:` on final state                  |
| `predictableActionArguments` | `true`                                                 | Remove (default in v5)                    |
| `tsTypes` / typegen          | `.typegen.ts` files                                    | Remove (v5 infers types via `setup()`)    |
| `useInterpret`               | `useInterpret(machine)`                                | `useActorRef(machine)`                    |
| `useActor(service)`          | Receives actor ref                                     | `useActor(actorRef)` — unchanged          |
| `useMachine`                 | `useMachine(machine)`                                  | unchanged (from `@xstate/react` v4)       |
| Inline callback service      | `src: () => (send) => cleanup`                         | `fromCallback(({ sendBack }) => cleanup)` |
