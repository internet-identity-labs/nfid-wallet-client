import { AnonymousIdentity, SignIdentity } from "@icp-sdk/core/agent"
import { Followees as IcpFollowees } from "@icp-sdk/canisters/nns"
import { Principal } from "@icp-sdk/core/principal"
import { type SnsGovernanceDid } from "@icp-sdk/canisters/sns"
type Followees = SnsGovernanceDid.Followees

import { listNNSFunctions } from "@nfid/integration"
import { ICP_ROOT_CANISTER_ID } from "@nfid/integration/token/constants"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import {
  IStakingDelegates,
  IStakingICPDelegates,
} from "frontend/integration/staking/types"

import { FT } from "frontend/integration/ft/ft"

export const fetchStakedTokens = async (tokens: FT[], refetch?: boolean) => {
  return await stakingService.getStakedTokens(
    getWalletDelegation(),
    tokens,
    refetch,
  )
}

export const fetchViewOnlyStakedTokens = async (
  address: string,
  tokens: FT[],
) => {
  return await stakingService.getViewOnlyStakedTokens(
    Principal.fromText(address),
    tokens,
  )
}

export const fetchDelegates = async (
  identity?: SignIdentity,
  root?: Principal,
) => {
  if (!identity || !root) return

  if (root.toText() === ICP_ROOT_CANISTER_ID) {
    return stakingService.getICPDelegates()
  }
  return stakingService.getDelegates(identity, root)
}

export const fetchViewOnlyDelegates = async (root?: Principal) => {
  if (!root || root.toText() === ICP_ROOT_CANISTER_ID) return
  return listNNSFunctions({
    identity: new AnonymousIdentity(),
    rootCanisterId: root,
  })
}

export const isSNSFollowees = (
  followees: [bigint, Followees][] | IcpFollowees[] | undefined,
  delegates: IStakingDelegates | IStakingICPDelegates | undefined,
): followees is [bigint, Followees][] => {
  return (
    Array.isArray(followees) &&
    Array.isArray(followees[0]) &&
    delegates !== undefined &&
    "functions" in delegates
  )
}
