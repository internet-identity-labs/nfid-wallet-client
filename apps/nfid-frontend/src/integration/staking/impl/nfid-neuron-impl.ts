import { SignIdentity } from "@dfinity/agent"
import { NeuronState, Followees as IcpFollowees } from "@dfinity/nns"
import { Followees, NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import { StakeParamsCalculator } from "../stake-params-calculator"
import { FormattedDate, TokenValue } from "../types"

const SECONDS_PER_MONTH = 30 * 24 * 60 * 60
const MILISECONDS_PER_SECOND = 1000
const PROTOCOL_FEE_MULTIPLIER = new BigNumber(875).dividedBy(100000)

export abstract class NfidNeuronImpl<T> implements NFIDNeuron {
  protected neuron: T
  protected token: FT
  protected params?: StakeParamsCalculator

  constructor(neuron: T, token: FT, params?: StakeParamsCalculator) {
    this.neuron = neuron
    this.token = token
    this.params = params
  }

  abstract getState(): NeuronState

  abstract getFollowees(): [bigint, Followees][] | IcpFollowees[]

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

  getUnlockInMonths(): string | undefined {
    if (this.getState() === NeuronState.Dissolved) return
    const unlockTimestamp = this.getUnlockIn()
    if (unlockTimestamp === undefined) return

    const now = new Date()
    const unlockDate = new Date(unlockTimestamp * MILISECONDS_PER_SECOND)

    let months =
      (unlockDate.getFullYear() - now.getFullYear()) * 12 +
      (unlockDate.getMonth() - now.getMonth())

    let days = unlockDate.getDate() - now.getDate()

    if (days < 0) {
      months -= 1

      const prevMonthDate = new Date(
        unlockDate.getFullYear(),
        unlockDate.getMonth(),
        0,
      )
      days += prevMonthDate.getDate()
    }

    const parts: string[] = []

    if (months > 0) {
      parts.push(`${months} month${months !== 1 ? "s" : ""}`)
    }

    if (days > 0) {
      parts.push(`${days} day${days !== 1 ? "s" : ""}`)
    }

    return parts.length > 0 ? parts.join(", ") : "less than a day"
  }

  getUnlockInFormatted(): FormattedDate | undefined {
    if (this.getState() === NeuronState.Dissolved) return
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
