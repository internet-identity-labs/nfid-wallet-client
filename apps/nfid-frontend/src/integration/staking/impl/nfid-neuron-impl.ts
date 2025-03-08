import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { TokenValue } from "../types/token-value"

export class NfidNeuronImpl implements NFIDNeuron {
  getStakeId(): number {
    throw new Error("Method not implemented.")
  }
  getInitialStake(): TokenValue {
    throw new Error("Method not implemented.")
  }
  getRewards(): TokenValue {
    throw new Error("Method not implemented.")
  }
  getTotalValue(): string {
    throw new Error("Method not implemented.")
  }
  getLockTime(): number {
    throw new Error("Method not implemented.")
  }
  getUnlockIn(): number {
    throw new Error("Method not implemented.")
  }
  getCreatedAt(): number {
    throw new Error("Method not implemented.")
  }
  startUnlocking(): Promise<void> {
    throw new Error("Method not implemented.")
  }
  stopUnlocking(): Promise<void> {
    throw new Error("Method not implemented.")
  }
  redeem(): Promise<void> {
    throw new Error("Method not implemented.")
  }
}
