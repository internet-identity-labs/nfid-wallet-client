import { DissolveState } from "@dfinity/sns/dist/candid/sns_governance"
import { fromNullable } from "@dfinity/utils"
import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakedToken } from "src/integration/staking/staked-token"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { StakingState, TokenValue } from "frontend/integration/staking/types"

export class StakedTokenImpl implements StakedToken {
  token: FT
  neurons: Array<NFIDNeuron>

  constructor(token: FT, neurons: Array<NFIDNeuron>) {
    this.token = token
    this.neurons = neurons
  }

  getStaked(): bigint {
    return this.neurons.reduce((sum, neuron) => {
      return sum + neuron.getInitialStake()
    }, BigInt(0))
  }

  getStakedFormatted(): TokenValue {
    const totalAmount = BigNumber(this.getStaked().toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => totalAmount,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(totalAmount) || "Not listed",
    }
  }

  getRewards(): bigint {
    return this.neurons.reduce((sum, neuron) => {
      return sum + neuron.getRewards()
    }, BigInt(0))
  }

  getRewardsFormatted(): TokenValue {
    const totalAmount = BigNumber(this.getRewards().toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => totalAmount,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(totalAmount) || "Not listed",
    }
  }

  getStakingBalance(): bigint {
    return this.getRewards() + this.getStaked()
  }

  getStakingBalanceFormatted(): TokenValue {
    const totalAmount = BigNumber(this.getStakingBalance().toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => totalAmount,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(totalAmount) || "Not listed",
    }
  }

  getToken(): FT {
    return this.token
  }

  isDiamond(): boolean {
    return this.neurons.some((neuron) => neuron.isDiamond())
  }

  getAvailable(): Array<NFIDNeuron> {
    return this.neurons.filter(
      (neuron) =>
        neuron.getLockTime() &&
        neuron.getLockTime() + neuron.getCreatedAt() <=
          Math.floor(Date.now() / 1000),
    )
  }

  getUnlocking(): Array<NFIDNeuron> {
    return this.neurons.filter((neuron) => neuron.getUnlockIn())
  }

  getLocked(): Array<NFIDNeuron> {
    return this.neurons.filter(
      (neuron) =>
        neuron.getLockTime() + neuron.getCreatedAt() >
        Math.floor(Date.now() / 1000),
    )
  }

  // getSnsNeuronState(dissolveState: DissolveState): StakingState {
  //   const state = fromNullable(dissolveState)
  //   if (dissolveState === undefined) {
  //     return NeuronState.Dissolved
  //   }
  //   if ("DissolveDelaySeconds" in dissolveState) {
  //     return dissolveState.DissolveDelaySeconds === BigInt(0)
  //       ? // 0 = already dissolved (more info: https://gitlab.com/dfinity-lab/public/ic/-/blob/master/rs/nns/governance/src/governance.rs#L827)
  //         NeuronState.Dissolved
  //       : NeuronState.Locked
  //   }
  //   if ("WhenDissolvedTimestampSeconds" in dissolveState) {
  //     // In case `nowInSeconds` ever changes and doesn't return an integer we use Math.floor
  //     return dissolveState.WhenDissolvedTimestampSeconds <
  //       BigInt(Math.floor(nowInSeconds()))
  //       ? NeuronState.Dissolved
  //       : NeuronState.Dissolving
  //   }
  //   return NeuronState.Unspecified
  // }
}
