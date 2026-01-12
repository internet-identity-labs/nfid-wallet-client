import { Agent, Identity } from "@dfinity/agent"
import type {
  E8s,
  NetworkEconomics,
  NeuronId,
  NeuronInfo,
  Topic,
} from "@dfinity/nns"
import { GovernanceCanister, NeuronVisibility } from "@dfinity/nns"
import { Principal } from "@dfinity/principal"
import { createAgent, nowInBigIntNanoSeconds } from "@dfinity/utils"

import { ledgerCanister } from "./icp-ledger.api"
import { logWithTimestamp } from "./util/dev.utils"

/**
 * COMMON TYPES
 */

// Type for ANY call
type ApiCallParams = {
  identity: Identity
}

// Type for read-only calls.
export type ApiQueryParams = ApiCallParams & {
  certified: boolean
}

// Shared type for calls to manage a neuron
export type ApiManageNeuronParams = ApiCallParams & {
  neuronId: NeuronId
}

export type ApiClaimNeuronParams = ApiCallParams & {
  memo: bigint
  controller: Principal
}

/**
 * API FUNCTIONS
 */

export type ApiQueryNeuronParams = ApiQueryParams & {
  neuronId: NeuronId
}

export const queryNeuron = async ({
  neuronId,
  identity,
  certified,
}: ApiQueryNeuronParams): Promise<NeuronInfo | undefined> => {
  logWithTimestamp(`Querying Neuron call...`)
  const { canister } = await governanceCanister({ identity })

  const response = await canister.getNeuron({
    certified,
    neuronId,
  })
  logWithTimestamp(`Querying Neuron complete.`)
  return response
}

export type ApiIncreaseDissolveDelayParams = ApiManageNeuronParams & {
  dissolveDelayInSeconds: number
}

export const increaseDissolveDelay = async ({
  neuronId,
  dissolveDelayInSeconds,
  identity,
}: ApiIncreaseDissolveDelayParams): Promise<void> => {
  logWithTimestamp(`Increasing Dissolve Delay call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.increaseDissolveDelay({
    neuronId,
    additionalDissolveDelaySeconds: dissolveDelayInSeconds,
  })
  logWithTimestamp(`Increasing Dissolve Delay complete.`)
}

export const joinCommunityFund = async ({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<void> => {
  logWithTimestamp(`Joining Community Fund call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.joinCommunityFund(neuronId)
  logWithTimestamp(`Joining Community Fund complete.`)
}

export const leaveCommunityFund = async ({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<void> => {
  logWithTimestamp(`Leaving Community Fund call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.leaveCommunityFund(neuronId)
  logWithTimestamp(`Leaving Community Fund complete.`)
}

export type ApiAutoStakeMaturityParams = ApiManageNeuronParams & {
  autoStake: boolean
}

export const autoStakeMaturity = async ({
  neuronId,
  autoStake,
  identity,
}: ApiAutoStakeMaturityParams): Promise<void> => {
  logWithTimestamp(`auto stake maturity call...`)

  const {
    canister: { autoStakeMaturity: autoStakeMaturityApi },
  } = await governanceCanister({ identity })

  await autoStakeMaturityApi({
    neuronId,
    autoStake,
  })

  logWithTimestamp(`auto stake maturity complete.`)
}

export type ApiDisburseParams = ApiManageNeuronParams & {
  toAccountId?: string
  amount?: E8s
}

export const disburse = async ({
  neuronId,
  toAccountId,
  amount,
  identity,
}: ApiDisburseParams): Promise<void> => {
  logWithTimestamp(`Disburse neuron  call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.disburse({ neuronId, toAccountId, amount })
  logWithTimestamp(`Disburse neuron complete.`)
}

export type ApiRefreshVotingPowerParams = ApiManageNeuronParams
export const refreshVotingPower = async ({
  neuronId,
  identity,
}: ApiRefreshVotingPowerParams): Promise<void> => {
  logWithTimestamp(`Refresh voting power call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.refreshVotingPower({ neuronId })
  logWithTimestamp(`Refresh voting power complete.`)
}

export type ApiStakeMaturityParams = ApiManageNeuronParams & {
  percentageToStake: number
}

export const stakeMaturity = async ({
  neuronId,
  percentageToStake,
  identity,
}: ApiStakeMaturityParams): Promise<void> => {
  logWithTimestamp(`Stake maturity call...`)

  const {
    canister: { stakeMaturity: stakeMaturityApi },
  } = await governanceCanister({ identity })

  await stakeMaturityApi({ neuronId, percentageToStake })

  logWithTimestamp(`Stake maturity complete.`)
}

export type ApiSpawnNeuronParams = ApiManageNeuronParams & {
  // percentageToSpawn is not yet supported by the ledger IC app
  percentageToSpawn?: number
}

export const spawnNeuron = async ({
  neuronId,
  percentageToSpawn,
  identity,
}: ApiSpawnNeuronParams): Promise<NeuronId> => {
  logWithTimestamp(`Spawn neuron call...`)
  const { canister } = await governanceCanister({ identity })

  const newNeuronId = await canister.spawnNeuron({
    neuronId,
    percentageToSpawn,
  })
  logWithTimestamp(`Spawn neuron complete.`)
  return newNeuronId
}

// Shared by addHotkey and removeHotkey
export type ApiManageHotkeyParams = ApiManageNeuronParams & {
  principal: Principal
}

export const addHotkey = async ({
  neuronId,
  principal,
  identity,
}: ApiManageHotkeyParams): Promise<void> => {
  logWithTimestamp(`Add hotkey (for neuron call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.addHotkey({ neuronId, principal })
  logWithTimestamp(`Add hotkey (for neuron complete.`)
}

export const removeHotkey = async ({
  neuronId,
  principal,
  identity,
}: ApiManageHotkeyParams): Promise<void> => {
  logWithTimestamp(`Remove hotkey (for neuron call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.removeHotkey({ neuronId, principal })
  logWithTimestamp(`Remove hotkey (for neuron complete.`)
}

export type ApiSplitNeuronParams = ApiManageNeuronParams & {
  amount: bigint
}

export const splitNeuron = async ({
  neuronId,
  amount,
  identity,
}: ApiSplitNeuronParams): Promise<NeuronId> => {
  logWithTimestamp(`Splitting Neuron call...`)
  const { canister } = await governanceCanister({ identity })

  const response = await canister.splitNeuron({
    neuronId,
    amount,
  })
  logWithTimestamp(`Splitting Neuron complete.`)
  return response
}

export type ApiMergeNeuronsParams = ApiCallParams & {
  sourceNeuronId: NeuronId
  targetNeuronId: NeuronId
}

export const mergeNeurons = async ({
  sourceNeuronId,
  targetNeuronId,
  identity,
}: ApiMergeNeuronsParams): Promise<void> => {
  logWithTimestamp(`Merging neurons  call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.mergeNeurons({
    sourceNeuronId,
    targetNeuronId,
  })
  logWithTimestamp(`Merging neurons complete.`)
}

export const simulateMergeNeurons = async ({
  sourceNeuronId,
  targetNeuronId,
  identity,
}: ApiMergeNeuronsParams): Promise<NeuronInfo> => {
  try {
    logWithTimestamp(`Simulating merging neurons  call...`)
    const { canister } = await governanceCanister({ identity })
    return await canister.simulateMergeNeurons({
      sourceNeuronId,
      targetNeuronId,
    })
  } finally {
    logWithTimestamp(`Simulating merging neurons  complete.`)
  }
}

export const startDissolving = async ({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<void> => {
  logWithTimestamp(`Starting Dissolving call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.startDissolving(neuronId)
  logWithTimestamp(`Starting Dissolving  complete.`)
}

export const stopDissolving = async ({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<void> => {
  logWithTimestamp(`Stopping Dissolving  call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.stopDissolving(neuronId)
  logWithTimestamp(`Stopping Dissolving complete.`)
}

export type ApiSetFolloweesParams = ApiManageNeuronParams & {
  topic: Topic
  followees: NeuronId[]
}

export const setFollowees = async ({
  identity,
  neuronId,
  topic,
  followees,
}: ApiSetFolloweesParams): Promise<void> => {
  logWithTimestamp(`Setting Followees  call...`)
  const { canister } = await governanceCanister({ identity })

  await canister.setFollowees({
    neuronId,
    topic,
    followees,
  })
  logWithTimestamp(`Setting Followees complete.`)
}

export type ApiQueryNeuronsParams = ApiQueryParams & {
  // undefined is interpreted as true by the backend.
  includeEmptyNeurons?: boolean | undefined
}

export const queryICPNeurons = async ({
  identity,
  certified,
  includeEmptyNeurons,
}: ApiQueryNeuronsParams): Promise<NeuronInfo[]> => {
  logWithTimestamp(`Querying Neurons certified:${certified} call...`)
  const { canister } = await governanceCanister({ identity })

  const response = await canister.listNeurons({
    certified,
    includeEmptyNeurons,
  })
  logWithTimestamp(`Querying Neurons certified:${certified} complete.`)
  return response
}

export type ApiStakeNeuronParams = ApiCallParams & {
  stake: bigint
  controller: Principal
  ledgerCanisterIdentity: Identity
  fee: bigint
}

/**
 * Uses governance and ledger canisters to create a neuron
 */
export const stakeNeuron = async ({
  stake,
  controller,
  identity,
  fee,
}: ApiStakeNeuronParams): Promise<NeuronId> => {
  logWithTimestamp(`Staking Neuron call...`)
  const { canister } = await governanceCanister({ identity })
  const lc = await ledgerCanister({
    identity,
    canisterId: Principal.fromText(LEDGER_CANISTER_ID),
  })

  const createdAt = nowInBigIntNanoSeconds()
  const response = await canister.stakeNeuron({
    stake,
    principal: controller,
    ledgerCanister: lc.canister,
    createdAt,
    fee,
  })
  logWithTimestamp(`Staking Neuron complete.`)
  return response
}

export type ApiStakeNeuronIcrc1Params = ApiCallParams & {
  stake: bigint
  controller: Principal
  ledgerCanisterIdentity: Identity
  fromSubAccount?: Uint8Array
}

export const claimOrRefreshNeuron = async ({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<NeuronId | undefined> => {
  logWithTimestamp(`ClaimingOrRefreshing Neurons call...`)
  const { canister } = await governanceCanister({ identity })

  const response = await canister.claimOrRefreshNeuron({
    neuronId,
    by: { NeuronIdOrSubaccount: {} },
  })
  logWithTimestamp(`ClaimingOrRefreshing Neurons complete.`)
  return response
}

export const claimOrRefreshNeuronByMemo = async ({
  memo,
  controller,
  identity,
}: ApiClaimNeuronParams): Promise<NeuronId | undefined> => {
  logWithTimestamp(`claimOrRefreshNeuronByMemo call...`)
  const { canister } = await governanceCanister({ identity })

  const response = await canister.claimOrRefreshNeuronFromAccount({
    memo,
    controller,
  })
  logWithTimestamp(`claimOrRefreshNeuronByMemo complete.`)
  return response
}

/**
 * CANISTER SERVICE CREATION
 */

// TODO: Apply pattern to other canister instantiation L2-371
export const governanceCanister = async ({
  identity,
}: {
  identity: Identity
}): Promise<{
  canister: GovernanceCanister
  agent: Agent
}> => {
  const agent = await createAgent({
    identity,
    host: IC_HOST,
  })

  const canister = GovernanceCanister.create({
    agent,
    canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
  })

  return {
    canister,
    agent,
  }
}
export type ApiChangeNeuronVisibilityParams = ApiCallParams & {
  neuronIds: NeuronId[]
  visibility: NeuronVisibility
}

export const changeNeuronVisibility = async ({
  neuronIds,
  visibility,
  identity,
}: ApiChangeNeuronVisibilityParams): Promise<void> => {
  logWithTimestamp(
    `Changing visibility for ${neuronIds.length} neurons. IDs: ${neuronIds.join(
      ", ",
    )}. New visibility: ${visibility}`,
  )

  const { canister } = await governanceCanister({ identity })

  await Promise.all(
    neuronIds.map((neuronId) => canister.setVisibility(neuronId, visibility)),
  )

  logWithTimestamp(
    `Visibility change complete for ${
      neuronIds.length
    } neurons. IDs: ${neuronIds.join(", ")}. New visibility: ${visibility}`,
  )
}

export const getNetworkEconomicsParameters = async ({
  identity,
  certified,
}: ApiQueryParams): Promise<NetworkEconomics> => {
  logWithTimestamp(
    `Getting network economics parameters call certified: ${certified}...`,
  )

  const { canister: governance } = await governanceCanister({ identity })
  const response = await governance.getNetworkEconomicsParameters({
    certified,
  })

  logWithTimestamp(
    `Getting network economics parameters call certified: ${certified} complete.`,
  )

  return response
}
