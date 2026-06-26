# Stake Action — Feature Spec

**Status:** Reference — documents existing behaviour
**Related:** `overview.spec.md`

---

## 1. Summary

Locks ICP or SNS tokens in a neuron for a chosen duration to earn staking rewards.

---

## 2. Scope

### In scope

- ICP native token
- SNS tokens
- Lock-time selection (months, converted to seconds via `StakeParamsCalculator`)
- Max voting power bonus indicator (diamond animation at maximum lock time)
- Post-stake cache refresh

### Out of scope

- Increasing stake of an existing neuron
- Changing dissolve delay of an existing neuron

---

## 3. User Flow

```
Token page  ──[Stake]──▶  Stake modal opens
                            │
                  Source token pre-selected
                  User enters amount
                  User selects lock time (months slider)
                            │
                  Fee estimated
                            │
                  [Stake]
                            │
                  StakeParamsCalculator converts months → seconds
                  stakingService.stake(amount, dissolveDelaySeconds)
                            │
                  Cache refresh
                            │
                  ┌─── Error? ──▶ toast, modal stays open
                  │
                  TransferSuccess screen
                  [Close]
```

---

## 4. MAX Button Behaviour

| Token type | Amount set in input | How                                                                              |
| ---------- | ------------------- | -------------------------------------------------------------------------------- |
| ICP, SNS   | `MAX_AMOUNT − Fee`  | Full balance minus the ICP/ICRC1 transfer fee; fee is known upfront (fixed rate) |

The staked amount equals exactly what the neuron will hold. The fee is not staked.

---

## 5. UI Components

### Stake Form

| Element              | Behaviour                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Token display        | Pre-filled from `selectedFT`; not changeable (staking is token-specific)                  |
| Amount input         | Numeric                                                                                   |
| Max button           | See section 4                                                                             |
| Lock time slider     | Range from `getMinimumLockTimeInMonths()` to `getMaximumLockTimeInMonths()`; step 1 month |
| Lock time label      | Formatted as "X years, Y months" via `formatLockTime()`                                   |
| Diamond animation    | Shown when lock time is at maximum (max voting power)                                     |
| Voting power tooltip | Appears alongside diamond when at max lock time                                           |
| Fee display          | Network fee                                                                               |
| Confirm button       | Disabled while fee loading or amount invalid                                              |

---

## 6. State Machine Integration

**`ModalType`:** `STAKE`
**Machine state:** `StakeMachine`

### Context fields

| Field            | Purpose                     |
| ---------------- | --------------------------- |
| `selectedFT`     | Token to stake              |
| `amount`         | Amount to stake             |
| `transferObject` | Passed to `TransferSuccess` |
| `error`          | Populated on failure        |

### Events

| Event                | When               |
| -------------------- | ------------------ |
| `ASSIGN_SELECTED_FT` | Token pre-selected |
| `ASSIGN_AMOUNT`      | User types amount  |
| `ON_TRANSFER`        | Stake confirmed    |
| `ASSIGN_ERROR`       | Stake failed       |

---

## 7. Service Layer

`stakingService.stake(amount, dissolveDelayInSeconds)` — creates a new neuron.

`StakeParamsCalculator` provides:

- `getMinimumLockTimeInMonths()`
- `getMaximumLockTimeInMonths()`
- Conversion: months → seconds for the canister call

---

## 8. Key Files

| File                                                          | Role                                      |
| ------------------------------------------------------------- | ----------------------------------------- |
| `features/transfer-modal/components/stake.tsx`                | Stake feature component                   |
| `packages/ui/src/organisms/send-receive/components/stake.tsx` | Stake UI organism                         |
| `integration/staking/`                                        | `stakingService`, `StakeParamsCalculator` |
