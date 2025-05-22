import { SignIdentity } from "@dfinity/agent"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { NeuronInfo, NeuronState } from "@dfinity/nns"

import {
  disburseICP,
  startICPDissolving,
  stopICPDissolving,
} from "@nfid/integration"
import { transfer as transferICP } from "@nfid/integration/token/icp"

import { getAccountIdentifier } from "frontend/features/transfer-modal/utils"

import { NfidNeuronImpl } from "./nfid-neuron-impl"

export class NfidICPNeuronImpl extends NfidNeuronImpl<NeuronInfo> {
  getState(): NeuronState {
    return this.neuron.state
  }

  getStakeId(): bigint {
    return this.neuron.neuronId
  }

  getStakeIdFormatted(): string {
    return this.getStakeId().toString()
  }

  getInitialStake(): bigint {
    return this.neuron.fullNeuron!.cachedNeuronStake
  }

  getRewards(): bigint {
    return this.neuron.fullNeuron!.maturityE8sEquivalent
  }

  getLockTime(): number | undefined {
    // const dissolveState = this.neuron.dissolveDelaySeconds

    // if (!dissolveState) return

    // if ("DissolveDelaySeconds" in dissolveState) {
    //   return Number(dissolveState.DissolveDelaySeconds)
    // }
    return 0
  }

  getUnlockIn(): number | undefined {
    // const dissolveState = this.neuron.dissolve_state[0]

    // if (!dissolveState) return

    // if ("WhenDissolvedTimestampSeconds" in dissolveState) {
    //   return Number(dissolveState.WhenDissolvedTimestampSeconds)
    // }
    return 0
  }

  getCreatedAt(): number {
    return Number(this.neuron.createdTimestampSeconds)
  }

  async startUnlocking(signIdentity: SignIdentity): Promise<void> {
    startICPDissolving({
      neuronId: this.getStakeId(),
      identity: signIdentity,
    })
  }

  async stopUnlocking(signIdentity: SignIdentity): Promise<void> {
    stopICPDissolving({
      neuronId: this.getStakeId(),
      identity: signIdentity,
    })
  }

  isDiamond(): boolean {
    return false
  }

  async redeem(signIdentity: SignIdentity): Promise<void> {
    await disburseICP({
      neuronId: this.getStakeId(),
      toAccountId: AccountIdentifier.fromPrincipal({
        principal: signIdentity.getPrincipal(),
      }).toHex(),
      amount: this.getInitialStake(),
      identity: signIdentity,
    }).catch((e) => {
      throw new Error(e.detail.error_message)
    })

    transferICP({
      amount: Number(this.getProtocolFee()),
      to: getAccountIdentifier(NFID_WALLET_CANISTER_STAKING),
      identity: signIdentity,
    }).catch((e) => {
      throw e
    })
  }
}
