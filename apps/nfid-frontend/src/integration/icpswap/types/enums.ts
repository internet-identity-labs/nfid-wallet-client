export enum SwapStage {
  TransferSwap,
  Deposit,
  Swap,
  Withdraw,
  TransferNFID,
  Completed,
}

export enum CompleteType {
  Complete,
  Rollback,
  RequestSupport,
}

export enum PriceImpactStatus {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}
