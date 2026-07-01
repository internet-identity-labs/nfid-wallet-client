# Call Canister RPC Screens (`icrc49_call_canister`) — Feature Spec

**Status:** Reference — documents existing behaviour (in progress, `sc-19629`)
**Related:** none yet

---

## 1. Summary

When a connected dApp sends an `icrc49_call_canister` RPC request (IdentityKit / ICRC-49 signer standard), NFID shows an approval screen before executing the canister call on the user's behalf. The screen shown depends on the target canister and method, ranging from a dedicated transfer/approve UI to a generic consent-message fallback.

---

## 2. Scope

### In scope

- Routing an incoming `icrc49_call_canister` request to the right approval screen
- Metadata extraction per method: `transfer` (ICP legacy ledger), `icrc1_transfer`, `icrc2_approve`, and the generic default
- Destination address formatting for both ICP `AccountIdentifier` and ICRC-1 `Account` encodings
- Memo display for both the legacy ledger (`nat64`) and ICRC-1 (`opt vec nat8`) memo shapes
- Identity resolution per connected-account type (global / session / anonymous-legacy) for signing the call

### Out of scope

- The `icrc49_delegation` / connect flow itself (handled elsewhere in `identitykit/service/method`)
- Non-interactive RPC methods

---

## 3. User Flow

```
dApp ── icrc49_call_canister ──▶ Icrc49CallCanisterMethodService
                                    │
                         getSender(origin, sender)      resolve connected Account
                         getIdentity(dto, account)       delegation per AccountType
                                    │
                         consentMessageService.getConsentMessage(...)
                         IDL.decode(argTypes, arg) ──▶ JSON.stringify  (best-effort;
                                    │                    falls back to raw base64 arg)
                         getRequestMetadata(method, args) ──▶ per-method helper
                                    │
                    RPCComponentICRC49 picks screen by `${canisterId}-${methodName}`,
                    then `${methodName}`, then `default`
                                    │
                         User reviews, [Approve] or [Reject]
                                    │
                         onApprove ──▶ callCanisterService.call(...) via resolved agent/identity
```

---

## 4. Screen Routing

`componentsMap` in `icrc49-call-canister.tsx` maps request → component, most specific key wins:

| Key                                    | Component                           | Notes                                   |
| -------------------------------------- | ----------------------------------- | --------------------------------------- |
| `ryjl3-tyaaa-aaaaa-aaaba-cai-transfer` | `call-canisters/transfer`           | ICP ledger canister's legacy `transfer` |
| `icrc1_transfer`                       | `call-canisters/transfer`           | Any canister's `icrc1_transfer`         |
| `icrc2_approve`                        | `call-canisters/icrc2-spending-cap` | Spending-cap approval                   |
| `default`                              | `call-canisters/default`            | Generic consent-message / raw args view |

---

## 5. Metadata Helpers

Each helper lives in `service/canister-calls-helpers/` and produces the props consumed by its screen.

| Helper               | Method(s)        | Computes                                                                                  |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `default.ts`         | fallback         | `balance`, `address` — derives ICP `AccountIdentifier` from sender                        |
| `ledger-transfer.ts` | `transfer`       | `balance`, `toAddress` (raw bytes → hex), `memo`, `amount`, `total`, `usdRate`            |
| `icrc1-transfer.ts`  | `icrc1_transfer` | `balance`, `symbol`, `decimals`, `fee`, `toAddress`, `memo`, `amount`, `total`, `usdRate` |
| `icrc2-approve.ts`   | `icrc2_approve`  | `balance`, `symbol`, `decimals`, `fee`, `amount`                                          |

### Destination address — ICP vs ICRC-1

These two helpers compute `toAddress` differently and are **not interchangeable**:

- **ICP legacy (`transfer`)** — destination is a hashed 32-byte `AccountIdentifier`. No textual owner/subaccount concept exists on the wire for this candid method; the bytes are hex-encoded directly (see `uint8ArrayToHexString`).
- **ICRC-1 (`icrc1_transfer`)** — destination is a candid `Account` (`{ owner: Principal, subaccount?: blob }`). It has no ledger-side hash; it's encoded textually via `encodeIcrcAccount` from `@icp-sdk/canisters/ledger/icrc`, per the [ICRC-1 textual encoding spec](https://github.com/dfinity/ICRC-1/blob/main/standards/ICRC-1/TextualEncoding.md): `owner.toText()` alone when the subaccount is all-zero, otherwise `owner.toText()-checksum.trimmedSubaccountHex`.
  The `owner` principal arrives JSON-serialized as `{ __principal__: "<text>" }` (via `Principal.toJSON()`), since the raw RPC `args` are produced by `JSON.stringify(IDL.decode(...))` in `icrc49-call-canister-method.service.ts`.

### Memo — ledger vs ICRC-1

- **ICP legacy `transfer`**: `memo` is a `nat64`; displayed as decimal (`requestParams.memo?.toString()`).
- **ICRC-1 `icrc1_transfer`**: `memo` is `opt vec nat8` (an opaque byte blob, not a number). It is hex-encoded directly (`uint8ArrayToHexString`) rather than parsed as an integer, so the value matches what block explorers (e.g. the IC Dashboard) display for the same transaction. A byte array `[236]` displays as `ec`, matching the dashboard — not `236`, which would be a decimal reinterpretation with no meaning for a multi-byte blob.

---

## 6. Key Files

| File                                                                                       | Role                                                            |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `service/method/interactive/icrc49-call-canister-method.service.ts`                        | RPC entry point, identity resolution, method routing            |
| `components/methods/icrc49-call-canister.tsx`                                              | Screen selection by canister ID / method name                   |
| `components/call-canisters/transfer.tsx`                                                   | Transfer screen (ICP legacy + ICRC-1)                           |
| `components/call-canisters/icrc2-spending-cap.tsx`                                         | `icrc2_approve` screen                                          |
| `components/call-canisters/default.tsx`                                                    | Generic consent-message / raw-args screen                       |
| `components/call-canisters/details.tsx`                                                    | "Transaction details" slide-over (args/canister/sender)         |
| `service/canister-calls-helpers/{default,ledger-transfer,icrc1-transfer,icrc2-approve}.ts` | Per-method metadata computation                                 |
| `service/canister-calls-helpers/interfaces.ts`                                             | `DefaultMetadata` / `TransferMetadata` / `ICRC2Metadata` shapes |
