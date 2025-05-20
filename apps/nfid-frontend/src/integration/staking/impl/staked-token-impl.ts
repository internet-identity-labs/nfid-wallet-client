import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakedToken } from "src/integration/staking/staked-token"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { TokenValue } from "frontend/integration/staking/types"

const MILISECONDS_PER_SECOND = 1000

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
    return this.neurons.filter((neuron) => {
      const lockTime = neuron.getLockTime()

      return (
        lockTime !== undefined &&
        lockTime + neuron.getCreatedAt() <=
          Math.floor(Date.now() / MILISECONDS_PER_SECOND) &&
        // TODO: research why the redeemed stakes are not deleted
        Number(neuron.getInitialStake()) > 0
      )
    })
  }

  getUnlocking(): Array<NFIDNeuron> {
    return this.neurons.filter((neuron) => neuron.getUnlockIn())
  }

  getLocked(): Array<NFIDNeuron> {
    return this.neurons.filter((neuron) => {
      const lockTime = neuron.getLockTime()

      return (
        lockTime !== undefined &&
        lockTime + neuron.getCreatedAt() >
          Math.floor(Date.now() / MILISECONDS_PER_SECOND)
      )
    })
  }
}
