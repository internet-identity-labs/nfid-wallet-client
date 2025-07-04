import { NeuronState } from "@dfinity/nns"
import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakedToken } from "src/integration/staking/staked-token"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { TokenValue } from "frontend/integration/staking/types"

export class StakedTokenImpl implements StakedToken {
  protected token: FT
  protected neurons: NFIDNeuron[]

  constructor(token: FT, neurons: NFIDNeuron[]) {
    this.token = token
    this.neurons = neurons
  }

  getAvailable(): NFIDNeuron[] {
    return this.neurons.filter(
      (neuron) => neuron.getState() === NeuronState.Dissolved,
    )
  }

  getUnlocking(): NFIDNeuron[] {
    return this.neurons.filter(
      (neuron) => neuron.getState() === NeuronState.Dissolving,
    )
  }

  getLocked(): NFIDNeuron[] {
    return this.neurons.filter(
      (neuron) => neuron.getState() === NeuronState.Locked,
    )
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
}
