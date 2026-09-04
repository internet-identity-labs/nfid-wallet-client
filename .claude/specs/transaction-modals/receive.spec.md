# Receive Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`

---

## 1. Summary

Displays deposit addresses for all supported chains. No transaction is executed — purely informational.

---

## 2. Scope

### In scope

- ICP principal address
- ICP account ID
- BTC deposit address
- ETH address (shared across all EVM chains: Arbitrum, Base, BNB, Polygon)
- QR code display per address
- Copy-to-clipboard per address

### Out of scope

- Generating new addresses on demand
- Address expiry / one-time addresses

---

## 3. User Flow

```
Wallet page / Token page  ──[Receive]──▶  Receive modal opens
                                            │
                                  All addresses displayed simultaneously
                                  QR code shown for selected chain tab
                                            │
                                  User copies address or scans QR
                                            │
                                  [Close]
```

---

## 4. MAX Button Behaviour

Not applicable — no amount input.

---

## 5. UI Components

| Element         | Behaviour                                                     |
| --------------- | ------------------------------------------------------------- |
| Chain tabs      | ICP / BTC / ETH — switches displayed address and QR           |
| Address display | Truncated address with full value in tooltip                  |
| QR code         | Generated from address string                                 |
| Copy button     | Copies full address to clipboard; shows confirmation feedback |

---

## 6. State Machine Integration

**`ModalType`:** `RECEIVE`
**Machine state:** `ReceiveMachine`

No context mutation — read-only state.

---

## 7. Key Files

| File                                             | Role                               |
| ------------------------------------------------ | ---------------------------------- |
| `features/transfer-modal/components/receive.tsx` | Receive modal UI                   |
| `hooks/` (address hooks)                         | ICP / BTC / ETH address derivation |
