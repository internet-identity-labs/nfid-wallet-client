export enum SwapStage {
  TransferNFID,
  TransferSwap,
  Deposit,
  Swap,
  Withdraw,
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
