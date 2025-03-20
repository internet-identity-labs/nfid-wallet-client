import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakedToken } from "src/integration/staking/staked-token"
import { TokenValue } from "src/integration/staking/types/token-value"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

export class StakedTokenImpl implements StakedToken {
  token: FT
  neurons: Array<NFIDNeuron>

  constructor(token: FT, neurons: Array<NFIDNeuron>) {
    this.token = token
    this.neurons = neurons
  }

  getStaked(): TokenValue {
    const totalStake = this.neurons.reduce((sum, neuron) => {
      return sum + neuron.getInitialStake()
    }, BigInt(0))

    const totalAmount = BigNumber(totalStake.toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => `${totalAmount} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(totalAmount) || "Not listed",
    }
  }

  getRewards(): TokenValue {
    const totalRewards = this.neurons.reduce((sum, neuron) => {
      return sum + neuron.getRewards()
    }, BigInt(0))

    const totalAmount = BigNumber(totalRewards.toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => `${totalAmount} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(totalAmount) || "Not listed",
    }
  }

  getStakingBalance(): TokenValue {
    throw new Error("Method not implemented.")
  }

  getToken(): FT {
    return this.token
  }

  isDiamond(): boolean {
    throw new Error("Method not implemented.")
  }

  getAvailable(): Array<NFIDNeuron> {
    return this.neurons.filter(
      (neuron) =>
        neuron.getLockTime() + neuron.getCreatedAt() <=
        Math.floor(Date.now() / 1000),
    )
  }

  getUnlocking(): Array<NFIDNeuron> {
    return []
  }

  getLocked(): Array<NFIDNeuron> {
    return this.neurons.filter(
      (neuron) =>
        neuron.getLockTime() + neuron.getCreatedAt() >
        Math.floor(Date.now() / 1000),
    )
  }
}
