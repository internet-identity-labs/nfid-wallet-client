import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { SnsRootCanister } from "@dfinity/sns"
import { BigNumber } from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { ftService } from "src/integration/ft/ft-service"
import { NfidNeuronImpl } from "src/integration/staking/impl/nfid-neuron-impl"
import { StakedTokenImpl } from "src/integration/staking/impl/staked-token-impl"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakingService } from "src/integration/staking/staking-service"

import {
  autoStakeMaturity,
  increaseDissolveDelay,
  nervousSystemParameters,
  querySnsNeurons,
  stakeNeuron,
} from "@nfid/integration"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { StakeParamsCalculatorImpl } from "../calculator/stake-params-calculator-impl"
import { StakedToken } from "../staked-token"
import { TotalBalance } from "../types"

export class StakingServiceImpl implements StakingService {
  @Cache(integrationCache, { ttl: 300 })
  async getStakedTokens(
    userId: string,
    publicKey: string,
  ): Promise<Array<StakedToken>> {
    const principal = Principal.fromText(publicKey)
    const snsTokens = await ftService
      .getTokens(userId)
      .then((tokens) =>
        tokens.filter((token) => token.getTokenCategory() === Category.Sns),
      )

    let promises = snsTokens
      .map(async (token) => {
        if (!token.isInited()) {
          await token.init(principal)
        }
        const root = token.getRootSnsCanister()
        if (!root) return undefined

        return querySnsNeurons({
          identity: principal,
          rootCanisterId: token.getRootSnsCanister()!,
          certified: false,
        })
          .then((neurons) => {
            let nfidN = neurons.map(
              (neuron) => new NfidNeuronImpl(neuron, token),
            )
            return nfidN.length ? new StakedTokenImpl(token, nfidN) : undefined
          })
          .catch(() => {
            return
          })
      })
      .filter((neurons) => neurons !== undefined)

    return await Promise.all(promises).then((tokens) =>
      tokens.filter((token) => token !== undefined),
    )
  }

  getTotalBalances(stakedTokens: StakedToken[]): TotalBalance | undefined {
    if (!stakedTokens.length) return

    const totalStaked = stakedTokens.reduce(
      (sum, t) => sum + parseFloat(t.getStakedFormatted().getUSDValue()),
      0,
    )

    const totalRewards = stakedTokens.reduce(
      (sum, t) => sum + parseFloat(t.getRewardsFormatted().getUSDValue()),
      0,
    )

    const totalBalance = stakedTokens.reduce(
      (sum, t) =>
        sum + parseFloat(t.getStakingBalanceFormatted().getUSDValue()),
      0,
    )
    return {
      staked: totalStaked.toString(),
      rewards: totalRewards.toString(),
      total: totalBalance.toString(),
    }
  }

  async getStakeCalculator(
    token: FT,
    delegation: SignIdentity,
  ): Promise<StakeParamsCalculator | undefined> {
    const rootCanisterId = token.getRootSnsCanister()
    if (!rootCanisterId) return
    const params = await nervousSystemParameters({
      rootCanisterId,
      identity: delegation,
      certified: false,
    })

    return new StakeParamsCalculatorImpl(token, params)
  }

  async getTargets(rootCanisterId: Principal) {
    let root = SnsRootCanister.create({ canisterId: rootCanisterId })
    const canister_ids = await root.listSnsCanisters({ certified: false })

    return canister_ids.governance[0]?.toText()
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

    await autoStakeMaturity({
      neuronId: id,
      rootCanisterId: root,
      identity: delegation,
      autoStake: true,
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
        additionalDissolveDelaySeconds: lockTime,
      })
    }

    return new NfidNeuronImpl(createdNeuron, token)
  }
}

export const bytesToHexString = (bytes: Uint8Array | number[]): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

export const stakingService = new StakingServiceImpl()
