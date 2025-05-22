import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { Neuron, NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import BigNumber from "bignumber.js"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { bytesToHexString } from "src/integration/staking/service/staking-service-impl"

import {
  disburse,
  hasOwnProperty,
  startDissolving,
  stopDissolving,
  TransferArg,
} from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { FT } from "frontend/integration/ft/ft"

import { FormattedDate, TokenValue } from "../types"

const SECONDS_PER_MONTH = 30 * 24 * 60 * 60
const MILISECONDS_PER_SECOND = 1000
const PROTOCOL_FEE_MULTIPLIER = new BigNumber(875).dividedBy(100000)

export class NfidNeuronImpl implements NFIDNeuron {
  private neuron: Neuron
  private token: FT

  constructor(neuron: Neuron, token: FT) {
    this.neuron = neuron
    this.token = token
  }

  getStakeId(): NeuronId {
    return { id: this.neuron.id[0]!.id }
  }

  getStakeIdFormatted(): string {
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

  getLockTime(): number | undefined {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return

    if ("DissolveDelaySeconds" in dissolveState) {
      return Number(dissolveState.DissolveDelaySeconds)
    }
  }

  getLockTimeInMonths(): number | undefined {
    const lockTime = this.getLockTime()
    if (lockTime === undefined) return
    return Math.round(lockTime / SECONDS_PER_MONTH)
  }

  getUnlockIn(): number | undefined {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return

    if ("WhenDissolvedTimestampSeconds" in dissolveState) {
      return Number(dissolveState.WhenDissolvedTimestampSeconds)
    }
  }

  getUnlockInMonths(): string | undefined {
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

  getUnlockInPast(): FormattedDate | undefined {
    const lockTime = this.getLockTime()
    if (lockTime === undefined) return

    if (
      lockTime + this.getCreatedAt() <=
      Math.floor(Date.now() / MILISECONDS_PER_SECOND)
    ) {
      return {
        getDate: () =>
          new Date(
            (this.getCreatedAt() + lockTime) * MILISECONDS_PER_SECOND,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
        getTime: () =>
          new Date(
            (this.getCreatedAt() + lockTime) * MILISECONDS_PER_SECOND,
          ).toLocaleTimeString("en-US", {
            hour12: true,
          }),
      }
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

    const transferArgs: TransferArg = {
      amount: this.getProtocolFee(),
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(NFID_WALLET_CANISTER_STAKING),
      },
    }

    let ledgerCanisterId = await icrc1OracleService
      .getICRC1Canisters()
      .then((canisters) =>
        canisters
          .filter((canister) => canister.root_canister_id.length > 0)
          .find(
            (canister) =>
              canister.root_canister_id[0] === rootCanisterId.toText(),
          ),
      )

    await disburse({
      identity: signIdentity,
      rootCanisterId: rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })

    const result = await transferICRC1(
      signIdentity,
      ledgerCanisterId!.ledger,
      transferArgs,
    )

    if (!hasOwnProperty(result, "Ok")) {
      console.warn(
        "Error transferring protocol fee: " + JSON.stringify(result.Err),
      )
    }
  }
}
