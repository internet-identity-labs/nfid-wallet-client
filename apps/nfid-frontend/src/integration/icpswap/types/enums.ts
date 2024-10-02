export enum SwapStage {
  TransferSwap,
  TransferNFID,
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
