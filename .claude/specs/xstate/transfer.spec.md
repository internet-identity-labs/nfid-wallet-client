# XState Spec — Transfer Modal

> **Product:** Wallet
> **Machine:** `features/transfer-modal/machine.ts`
> **Prerequisite for:** XState v4 → v5 migration

---

## Machine Inventory

| Machine        | File                                 | Type     |
| -------------- | ------------------------------------ | -------- |
| Transfer Modal | `features/transfer-modal/machine.ts` | Compound |

---

## Transfer Modal Machine

**File:** `features/transfer-modal/machine.ts`
**Entry point:** `provider.tsx` — instantiated once via `useInterpret`, shared via `ProfileContext.transferService`.

### Context

```ts
{
  direction: ModalType | null   // "send"|"receive"|"swap"|"convert"|"stake"|"redeem"|"bridge"|"earn"|"withdraw"|"pay"|"promote"
  tokenType: "ft" | "nft"
  sourceWalletAddress: string
  sourceAccount?: Wallet
  selectedFT?: SelectedToken
  selectedDapp: number
  selectedTargetFT?: string
  selectedNFTId?: string
  receiverWallet: string
  amount: string
  transferObject?: ITransferSuccess
  error?: Error
  tokenStandard: string
  isEarnUpdate: boolean
  withdrawBalance: bigint
  openCryptoPayParams: string
  openCryptoPayPreselect?: { method: string; asset: string }
  isOpenedFromVaults: boolean
  stakeId?: string
}
```

### State Diagram

```
Hidden
  │ SHOW → TransferModal

TransferModal (always transitions, no display)
  │ [isSendMachine]     → SendMachine
  │ [isReceiveMachine]  → ReceiveMachine
  │ [isSwapMachine]     → SwapMachine
  │ [isConvertMachine]  → ConvertMachine
  │ [isStakeMachine]    → StakeMachine
  │ [isRedeemMachine]   → RedeemMachine
  │ [isBridgeMachine]   → BridgeMachine
  │ [isEarnMachine]     → EarnMachine
  │ [isWithdrawMachine] → WithdrawMachine
  │ [isPayMachine]      → PayMachine
  │ [isPromoteMachine]  → PromoteMachine

SendMachine (nested)
├─ CheckSendType
│     │ [isSendFungible] → SendFT
│     └─ [else]          → SendNFT
├─ SendFT   ──ON_TRANSFER──► TransferSuccess
└─ SendNFT  ──ON_TRANSFER──► TransferSuccess

ReceiveMachine  ──HIDE──► Hidden
SwapMachine     ──ON_TRANSFER──► SwapSuccess
ConvertMachine
StakeMachine
RedeemMachine
BridgeMachine
EarnMachine
WithdrawMachine
PayMachine
PromoteMachine

TransferSuccess ──HIDE──► Hidden
SwapSuccess     ──HIDE──► Hidden
```

### Global Events (handled on root state)

| Event                          | Action                      | Next State                  |
| ------------------------------ | --------------------------- | --------------------------- |
| `SHOW`                         | —                           | `TransferModal`             |
| `HIDE`                         | —                           | `Hidden`                    |
| `CHANGE_DIRECTION`             | `assignDirection`           | `TransferModal`             |
| `CHANGE_TOKEN_TYPE`            | `assignTokenType`           | `SendMachine.CheckSendType` |
| `ASSIGN_SELECTED_FT`           | `assignSelectedFT`          | —                           |
| `ASSIGN_SELECTED_NFT`          | `assignSelectedNFTId`       | —                           |
| `ASSIGN_AMOUNT`                | `assignAmount`              | —                           |
| `ASSIGN_SOURCE_WALLET`         | `assignSourceWallet`        | —                           |
| `ASSIGN_RECEIVER_WALLET`       | `assignReceiverWallet`      | —                           |
| `ASSIGN_SOURCE_ACCOUNT`        | `assignSourceAccount`       | —                           |
| `ASSIGN_SELECTED_DAPP`         | `assignSelectedDapp`        | —                           |
| `ASSIGN_TOKEN_STANDARD`        | `assignTokenStandard`       | —                           |
| `ASSIGN_STAKE_ID`              | `assignStakeId`             | —                           |
| `ASSIGN_WITHDRAW_BALANCE`      | `assignWithdrawBalance`     | —                           |
| `ASSIGN_OPEN_CRYPTOPAY_PARAMS` | `assignOpenCryptopayParams` | —                           |
| `ASSIGN_IS_EARN_UPDATE`        | `assignIsEarnUpdate`        | —                           |
| `ASSIGN_VAULTS`                | `assignIsVault`             | —                           |
| `ASSIGN_ERROR`                 | `assignError`               | —                           |

### Guards

| Guard               | Condition                  |
| ------------------- | -------------------------- |
| `isSendMachine`     | `direction === 'send'`     |
| `isReceiveMachine`  | `direction === 'receive'`  |
| `isSwapMachine`     | `direction === 'swap'`     |
| `isConvertMachine`  | `direction === 'convert'`  |
| `isBridgeMachine`   | `direction === 'bridge'`   |
| `isEarnMachine`     | `direction === 'earn'`     |
| `isWithdrawMachine` | `direction === 'withdraw'` |
| `isPayMachine`      | `direction === 'pay'`      |
| `isPromoteMachine`  | `direction === 'promote'`  |
| `isStakeMachine`    | `direction === 'stake'`    |
| `isRedeemMachine`   | `direction === 'redeem'`   |
| `isSendFungible`    | `tokenType === 'ft'`       |

### Transfer Execution Model

The machine itself does **not** invoke async transfer services. Each sub-component (`SendFT`, `SendNFT`, etc.) owns the execution logic and fires `ON_TRANSFER` when complete. The machine tracks metadata state (amount, wallets, token) and routing only.

---

_Spec created: 2026-09-14_
