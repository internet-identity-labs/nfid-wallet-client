# Redeem Stake Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`, `stake.spec.md`

---

## 1. Summary

Dissolves a specific staked neuron and returns the funds to the wallet. Triggered per-neuron from the staking portfolio view.

---

## 2. Scope

### In scope

- ICP neurons
- SNS neurons
- Single-neuron redemption per flow invocation
- Post-redeem balance refresh

### Out of scope

- Batch neuron dissolution
- Partial dissolution
- Changing dissolve state without redeeming

---

## 3. User Flow

```
Staking portfolio  ──[Redeem]──▶  Redeem modal opens
                                    │
                          Neuron details displayed
                          (amount, dissolve delay, token)
                                    │
                          [Confirm Redeem]
                                    │
                          stake.redeem(identity)
                                    │
                          Balance refresh
                                    │
                          ┌─── Error? ──▶ toast, modal stays open
                          │
                          TransferSuccess screen (or success state)
                          [Close]
```

---

## 4. MAX Button Behaviour

Not applicable — no amount input. The redeemed amount is the full neuron balance.

---

## 5. UI Components

### Redeem Form

| Element        | Behaviour                                                   |
| -------------- | ----------------------------------------------------------- |
| Neuron summary | Shows staked amount, token symbol, dissolve delay remaining |
| Confirm button | Single action — no amount to configure                      |
| Loading state  | Spinner during `stake.redeem()` call                        |

---

## 6. State Machine Integration

**`ModalType`:** `REDEEM`
**Machine state:** `RedeemMachine`

### Context fields

| Field            | Purpose                          |
| ---------------- | -------------------------------- |
| `stakeId`        | Neuron ID to redeem              |
| `selectedFT`     | Token associated with the neuron |
| `transferObject` | Passed to success screen         |
| `error`          | Populated on failure             |

### Events

| Event             | When                       |
| ----------------- | -------------------------- |
| `ASSIGN_STAKE_ID` | Neuron selected for redeem |
| `ON_TRANSFER`     | Redeem confirmed           |
| `ASSIGN_ERROR`    | Redeem failed              |

---

## 7. Service Layer

Each staked neuron exposes `stake.redeem(identity: SignIdentity): Promise<void>`.

The `identity` is the user's signing identity, resolved from `ProfileContext`.

---

## 8. Key Files

| File                                                  | Role                     |
| ----------------------------------------------------- | ------------------------ |
| `features/transfer-modal/components/redeem-stake.tsx` | Redeem feature component |
| `integration/staking/`                                | Neuron `redeem()` method |
