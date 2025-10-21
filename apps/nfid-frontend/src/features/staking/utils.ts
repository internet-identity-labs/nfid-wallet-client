import { SignIdentity } from "@dfinity/agent"
import { Followees as IcpFollowees } from "@dfinity/nns"
import { Principal } from "@dfinity/principal"
import { Followees } from "@dfinity/sns/dist/candid/sns_governance"

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
