import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { SnsRootCanister } from "@dfinity/sns"
import { Neuron } from "@dfinity/sns/dist/candid/sns_governance"
import { BigNumber } from "bignumber.js"
import { ftService } from "src/integration/ft/ft-service"
import { NfidNeuronImpl } from "src/integration/staking/impl/nfid-neuron-impl"
import { StakedTokenImpl } from "src/integration/staking/impl/staked-token-impl"
import { NFIDNeuron } from "src/integration/staking/nfid-neuron"
import { StakingService } from "src/integration/staking/staking-service"

import {
  queryICPNeurons,
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

export class StakingServiceImpl implements StakingService {
  async getStakedTokens(userId: SignIdentity): Promise<Array<StakedToken>> {
    const snsTokens = await ftService
      .getTokens(userId.getPrincipal().toText())
      .then((tokens) =>
        tokens.filter(
          (token) =>
            token.getTokenCategory() === Category.Sns ||
            token.getTokenCategory() === Category.ChainFusion,
        ),
      )
    let promises = snsTokens
      .map((token) => {
        return this.getStakedNeurons(token, userId)
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

    let neurons = await this.getNeurons(token, delegation)

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

    return new NfidNeuronImpl(createdNeuron, root)
  }

  private async getStakedNeurons(
    token: FT,
    userId: SignIdentity,
  ): Promise<StakedToken | undefined> {
    let neurons = await this.getNeurons(token, userId);
    let nfidN = neurons.map(
      (neuron) =>
        new NfidNeuronImpl(neuron as any, token.getRootSnsCanister()!),
    )
    return nfidN.length ? new StakedTokenImpl(token, nfidN) : undefined
  }

  private async getNeurons(token: FT, identity: SignIdentity): Promise<Neuron[]> {
    return token.getTokenCategory() === Category.ChainFusion
      ? queryICPNeurons({
          identity,
          includeEmptyNeurons: false,
          certified: false,
        })
      : (querySnsNeurons({
          identity: identity.getPrincipal(),
          rootCanisterId: token.getRootSnsCanister()!,
          certified: false,
        }) as any)
  }
}

export const bytesToHexString = (bytes: Uint8Array | number[]): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

export const stakingService = new StakingServiceImpl()
