import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { Neuron } from "@dfinity/sns/dist/candid/sns_governance"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { bytesToHexString } from "src/integration/staking/service/staking-service-impl"

import { disburse } from "@nfid/integration"

import { TokenValue } from "../types/token-value"

export class NfidNeuronImpl implements NFIDNeuron {
  private neuron: Neuron
  private rootCanisterId: Principal

  constructor(neuron: Neuron, rootCanisterId: Principal) {
    this.neuron = neuron
    this.rootCanisterId = rootCanisterId
  }

  getStakeId(): string {
    return bytesToHexString(this.neuron.id[0]!.id)
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
  async redeem(signIdentity: SignIdentity): Promise<void> {
    await disburse({
      identity: signIdentity,
      rootCanisterId: this.rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })
  }
}
