# XState Spec — Wallet

> **Product:** `nfid-wallet` / main `nfid-frontend` app
> **Machines:** NFID Auth Wrapper, 3rd-Party Auth
> **Prerequisite for:** XState v4 → v5 migration
>
> Root Auth and Email Flow machines are shared — see [root.spec.md](./root.spec.md).

---

## Machine Inventory

| Machine           | File                                                       | Type     |
| ----------------- | ---------------------------------------------------------- | -------- |
| NFID Auth Wrapper | `features/authentication/nfid/nfid-machine.ts`             | Compound |
| 3rd-Party Auth    | `features/authentication/3rd-party/third-party-machine.ts` | Parallel |

---

## 1. NFID Auth Wrapper Machine

**File:** `features/authentication/nfid/nfid-machine.ts`

**Used by:** Wallet app (`nfid-frontend` main entry). Thin wrapper that feeds `{ hostname: window.location.origin }` as `authRequest` into the root machine.

```
AuthenticationMachine (invokes root — see root.spec.md) → End (final, carries authSession)
```

---

## 2. Third-Party Auth Machine (IDP / Wallet SDK)

**File:** `features/authentication/3rd-party/third-party-machine.ts`

**Used by:** External dApps using NFID as IDP via iframe postMessage.

### State Diagram

```
Start (parallel)
├─ Handshake: Fetch → Done | Error (retry)
└─ GetAppMeta: Fetch → Done
        │ both done
        ▼
AuthenticationMachine (invokes root — see root.spec.md)
        │ done
        ▼
Authorization  ──CHOOSE_ACCOUNT──► End
                                    │ invokes postDelegation
                                    ▼
                              (delegation posted to parent)

Error (final, on service failure)
```

### Context

```ts
{
  authRequest?: { maxTimeToLive: bigint; sessionPublicKey: Uint8Array; hostname: string; derivationOrigin?: string }
  authSession?: AbstractAuthSession
  thirdPartyAuthSession?: ApproveIcGetDelegationSdkResponse
  appMeta: AuthorizingAppMeta
  error?: Error
  isIframe: boolean
}
```

---

## 3. Product Entry Points

| Concern                      | Machine                                    | Entry point                                       |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Sign in / sign up            | `nfid-machine` → `root-machine`            | `features/authentication/nfid/coordinator.tsx`    |
| 3rd-party IDP delegation     | `3rd-party/third-party-machine`            | `apps/authentication/3rd-party/coordinator.tsx`   |
| Send / receive / swap / etc. | see [transfer.spec.md](./transfer.spec.md) | `provider.tsx` → `ProfileContext.transferService` |

Auth flow: `NFIDAuthMachine` injects `{ hostname: window.location.origin }` as `authRequest` into root machine and re-exposes the resulting `authSession`.

---

_Spec created: 2026-09-14_
