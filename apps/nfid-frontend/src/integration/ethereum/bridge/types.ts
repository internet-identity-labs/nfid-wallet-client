export type { EstimatedBridge } from "packages/ui/src/organisms/send-receive/components/bridge"

export enum BridgeStatus {
  PENDING = "pending",
  INITIATED = "initiated",
  ATTESTED = "attested",
  COMPLETED = "completed",
  FAILED = "failed",
}
