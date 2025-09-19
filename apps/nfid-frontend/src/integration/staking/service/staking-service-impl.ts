import { SignIdentity } from "@dfinity/agent"
import { NeuronId as NeuronICPId, NeuronInfo, Topic } from "@dfinity/nns"
import { NetworkEconomics } from "@dfinity/nns/dist/types/types/governance_converters"
import { Principal } from "@dfinity/principal"
import { SnsNeuronId } from "@dfinity/sns"
import {
  NervousSystemParameters,
  Neuron,
} from "@dfinity/sns/dist/candid/sns_governance"
import { hexStringToUint8Array } from "@dfinity/utils"
import { BigNumber } from "bignumber.js"
import {
  getNetworkEconomicsParameters,
  queryNeuron as queryICPNeuron,
} from "packages/integration/src/lib/staking/governance.api"
import { ftService } from "src/integration/ft/ft-service"
import { tokenManager } from "frontend/features/fungible-token/token-manager"
import { StakingService } from "src/integration/staking/staking-service"

import { storageWithTtl } from "@nfid/client-db"
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
  querySnsNeuron,
} from "@nfid/integration"
import {
  ICP_CANISTER_ID,
  ICP_ROOT_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { FT } from "frontend/integration/ft/ft"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import {
  NNS_NEURON_MAX_DISSOLVE_DELAY_SECONDS,
  StakeICPParamsCalculatorImpl,
} from "../calculator/stake-icp-params-calculator-impl"
import { StakeSnsParamsCalculatorImpl } from "../calculator/stake-sns-params-calculator"
import { NfidICPNeuronImpl } from "../impl/nfid-icp-neuron-impl"
import { NfidSNSNeuronImpl } from "../impl/nfid-sns-neuron-impl"
import { StakedTokenImpl } from "../impl/staked-token-impl"
import { StakedToken } from "../staked-token"
import { IStakingDelegates, IStakingICPDelegates, TotalBalance } from "../types"
import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { getUserPrincipalId } from "frontend/features/fungible-token/utils"

const NEURON_ERROR_TEXT = "No neuron for given NeuronId."
export const stakedTokensCacheName = "StakedTokens"

export class StakingServiceImpl implements StakingService {
  static readonly ICP_DELEGATES: IStakingICPDelegates = {
    [Topic.Unspecified]: "All Except Governance, and SNS & Neurons' Fund",
    [Topic.NeuronManagement]: "Neuron Management",
    [Topic.ExchangeRate]: "Exchange Rate",
    [Topic.NetworkEconomics]: "Network Economics",
    [Topic.Governance]: "Governance",
    [Topic.NodeAdmin]: "Node Admin",
    [Topic.ParticipantManagement]: "Participant Management",
    [Topic.SubnetManagement]: "Subnet Management",
    [Topic.NetworkCanisterManagement]: "Application Canister Management",
    [Topic.Kyc]: "KYC",
    [Topic.NodeProviderRewards]: "Node Provider Rewards",
    [Topic.SnsDecentralizationSale]: "SNS Decentralization Swap",
    [Topic.IcOsVersionDeployment]: "IC OS Version Deployment",
    [Topic.IcOsVersionElection]: "IC OS Version Election",
    [Topic.SnsAndCommunityFund]: "SNS & Neurons' Fund",
    [Topic.ApiBoundaryNodeManagement]: "API Boundary Node Management",
    [Topic.SubnetRental]: "Subnet Rental",
    [Topic.ProtocolCanisterManagement]: "Protocol Canister Management",
    [Topic.ServiceNervousSystemManagement]: "Service Nervous System Management",
  }

  async getStakedTokens(
    userId: string,
    delegation: Promise<SignIdentity>,
    refetch?: boolean,
  ): Promise<Array<StakedToken>> {
    const cache = await storageWithTtl.getEvenExpired(stakedTokensCacheName)

    if (!cache || Boolean(refetch)) {
      const identity = await delegation
      const stakes = await this.fetchStakedTokens(userId, identity)
      storageWithTtl.set(
        stakedTokensCacheName,
        this.serializeStakes(stakes),
        300 * 1000,
      )
      return stakes
    }

    if (cache && cache.expired) {
      delegation.then((data) => {
        this.fetchStakedTokens(userId, data).then((stakes) => {
          storageWithTtl.set(
            stakedTokensCacheName,
            this.serializeStakes(stakes),
            300 * 1000,
          )
        })
      })

      return this.deserializeStakes(cache.value as string, userId)
    }

    return this.deserializeStakes(cache.value as string, userId)
  }

  private async fetchStakedTokens(
    userId: string,
    identity: SignIdentity,
  ): Promise<StakedToken[]> {
    const rawTokens = await ftService.getTokens(userId)
    const tokens = tokenManager.getCachedTokens(rawTokens)

    const snsTokens = tokens.filter(
      (token) => token.getTokenCategory() === Category.Sns,
    )

    const icpToken = await tokenManager.initializeToken(
      tokens.find((token) => token.getTokenAddress() === ICP_CANISTER_ID)!,
    )

    const icpPromise = this.getStakedICPNeurons(icpToken, identity)

    const snsPromises = snsTokens
      .map(async (token) => {
        const initializedToken = await tokenManager.initializeToken(token)
        const root = initializedToken.getRootSnsCanister()
        if (!root) return undefined
        return this.getStakedNeurons(initializedToken, identity)
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

  private serializeStakes(stakes: Array<StakedToken>): string {
    const data = stakes.map((stake) => {
      const concattedStakes = stake
        .getAvailable()
        .concat(stake.getUnlocking())
        .concat(stake.getLocked())
      const params = (concattedStakes[0] as any).params.params
      let maxPeriod

      if (params.max_dissolve_delay_seconds) {
        maxPeriod = params.max_dissolve_delay_seconds[0]
      } else {
        maxPeriod = NNS_NEURON_MAX_DISSOLVE_DELAY_SECONDS
      }

      return {
        token: stake.getToken().getTokenAddress(),
        params: maxPeriod.toString(),
        neurons: concattedStakes.map((n) => n.serialize()),
      }
    })

    return JSON.stringify(data)
  }

  private async deserializeStakes(
    serialized: string,
    userId: string,
  ): Promise<StakedToken[]> {
    const data: Array<{ token: string; neurons: any[]; params: any }> =
      JSON.parse(serialized)

    const rawTokens = await ftService.getTokens(userId)
    const tokens = tokenManager.getCachedTokens(rawTokens)

    return await Promise.all(
      data.map(async (data) => {
        const token = tokens.find((t) => t.getTokenAddress() === data.token)

        const initializedToken = token
          ? await tokenManager.initializeToken(token)
          : undefined
        let params

        if (initializedToken?.getTokenAddress() === ICP_CANISTER_ID) {
          params = new StakeICPParamsCalculatorImpl(
            initializedToken,
            {} as NetworkEconomics,
          )
        } else {
          params = new StakeSnsParamsCalculatorImpl(initializedToken!, {
            max_dissolve_delay_seconds: [BigInt(data.params)],
          } as NervousSystemParameters)
        }

        const neurons = data.neurons.map((raw) =>
          "fullNeuron" in raw
            ? NfidICPNeuronImpl.deserialize(
                raw,
                initializedToken!,
                params as StakeICPParamsCalculatorImpl,
              )
            : NfidSNSNeuronImpl.deserialize(
                raw,
                initializedToken!,
                params as StakeSnsParamsCalculatorImpl,
              ),
        )

        return new StakedTokenImpl(initializedToken!, neurons)
      }),
    )
  }

  async validateNeuron(
    identity: SignIdentity | undefined,
    rootCanisterId: Principal | undefined,
    neuronId: SnsNeuronId,
  ) {
    if (!identity || !rootCanisterId) return NEURON_ERROR_TEXT

    try {
      const neuron = await querySnsNeuron({
        identity,
        rootCanisterId,
        certified: false,
        neuronId,
      })

      if (!neuron) {
        return NEURON_ERROR_TEXT
      }
      return true
    } catch (e) {
      console.error("getNeuron error: ", e)
      return NEURON_ERROR_TEXT
    }
  }

  async validateICPNeuron(
    identity: SignIdentity | undefined,
    neuronId: bigint,
  ) {
    if (!identity) return NEURON_ERROR_TEXT

    try {
      const neuron = await queryICPNeuron({
        neuronId: BigInt(neuronId),
        identity,
        certified: true,
      })

      if (!neuron) {
        return NEURON_ERROR_TEXT
      }
      return true
    } catch (e) {
      console.error("getNeuron error: ", e)
      return NEURON_ERROR_TEXT
    }
  }

  async getStakingUSDBalance(): Promise<
    | {
        value: string
        dayChangePercent?: string
        dayChange?: string
        dayChangePositive?: boolean
        value24h?: string
      }
    | undefined
  > {
    try {
      const { userPrincipal } = await getUserPrincipalId()

      const stakedTokens = await this.getStakedTokens(
        userPrincipal,
        getWalletDelegation(),
        false,
      )

      if (!stakedTokens || stakedTokens.length === 0) {
        return {
          value: "0.00",
          dayChangePercent: "0.00",
          dayChange: "0.00",
          dayChangePositive: true,
          value24h: "0.00",
        }
      }

      const totalBalances = this.getTotalBalances(stakedTokens)
      if (!totalBalances) {
        return {
          value: "0.00",
          dayChangePercent: "0.00",
          dayChange: "0.00",
          dayChangePositive: true,
          value24h: "0.00",
        }
      }

      const totalBalance = new BigNumber(totalBalances.total)
      const dayChange = new BigNumber(0)

      return {
        value: totalBalance.toFixed(2),
        dayChangePercent: "0.00",
        dayChange: dayChange.toFixed(2),
        dayChangePositive: true,
        value24h: totalBalance.toFixed(2),
      }
    } catch (error) {
      console.error("Failed to get staking USD balance:", error)
      return {
        value: "0.00",
        dayChangePercent: "0.00",
        dayChange: "0.00",
        dayChangePositive: true,
        value24h: "0.00",
      }
    }
  }

  getTotalBalances(stakedTokens?: StakedToken[]): TotalBalance | undefined {
    if (!stakedTokens) return

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
      return nfidN.length ? new StakedTokenImpl(token, nfidN) : undefined
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
      return nfidN.length ? new StakedTokenImpl(token, nfidN) : undefined
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

  getICPDelegates(): IStakingICPDelegates {
    return StakingServiceImpl.ICP_DELEGATES
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

  async followICPNeurons(delegation: SignIdentity, id: string) {
    const neuronsToFollow = await icrc1OracleService.getAllNeurons()
    const icpNeuron = neuronsToFollow.find(
      (n) => n.rootCanister === ICP_ROOT_CANISTER_ID,
    )

    for (const t of Object.values(Topic).filter(
      (value) => typeof value === "number",
    ) as number[]) {
      setICPFollowees({
        identity: delegation,
        neuronId: BigInt(id),
        topic: t,
        followees: [BigInt(icpNeuron!.neuron_id)],
      }).catch((e) => {
        console.error(e.detail.error_message)
      })
    }
  }

  async reFollowNeurons(
    neuronToFollow: SnsNeuronId,
    delegation: SignIdentity,
    root: Principal,
    userNeuron: SnsNeuronId,
  ) {
    const delegates = await this.getDelegates(delegation, root)

    for (const d of delegates.functions) {
      setFollowees({
        identity: delegation,
        functionId: d.id,
        rootCanisterId: root,
        neuronId: userNeuron,
        followees: [neuronToFollow],
      })
    }
  }

  async reFollowICPNeurons(
    neuronToFollow: bigint,
    delegation: SignIdentity,
    userNeuron: bigint,
  ) {
    for (const t of Object.values(Topic).filter(
      (value) => typeof value === "number",
    ) as number[]) {
      setICPFollowees({
        identity: delegation,
        neuronId: userNeuron,
        topic: t,
        followees: [neuronToFollow],
      }).catch((e) => {
        console.error(e.detail.error_message)
      })
    }
  }
}

export const bytesToHexString = (bytes: Uint8Array | number[]): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

export const hexStringToBytes = (hex: string): Uint8Array => {
  if (hex.startsWith("0x")) hex = hex.slice(2)
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

export const stakingService = new StakingServiceImpl()
