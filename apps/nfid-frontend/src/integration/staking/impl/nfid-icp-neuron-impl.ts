import { SignIdentity } from "@dfinity/agent"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Followees, Neuron, NeuronInfo, NeuronState } from "@dfinity/nns"

import {
  disburseICP,
  startICPDissolving,
  stopICPDissolving,
} from "@nfid/integration"
import {
  getAccountIdentifier,
  transfer as transferICP,
} from "@nfid/integration/token/icp"

import { FT } from "frontend/integration/ft/ft"

import { StakeICPParamsCalculatorImpl } from "../calculator/stake-icp-params-calculator-impl"

import { NfidNeuronImpl } from "./nfid-neuron-impl"

export class NfidICPNeuronImpl extends NfidNeuronImpl<NeuronInfo> {
  getState(): NeuronState {
    return this.neuron.state
  }

  getFollowees(): Followees[] {
    return this.neuron.fullNeuron!.followees
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
    return this.neuron.fullNeuron!.stakedMaturityE8sEquivalent || BigInt(0)
  }

  getLockTime(): number | undefined {
    const dissolveState = this.neuron.fullNeuron!.dissolveState

    if (!dissolveState) return

    if ("DissolveDelaySeconds" in dissolveState) {
      return Number(dissolveState.DissolveDelaySeconds)
    }
  }

  getUnlockIn(): number | undefined {
    const dissolveState = this.neuron.fullNeuron!.dissolveState

    if (!dissolveState) return

    if ("WhenDissolvedTimestampSeconds" in dissolveState) {
      return Number(dissolveState.WhenDissolvedTimestampSeconds)
    }
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
    const lockTime = this.getLockTime()
    if (!lockTime || this.getState() !== NeuronState.Locked) return false

    return this.params?.getMaximumLockTime() === lockTime
  }

  serialize(): unknown {
    return {
      neuronId: this.neuron.neuronId.toString(),
      state: this.neuron.state,
      createdTimestampSeconds: this.neuron.createdTimestampSeconds.toString(),
      fullNeuron: {
        followees: this.neuron.fullNeuron?.followees,
        cachedNeuronStake: this.neuron.fullNeuron?.cachedNeuronStake.toString(),
        stakedMaturityE8sEquivalent: this.neuron.fullNeuron
          ?.stakedMaturityE8sEquivalent
          ? this.neuron.fullNeuron.stakedMaturityE8sEquivalent.toString()
          : undefined,
        dissolveState: this.neuron.fullNeuron?.dissolveState
          ? "DissolveDelaySeconds" in this.neuron.fullNeuron.dissolveState
            ? {
                DissolveDelaySeconds:
                  this.neuron.fullNeuron.dissolveState.DissolveDelaySeconds.toString(),
              }
            : {
                WhenDissolvedTimestampSeconds:
                  this.neuron.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds.toString(),
              }
          : undefined,
      },
    }
  }

  static deserialize(
    raw: any,
    token: FT,
    params: StakeICPParamsCalculatorImpl,
  ): NfidICPNeuronImpl {
    const dissolveState = raw.fullNeuron?.dissolveState
      ? "DissolveDelaySeconds" in raw.fullNeuron.dissolveState
        ? {
            DissolveDelaySeconds: BigInt(
              raw.fullNeuron.dissolveState.DissolveDelaySeconds,
            ),
          }
        : {
            WhenDissolvedTimestampSeconds: BigInt(
              raw.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds,
            ),
          }
      : undefined

    const neuronInfo = {
      neuronId: BigInt(raw.neuronId),
      state: raw.state,
      createdTimestampSeconds: BigInt(raw.createdTimestampSeconds),
      fullNeuron: {
        followees: raw.fullNeuron?.followees || [],
        cachedNeuronStake: BigInt(raw.fullNeuron?.cachedNeuronStake || 0),
        stakedMaturityE8sEquivalent: raw.fullNeuron?.stakedMaturityE8sEquivalent
          ? BigInt(raw.fullNeuron.stakedMaturityE8sEquivalent)
          : undefined,
        dissolveState,
      } as unknown as Neuron,
    } as unknown as NeuronInfo

    return new NfidICPNeuronImpl(neuronInfo, token, params)
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
