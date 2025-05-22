import { SignIdentity } from "@dfinity/agent"
import { NeuronState } from "@dfinity/nns"
import { NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import { FormattedDate, TokenValue } from "../types"

const SECONDS_PER_MONTH = 30 * 24 * 60 * 60
const MILISECONDS_PER_SECOND = 1000
const PROTOCOL_FEE_MULTIPLIER = new BigNumber(875).dividedBy(100000)

export abstract class NfidNeuronImpl<T> implements NFIDNeuron {
  protected neuron: T
  protected token: FT

  constructor(neuron: T, token: FT) {
    this.neuron = neuron
    this.token = token
  }

  abstract getState(): NeuronState

  abstract getStakeId(): NeuronId | bigint

  abstract getStakeIdFormatted(): string

  abstract getInitialStake(): bigint

  abstract getLockTime(): number | undefined

  abstract getUnlockIn(): number | undefined

  abstract getRewards(): bigint

  abstract getCreatedAt(): number

  abstract startUnlocking(signIdentity: SignIdentity): Promise<void>

  abstract stopUnlocking(signIdentity: SignIdentity): Promise<void>

  abstract isDiamond(): boolean

  abstract redeem(signIdentity: SignIdentity): Promise<void>

  getToken(): FT {
    return this.token
  }

  getInitialStakeFormatted(): TokenValue {
    const tokenAmount = BigNumber(this.getInitialStake().toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => `${tokenAmount} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(tokenAmount) || "Not listed",
    }
  }

  getRewardsFormatted(): TokenValue {
    const rewardsAmount = BigNumber(this.getRewards().toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => `${rewardsAmount} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(rewardsAmount) || "Not listed",
    }
  }

  getTotalValue(): bigint {
    return this.getRewards() + this.getInitialStake() - this.getProtocolFee()
  }

  getTotalValueFormatted(): TokenValue {
    const totalAmount = BigNumber(this.getTotalValue().toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => `${totalAmount} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(totalAmount) || "Not listed",
    }
  }

  getProtocolFee(): bigint {
    const fee = new BigNumber(this.getRewards().toString()).multipliedBy(
      PROTOCOL_FEE_MULTIPLIER,
    )
    return BigInt(fee.toString())
  }

  getProtocolFeeFormatted(): TokenValue {
    const protocolFee = BigNumber(this.getProtocolFee().toString())
      .div(10 ** this.token.getTokenDecimals())
      .toFixed(this.token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      getTokenValue: () => `${protocolFee} ${this.token.getTokenSymbol()}`,
      getUSDValue: () =>
        this.token.getTokenRateFormatted(protocolFee) || "Not listed",
    }
  }

  getLockTimeInMonths(): number | undefined {
    const lockTime = this.getLockTime()
    if (lockTime === undefined) return
    return Math.round(lockTime / SECONDS_PER_MONTH)
  }

  getUnlockInMonths(): number | undefined {
    const unlockTime = this.getUnlockIn()
    if (unlockTime === undefined) return
    return Math.round(unlockTime / SECONDS_PER_MONTH / MILISECONDS_PER_SECOND)
  }

  getUnlockInFormatted(): FormattedDate | undefined {
    const unlocking = this.getUnlockIn()
    if (unlocking === undefined) return

    return {
      getDate: () =>
        new Date(unlocking * MILISECONDS_PER_SECOND).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "2-digit",
            year: "numeric",
          },
        ),
      getTime: () =>
        new Date(unlocking * MILISECONDS_PER_SECOND).toLocaleTimeString(
          "en-US",
          {
            hour12: true,
          },
        ),
    }
  }

  getCreatedAtFormatted(): FormattedDate {
    const createdAt = this.getCreatedAt()

    return {
      getDate: () =>
        new Date(createdAt * MILISECONDS_PER_SECOND).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "2-digit",
            year: "numeric",
          },
        ),
      getTime: () =>
        new Date(createdAt * MILISECONDS_PER_SECOND).toLocaleTimeString(
          "en-US",
          {
            hour12: true,
          },
        ),
    }
  }
}
