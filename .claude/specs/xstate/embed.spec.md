# XState Spec — Embed

> **Product:** `/embed` route — NFID embedded as an iframe inside a dApp
> **Machine:** `features/embed/machine.ts`
> **Prerequisite for:** XState v4 → v5 migration
>
> Auth is delegated to Root Auth Machine — see [wallet.spec.md](./wallet.spec.md).

---

## Machine Inventory

| Machine | File                        | Type     |
| ------- | --------------------------- | -------- |
| Embed   | `features/embed/machine.ts` | Parallel |

---

## Embed Machine

**File:** `features/embed/machine.ts`
**Entry point:** `features/embed/coordinator.tsx`

This is a **parallel machine** with three concurrent regions.

### Context

```ts
{
  appMeta: AuthorizingAppMeta
  authRequest: {
    maxTimeToLive?: bigint
    sessionPublicKey?: Uint8Array
    hostname?: string
    derivationOrigin?: string
    targets?: string[]
    chain?: Chain
  }
  authSession?: AuthSession
  rpcMessage?: RPCMessage
  error?: Error
  messageQueue: RPCMessage[]
}
```

### Region 1 — `RPC_RECEIVER`

Listens on `window.addEventListener('message')` via `RPCReceiver` service. Entry action `nfid_ready` posts readiness to parent.

```
RPC_RECEIVER
  │ entry: nfid_ready
  │ invokes RPCReceiver (persistent callback service)
  │
  ├─ RPC_MESSAGE [guard: isReady]   → assignProcedure
  └─ RPC_MESSAGE [guard: !isReady]  → queueRequest
```

### Region 2 — `AUTH`

```
CheckAppMeta (invokes CheckApplicationMeta)
      │ onDone → assignAppMeta
      ▼
CheckAuthentication (invokes CheckAuthState)
      │ onDone → assignAuthSession + nfid_authenticated
      │ onError
      ▼
Authenticate (invokes AuthenticationMachine — see wallet.spec.md)
      │ onDone → assignAuthSession
      ▼
Authenticated
      │ entry: nfid_authenticated
      │ invokes session TTL monitor (callback actor)
      │   → fires SESSION_EXPIRED at 80% of delegation TTL
      │ SESSION_EXPIRED → nfid_unauthenticated → Authenticate
      │ onError         → nfid_unauthenticated → Authenticate

RESET (machine-level) → AUTH.CheckAppMeta
```

Session TTL monitor: inline callback service that reads `delegationIdentity` expiry, sets a `setTimeout` at 80% of TTL (capped at `ONE_DAY_IN_MS`), returns cleanup. Fires `SESSION_EXPIRED` when it triggers.

### Region 3 — `HANDLE_PROCEDURE`

```
READY
  │ [always: isAutoApprovable] → EXECUTE_PROCEDURE
  │ [always: hasProcedure]     → AWAIT_PROCEDURE_APPROVAL

AWAIT_PROCEDURE_APPROVAL
  │ APPROVE                    → EXECUTE_PROCEDURE
  │ APPROVE_IC_GET_DELEGATION  → EXECUTE_PROCEDURE
  │ APPROVE_IC_REQUEST_TRANSFER→ EXECUTE_PROCEDURE
  │ CANCEL → sendRPCCancelResponse + updateProcedure → READY

EXECUTE_PROCEDURE (invokes ExecuteProcedureService)
  │ onDone  → sendRPCResponse + updateProcedure → READY
  │ onError → assignError → ERROR

ERROR
  │ RETRY        → AWAIT_PROCEDURE_APPROVAL
  │ CANCEL_ERROR → sendRPCCancelResponse + updateProcedure → READY

RESET (machine-level) → HANDLE_PROCEDURE.READY
```

Auto-approvable methods (no user prompt needed): `ic_renewDelegation`.

### Message Queue Semantics

- Incoming `RPC_MESSAGE` while in `HANDLE_PROCEDURE.READY` → processed immediately via `assignProcedure`.
- Incoming `RPC_MESSAGE` while NOT in `READY` → pushed to `messageQueue` via `queueRequest`.
- `updateProcedure` dequeues `messageQueue[0]` after each procedure completes or is cancelled.

### Guards

| Guard              | Condition                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| `hasProcedure`     | `context.rpcMessage !== undefined`                                          |
| `isAutoApprovable` | `context.rpcMessage.method === 'ic_renewDelegation'`                        |
| `isReady`          | `state.matches('HANDLE_PROCEDURE.READY')` — uses third meta arg `{ state }` |

### Actions

| Action                  | Effect                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| `nfid_ready`            | Posts `nfid_ready` message to parent window                           |
| `nfid_authenticated`    | Posts `nfid_authenticated` message to parent window                   |
| `nfid_unauthenticated`  | Posts `nfid_unauthenticated` message to parent window                 |
| `assignAppMeta`         | Sets `context.appMeta` + `context.authRequest.hostname` from app meta |
| `assignProcedure`       | Sets `context.rpcMessage` + updates `authRequest` session params      |
| `assignAuthSession`     | `context.authSession = event.data.authSession`                        |
| `queueRequest`          | Appends `event.data.rpcMessage` to `context.messageQueue`             |
| `updateProcedure`       | Shifts `messageQueue`; sets `context.rpcMessage = messageQueue[0]`    |
| `assignError`           | `context.error = event.data`                                          |
| `sendRPCResponse`       | Posts RPC success response to requesting window                       |
| `sendRPCCancelResponse` | Posts RPC cancel response to requesting window                        |

### Cross-Region Communication

The three regions interact via shared context and machine-level events:

- `RPC_RECEIVER` writes `context.rpcMessage`; `HANDLE_PROCEDURE` reads it.
- `AUTH.Authenticated` being active is checked externally by the coordinator before rendering procedure approval UI.

---

## Key Behaviours

- Posts `nfid_ready` on init, `nfid_authenticated`/`nfid_unauthenticated` on session changes.
- Session TTL monitoring re-triggers auth at 80% expiry (capped at 1 day).
- Message queue buffers concurrent RPC calls while a procedure is in flight.

---

_Spec created: 2026-09-14_
