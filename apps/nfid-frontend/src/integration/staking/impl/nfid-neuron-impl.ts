import { SignIdentity } from "@dfinity/agent"
import { Neuron } from "@dfinity/sns/dist/candid/sns_governance"
import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { bytesToHexString } from "src/integration/staking/service/staking-service-impl"

import { disburse } from "@nfid/integration"
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

  getLockTime(): number {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return 0

    if ("DissolveDelaySeconds" in dissolveState) {
      return Number(dissolveState.DissolveDelaySeconds)
    }

    return 0
  }

  getLockTimeInMonths(): number {
    return Math.round(this.getLockTime() / SECONDS_PER_MONTH)
  }

  getUnlockIn(): number {
    return 1742208516
  }

  getUnlockInFormatted(): FormattedDate {
    const unlockIn = this.getUnlockIn()

    return {
      getDate: () =>
        new Date(unlockIn).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      getTime: () =>
        new Date(unlockIn).toLocaleTimeString("en-US", {
          hour12: true,
        }),
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

  startUnlocking(): Promise<void> {
    throw new Error("Method not implemented.")
  }

  stopUnlocking(): Promise<void> {
    throw new Error("Method not implemented.")
  }

  isDiamond(): boolean {
    console.log(this.getLockTime(), this.neuron)
    return false
    //return this.getLockTime() === 1
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
