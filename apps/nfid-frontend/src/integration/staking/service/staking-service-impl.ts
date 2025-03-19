import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { SnsRootCanister } from "@dfinity/sns"
import { BigNumber } from "bignumber.js"
import { ftService } from "src/integration/ft/ft-service"
import { NfidNeuronImpl } from "src/integration/staking/impl/nfid-neuron-impl"
import { StakedTokenImpl } from "src/integration/staking/impl/staked-token-impl"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakeAprCalculator } from "src/integration/staking/stake-apr-calculator"
import { StakingService } from "src/integration/staking/staking-service"

import {
  increaseDissolveDelay,
  nervousSystemParameters,
  querySnsNeurons,
  stakeNeuron,
} from "@nfid/integration"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"

import { StakedToken } from "../staked-token"
import { StakingParams } from "../types"

const MONTHS_TO_SECONDS = 30 * 24 * 60 * 60

export class StakingServiceImpl implements StakingService {
  async getStakedTokens(userId: string): Promise<Array<StakedToken>> {
    const snsTokens = await ftService
      .getTokens(userId)
      .then((tokens) =>
        tokens.filter((token) => token.getTokenCategory() === Category.Sns),
      )
    let promises = snsTokens
      .map((token) => {
        const root = token.getRootSnsCanister()
        if (!root) {
          return undefined
        }
        return querySnsNeurons({
          identity: Principal.fromText(userId),
          rootCanisterId: token.getRootSnsCanister()!,
          certified: false,
        }).then((neurons) => {
          console.log(neurons)
          let nfidN = neurons.map((neuron) => new NfidNeuronImpl(neuron, root))
          return nfidN.length ? new StakedTokenImpl(token, nfidN) : undefined
        })
      })
      .filter((neurons) => neurons !== undefined)

    return await Promise.all(promises).then((tokens) =>
      tokens.filter((token) => token !== undefined),
    )
  }

  getStaked(): string {
    throw new Error("Method not implemented.")
  }

  getRewards(): string {
    throw new Error("Method not implemented.")
  }

  getStakingBalance(): string {
    throw new Error("Method not implemented.")
  }

  getStakeCalculator(token: FT): StakeAprCalculator {
    throw new Error("Method not implemented.")
  }

  async getTargets(rootCanisterId: Principal) {
    let root = SnsRootCanister.create({ canisterId: rootCanisterId })
    const canister_ids = await root.listSnsCanisters({ certified: false })

    return canister_ids.governance[0]?.toText()
  }

  async getStakingParams(
    token: FT,
    delegation: SignIdentity,
  ): Promise<StakingParams | undefined> {
    const rootCanisterId = token.getRootSnsCanister()
    if (!rootCanisterId) return
    const params = await nervousSystemParameters({
      rootCanisterId,
      identity: delegation,
      certified: false,
    })

    const fee =
      Number(params.transaction_fee_e8s[0]) / 10 ** token.getTokenDecimals()

    return {
      minStakeAmount:
        Number(params.neuron_minimum_stake_e8s[0]) /
        10 ** token.getTokenDecimals(),
      fee: {
        fee: `${fee} ${token.getTokenSymbol()}`,
        feeInUsd: token.getTokenRateFormatted(fee.toString()),
      },
      maxPeriod: Math.round(
        Number(params.max_dissolve_delay_seconds) /
          ((60 * 60 * 24 * 365.25) / 12),
      ),
      minPeriod: Math.round(
        Number(params.neuron_minimum_dissolve_delay_to_vote_seconds) /
          ((60 * 60 * 24 * 365.25) / 12),
      ),
    }
  }

  async stake(
    token: FT,
    amount: string,
    delegation: SignIdentity,
    lockTime?: number,
  ): Promise<NFIDNeuron> {
    let root = token.getRootSnsCanister()
    if (!root) {
      throw new Error("Root Canister not found")
    }
    let amountInE8S = BigNumber(Number(amount)).multipliedBy(
      10 ** token.getTokenDecimals()!,
    )

    let id = await stakeNeuron({
      stake: BigInt(amountInE8S.toFixed()),
      identity: delegation,
      canisterId: root,
    })

    let neurons = await querySnsNeurons({
      identity: delegation.getPrincipal(),
      rootCanisterId: root,
      certified: false,
    })
    let createdNeuron = neurons.find(
      (neuron) =>
        bytesToHexString(neuron.id[0]!.id) === bytesToHexString(id.id),
    )
    if (!createdNeuron) {
      throw new Error("Neuron not found")
    }

    if (lockTime) {
      await increaseDissolveDelay({
        identity: delegation,
        rootCanisterId: root,
        neuronId: id,
        additionalDissolveDelaySeconds: lockTime * MONTHS_TO_SECONDS,
      })
    }

    return new NfidNeuronImpl(createdNeuron, root)
  }
}

export const bytesToHexString = (bytes: Uint8Array | number[]): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

export const stakingService = new StakingServiceImpl()
