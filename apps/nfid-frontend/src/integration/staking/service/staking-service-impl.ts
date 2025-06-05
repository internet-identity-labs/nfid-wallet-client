import { SignIdentity } from "@dfinity/agent"
import { NeuronId as NeuronICPId, NeuronInfo, Topic } from "@dfinity/nns"
import { Principal } from "@dfinity/principal"
import { SnsNeuronId, SnsRootCanister } from "@dfinity/sns"
import { Neuron } from "@dfinity/sns/dist/candid/sns_governance"
import { hexStringToUint8Array } from "@dfinity/utils"
import { BigNumber } from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { getNetworkEconomicsParameters } from "packages/integration/src/lib/staking/governance.api"
import { ftService } from "src/integration/ft/ft-service"
import { StakingService } from "src/integration/staking/staking-service"

import {
  autoStakeMaturity,
  increaseDissolveDelay,
  listNNSFunctions,
  nervousSystemParameters,
  queryICPNeurons,
  querySnsNeurons,
  setFollowees,
  stakeNeuron,
  stakeICPNeuron,
  autoICPStakeMaturity,
  increaseICPDissolveDelay,
  setICPFollowees,
} from "@nfid/integration"
import {
  ICP_CANISTER_ID,
  ICP_GOV_CANISTER_ID,
  ICP_ROOT_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { FT } from "frontend/integration/ft/ft"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { StakeICPParamsCalculatorImpl } from "../calculator/stake-icp-params-calculator-impl"
import { StakeSnsParamsCalculatorImpl } from "../calculator/stake-sns-params-calculator"
import { NfidICPNeuronImpl } from "../impl/nfid-icp-neuron-impl"
import { NfidSNSNeuronImpl } from "../impl/nfid-sns-neuron-impl"
import { StakedICPTokenImpl } from "../impl/staked-icp-token-impl"
import { StakedSnsTokenImpl } from "../impl/staked-sns-token-impl"
import { StakedToken } from "../staked-token"
import { IStakingDelegates, TotalBalance } from "../types"

export class StakingServiceImpl implements StakingService {
  @Cache(integrationCache, { ttl: 300, calculateKey: () => "getStakedTokens" })
  async getStakedTokens(
    userId: string,
    publicKey: string,
    identity: SignIdentity,
  ): Promise<Array<StakedToken>> {
    const principal = Principal.fromText(publicKey)
    const tokens = await ftService.getTokens(userId)

    const snsTokens = tokens.filter(
      (token) => token.getTokenCategory() === Category.Sns,
    )

    const icpToken = await tokens
      .find((token) => token.getTokenAddress() === ICP_CANISTER_ID)!
      .init(principal)

    const icpPromise = this.getStakedICPNeurons(icpToken, identity)

    const snsPromises = snsTokens
      .map(async (token) => {
        if (!token.isInited()) {
          await token.init(principal)
        }
        const root = token.getRootSnsCanister()
        if (!root) return undefined
        return this.getStakedNeurons(token, identity)
      })
      .filter((neurons) => neurons !== undefined)

    const [icpStakedToken, snsStakedTokensNested] = await Promise.all([
      icpPromise,
      Promise.all(snsPromises),
    ])

    const snsStakedTokens = snsStakedTokensNested.flat()

    const allStakedTokens = [icpStakedToken, ...snsStakedTokens].filter(
      Boolean,
    ) as StakedToken[]

    return allStakedTokens
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
      staked: totalStaked.toFixed(2),
      rewards: totalRewards.toFixed(2),
      total: totalBalance.toFixed(2),
    }
  }

  async getStakeCalculator(
    token: FT,
    delegation: SignIdentity,
  ): Promise<StakeParamsCalculator | undefined> {
    const rootCanisterId = token.getRootSnsCanister()
    if (!rootCanisterId) return

    if (rootCanisterId.toText() !== ICP_ROOT_CANISTER_ID) {
      const snsParams = await nervousSystemParameters({
        rootCanisterId,
        identity: delegation,
        certified: false,
      })

      return new StakeSnsParamsCalculatorImpl(token, snsParams)
    } else {
      const icpParams = await getNetworkEconomicsParameters({
        identity: delegation,
        certified: false,
      })

      return new StakeICPParamsCalculatorImpl(token, icpParams)
    }
  }

  async getTargets(rootCanisterId: Principal) {
    let canisterId
    if (rootCanisterId.toText() === ICP_ROOT_CANISTER_ID) {
      canisterId = ICP_GOV_CANISTER_ID
    } else {
      try {
        const root = SnsRootCanister.create({ canisterId: rootCanisterId })
        const canister_ids = await root.listSnsCanisters({ certified: false })
        canisterId = canister_ids.governance[0]?.toText()
      } catch (e) {
        console.error("getTargets error: ", e)
        return
      }
    }

    return canisterId
  }

  async stake(
    token: FT,
    amount: string,
    delegation: SignIdentity,
    lockTime?: number,
  ): Promise<SnsNeuronId> {
    const root = token.getRootSnsCanister()
    if (!root) {
      throw new Error("Root Canister not found")
    }
    const amountInE8S = BigNumber(Number(amount)).multipliedBy(
      10 ** token.getTokenDecimals(),
    )

    const id = await stakeNeuron({
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

    if (lockTime) {
      await increaseDissolveDelay({
        identity: delegation,
        rootCanisterId: root,
        neuronId: id,
        additionalDissolveDelaySeconds: lockTime,
      })
    }

    await this.followNeurons(delegation, root, id)
    return id
  }

  async stakeICP(
    token: FT,
    amount: string,
    identity: SignIdentity,
    fee: bigint,
    lockTime?: number,
  ): Promise<NeuronICPId> {
    const amountInE8S = BigNumber(Number(amount)).multipliedBy(
      10 ** token.getTokenDecimals(),
    )

    const id = await stakeICPNeuron({
      stake: BigInt(amountInE8S.toFixed()),
      controller: identity.getPrincipal(),
      ledgerCanisterIdentity: identity,
      identity: identity,
      fee,
    })

    await autoICPStakeMaturity({
      neuronId: id,
      autoStake: true,
      identity: identity,
    })

    if (lockTime) {
      await increaseICPDissolveDelay({
        neuronId: id,
        dissolveDelayInSeconds: lockTime,
        identity,
      })
    }

    await this.followICPNeurons(identity, id.toString())

    return id
  }

  private async getStakedNeurons(
    token: FT,
    identity: SignIdentity,
  ): Promise<StakedToken | undefined> {
    try {
      const [neurons, params] = await Promise.all([
        this.getNeurons(token, identity.getPrincipal()),
        this.getStakeCalculator(token, identity),
      ])
      const nfidN = neurons
        .filter((neuron) => neuron.cached_neuron_stake_e8s > BigInt(0))
        .map((neuron) => new NfidSNSNeuronImpl(neuron, token, params))
      return nfidN.length ? new StakedSnsTokenImpl(token, nfidN) : undefined
    } catch (e) {
      console.error("getStakedSNSNeurons error: ", e)
      return
    }
  }

  private async getStakedICPNeurons(
    token: FT,
    identity: SignIdentity,
  ): Promise<StakedToken | undefined> {
    try {
      const [neurons, params] = await Promise.all([
        this.getICPNeurons(identity),
        this.getStakeCalculator(token, identity),
      ])
      const nfidN = neurons
        .filter((neuron) => neuron.fullNeuron!.cachedNeuronStake > BigInt(0))
        .map((neuron) => new NfidICPNeuronImpl(neuron, token, params))
      return nfidN.length ? new StakedICPTokenImpl(token, nfidN) : undefined
    } catch (e) {
      console.error("getStakedICPNeurons error: ", e)
      return
    }
  }

  private async getNeurons(
    token: FT,
    principal: Principal,
  ): Promise<Array<Neuron>> {
    return querySnsNeurons({
      identity: principal,
      rootCanisterId: token.getRootSnsCanister()!,
      certified: false,
    })
  }

  private async getICPNeurons(
    identity: SignIdentity,
  ): Promise<Array<NeuronInfo>> {
    return queryICPNeurons({
      identity,
      includeEmptyNeurons: false,
      certified: false,
    })
  }

  async getDelegates(
    identity: SignIdentity,
    root: Principal,
  ): Promise<IStakingDelegates> {
    return await listNNSFunctions({
      identity: identity,
      rootCanisterId: root,
    })
  }

  async followNeurons(
    delegation: SignIdentity,
    root: Principal,
    rootNeuron: SnsNeuronId,
  ) {
    let neuronsToFollow = await icrc1OracleService.getAllNeurons()
    neuronsToFollow = neuronsToFollow.filter(
      (n) => n.rootCanister === root.toText(),
    )
    const delegates = await this.getDelegates(delegation, root)

    if (neuronsToFollow.length > 0) {
      for (const neuron of neuronsToFollow) {
        const neurnonId: SnsNeuronId = {
          id: hexStringToUint8Array(neuron.neuron_id),
        }
        for (const d of delegates.functions) {
          setFollowees({
            identity: delegation,
            functionId: d.id,
            rootCanisterId: root,
            neuronId: rootNeuron,
            followees: [neurnonId],
          })
        }
      }
    }
  }

  private async getStakedNeurons(
    token: FT,
    identity: SignIdentity,
    principal: Principal,
  ): Promise<StakedToken | undefined> {
    let neurons = await this.getNeurons(token, userId)
    let nfidN = neurons.map(
      (neuron) =>
        new NfidNeuronImpl(neuron as any, token.getRootSnsCanister()!),
    )
    return nfidN.length ? new StakedTokenImpl(token, nfidN) : undefined
  }

  private async getNeurons(
    token: FT,
    identity: SignIdentity,
  ): Promise<Neuron[]> {
    return token.getTokenCategory() === Category.ChainFusion
      ? queryICPNeurons({
          identity,
          includeEmptyNeurons: false,
          certified: false,
        })
      : (queryICPNeurons({
          identity,
          includeEmptyNeurons: false,
          certified: false,
        }) as any)
  }
}

export const bytesToHexString = (bytes: Uint8Array | number[]): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

export const stakingService = new StakingServiceImpl()
