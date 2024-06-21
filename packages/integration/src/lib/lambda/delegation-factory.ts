import { Principal } from "@dfinity/principal"

import { delegationFactory } from "@nfid/integration"

import {
  GetDelegationResponse,
  Timestamp,
  UserKey,
} from "../_ic_api/delegation_factory.d"

export type PrepareDelegationArgs = {
  userNumber: bigint
  frontendHostname: string
  sessionKey: Uint8Array
  maxTimeToLive: [] | [bigint]
}

export async function prepareDelegation(
  args: PrepareDelegationArgs,
): Promise<[UserKey, Timestamp]> {
  return await delegationFactory.prepare_delegation(
    args.userNumber,
    args.frontendHostname,
    args.sessionKey,
    args.maxTimeToLive,
  )
}

export type GetDelegationArgs = {
  userNumber: bigint
  frontendHostname: string
  sessionKey: Uint8Array
  expiration: bigint
}

export async function getDelegation(
  args: GetDelegationArgs,
): Promise<GetDelegationResponse> {
  return await delegationFactory.get_delegation(
    args.userNumber,
    args.frontendHostname,
    args.sessionKey,
    args.expiration,
  )
}

export async function getPrincipal(
  userNumber: bigint,
  frontendHostname: string,
): Promise<Principal> {
  return await delegationFactory.get_principal(userNumber, frontendHostname)
}
