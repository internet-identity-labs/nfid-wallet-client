# XState Spec — IdentityKit RPC

> **Product:** Pages served to the `@nfid/identitykit` React SDK (connects via `postMessage` transport)
> **Machine:** `features/identitykit/machine.ts`
> **Prerequisite for:** XState v4 → v5 migration
>
> Auth is delegated to Root Auth Machine — see [wallet.spec.md](./wallet.spec.md).

---

## Machine Inventory

| Machine         | File                              | Type     |
| --------------- | --------------------------------- | -------- |
| IdentityKit RPC | `features/identitykit/machine.ts` | Parallel |

---

## IdentityKit RPC Machine

**File:** `features/identitykit/machine.ts`
**Entry point:** `features/identitykit/coordinator.tsx`

This is a **parallel machine** with two concurrent regions.

### Context

```ts
{
  requestsQueue: MessageEvent<RPCMessage>[]
  activeRequest: MessageEvent<RPCMessage> | undefined
  activeRequestMetadata: any | undefined
  componentData: any
  error?: Error
}
```

### Region 1 — `RPCReceiverV3`

```
RPCReceiverV3 (persistent callback service)
  │
  ├─ ON_REQUEST [guard: isRequestProcessing]  → assignRequest (queue only)
  └─ ON_REQUEST [guard: !isRequestProcessing] → assignRequest + moveQueue (process immediately)
```

### Region 2 — `Main`

```
Ready
  │ [always: hasActiveRequest] → ValidateRequest

ValidateRequest (invokes validateRequest)
  │ onDone [shouldAuthenticate]  → Authentication + assignRequestMetadata
  │ onDone [isSilentRequest]     → ExecuteSilentRequest + assignRequestMetadata
  │ onDone [else]                → InteractiveRequest + assignRequestMetadata
  │ onError                      → SendResponse

Authentication (nested)
├─ CheckAuthentication (invokes checkAuthenticationStatus)
│     │ onDone [isSilentRequest]  → ExecuteSilentRequest (Main)
│     │ onDone [else]             → InteractiveRequest (Main)
│     │ onError                   → Authenticate
└─ Authenticate (invokes AuthenticationMachine — see wallet.spec.md)
          │ onDone → CheckAuthentication

InteractiveRequest (nested)
├─ PrepareComponentData (invokes getInteractiveMethodData)
│     │ onDone  → PromptInteractiveRequest + assignComponentData
│     │ onError → Error + assignError
├─ PromptInteractiveRequest
│     │ ON_APPROVE → ExecuteInteractiveRequest
│     │ ON_CANCEL  → CancelInteractiveRequest
│     │ ON_BACK    → Authentication (Main) — allows switching accounts
├─ ExecuteInteractiveRequest (invokes executeInteractiveMethod)
│     │ onDone/onError → SendResponse
├─ CancelInteractiveRequest (invokes prepareCancelResponse)
│     │ onDone/onError → SendResponse
└─ Error
      │ TRY_AGAIN → Authentication (Main)
      │ ON_CANCEL → CancelInteractiveRequest

ExecuteSilentRequest (invokes executeSilentMethod)
  │ onDone        → SendResponse
  │ onError       → SendResponse + prepareFailedResponse

SendResponse (invokes sendResponse)
  │ onDone/onError → Ready + resetActiveRequest + moveQueue
```

### Guards

| Guard                 | Condition                                                                       |
| --------------------- | ------------------------------------------------------------------------------- |
| `hasActiveRequest`    | `context.activeRequest !== undefined`                                           |
| `isRequestProcessing` | `context.activeRequest !== undefined`                                           |
| `isSilentRequest`     | `event.data.isSilent` if present, else `context.activeRequestMetadata.isSilent` |
| `shouldAuthenticate`  | `event.data.requiresAuthentication === true`                                    |

### Actions

| Action                  | Effect                                                                         |
| ----------------------- | ------------------------------------------------------------------------------ |
| `assignRequest`         | Appends `event.data` to `context.requestsQueue`                                |
| `moveQueue`             | Shifts queue; sets `context.activeRequest = requestsQueue[0]`, clears metadata |
| `resetActiveRequest`    | Clears `context.activeRequest` and `context.activeRequestMetadata`             |
| `assignRequestMetadata` | `context.activeRequestMetadata = event.data`                                   |
| `assignComponentData`   | `context.componentData = event.data`                                           |
| `assignError`           | `context.error = event.data`                                                   |
| `prepareFailedResponse` | Prepares error RPC response in context                                         |

---

## Key Behaviours

- Per-request auth check: every request goes through `ValidateRequest` to determine if auth is needed.
- Silent methods bypass UI entirely via `ExecuteSilentRequest`.
- Interactive methods require explicit `ON_APPROVE` / `ON_CANCEL` from user.
- `ON_BACK` from approval screen re-enters `Authentication` (allows switching accounts mid-flow).

---

## Difference from Embed Machine

| Aspect         | Embed                             | IdentityKit RPC                            |
| -------------- | --------------------------------- | ------------------------------------------ |
| Transport      | `RPCReceiver` (postMessage v2)    | `RPCReceiverV3` (postMessage v3)           |
| Request queue  | Simple `messageQueue` array       | `requestsQueue` + `activeRequest` slot     |
| Auth trigger   | Session expiry via delegation TTL | Per-request via `shouldAuthenticate` guard |
| Auto-approval  | `ic_renewDelegation` method       | `isSilentRequest` guard                    |
| UI preparation | Component chosen by coordinator   | `getInteractiveMethodData` service         |

---

## External IdentityKit Package Contract

**Repo:** `/c/projects/identitykit` — does **not** use XState (React Context + hooks).

The `@nfid/identitykit` React library communicates with this machine via `postMessage` through `RPCReceiverV3`. No XState migration is required in the identitykit package.

| Contract point | Detail                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| Transport      | `RPCReceiverV3` listens for `MessageEvent<RPCMessage>` on the window        |
| Request shape  | Standard ICRC-29 / ICP RPC message: `{ id, method, params }`                |
| Response shape | `{ id, result }` or `{ id, error }` posted back via `sendResponse` service  |
| Auth           | `shouldAuthenticate` guard triggers auth UI; SDK does not manage auth state |
| Silent methods | Methods passing `isSilentRequest` guard execute without any UI              |

---

_Spec created: 2026-09-14_
