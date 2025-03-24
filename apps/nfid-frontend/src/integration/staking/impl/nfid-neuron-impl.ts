import { SignIdentity } from "@dfinity/agent"
import { Neuron } from "@dfinity/sns/dist/candid/sns_governance"
import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { bytesToHexString } from "src/integration/staking/service/staking-service-impl"

import { disburse, startDissolving, stopDissolving } from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import { FormattedDate, TokenValue } from "../types"

const SECONDS_PER_MONTH = 30 * 24 * 60 * 60
const MILISECONDS_PER_SECOND = 1000

export class NfidNeuronImpl implements NFIDNeuron {
  private neuron: Neuron
  private token: FT

  constructor(neuron: Neuron, token: FT) {
    this.neuron = neuron
    this.token = token
  }

  getStakeId(): string {
    return bytesToHexString(this.neuron.id[0]!.id)
  }

  getInitialStake(): bigint {
    return this.neuron.cached_neuron_stake_e8s
  }

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

  getRewards(): bigint {
    return this.neuron.maturity_e8s_equivalent
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
    return this.getRewards() + this.getInitialStake()
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

  getLockTime(): number | undefined {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return 0

    if ("DissolveDelaySeconds" in dissolveState) {
      return Number(dissolveState.DissolveDelaySeconds)
    }

    return
  }

  getLockTimeInMonths(): number | undefined {
    const lockTime = this.getLockTime()
    if (lockTime === undefined) return
    return Math.round(lockTime / SECONDS_PER_MONTH)
  }

  getUnlockIn(): number {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return 0

    if ("WhenDissolvedTimestampSeconds" in dissolveState) {
      return Number(dissolveState.WhenDissolvedTimestampSeconds)
    }

    return 0
  }

  getUnlockInMonths(): number {
    return Math.round(
      this.getUnlockIn() / SECONDS_PER_MONTH / MILISECONDS_PER_SECOND,
    )
  }

  getUnlockInFormatted(): FormattedDate {
    const unlocking = this.getUnlockIn()

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

  getCreatedAt(): number {
    return Number(this.neuron.created_timestamp_seconds)
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

  async startUnlocking(signIdentity: SignIdentity): Promise<void> {
    const rootCanisterId = this.token.getRootSnsCanister()
    if (!rootCanisterId) return

    await startDissolving({
      identity: signIdentity,
      rootCanisterId: rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })
  }

  async stopUnlocking(signIdentity: SignIdentity): Promise<void> {
    const rootCanisterId = this.token.getRootSnsCanister()
    if (!rootCanisterId) return

    await stopDissolving({
      identity: signIdentity,
      rootCanisterId: rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })
  }

  isDiamond(): boolean {
    return false
  }

  async redeem(signIdentity: SignIdentity): Promise<void> {
    const rootCanisterId = this.token.getRootSnsCanister()
    if (!rootCanisterId) return

    await disburse({
      identity: signIdentity,
      rootCanisterId: rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })
  }
}
