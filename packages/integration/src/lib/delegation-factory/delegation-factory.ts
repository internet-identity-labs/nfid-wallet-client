import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { ONE_HOUR_IN_MS } from "@nfid/config"
import { delegationFactory, mapOptional } from "@nfid/integration"

import {
  GetDelegationResponse,
  Timestamp,
  UserKey,
} from "../_ic_api/delegation_factory.d"

import { GetDelegationArgs, PrepareDelegationArgs } from "./types"

export async function getDelegationChainSignedByCanister(
  identity: DelegationIdentity,
  targets: string[] | undefined,
  sessionPublicKey: Uint8Array,
  anchor: bigint,
  origin: string,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
): Promise<DelegationChain> {
  const args: PrepareDelegationArgs = {
    userNumber: anchor,
    frontendHostname: origin,
    sessionKey: sessionPublicKey,
    maxTimeToLive: [BigInt(maxTimeToLive * 1000000)], //to nanoseconds
    targets:
      targets !== undefined && targets.length > 0
        ? [targets.filter((t) => !!t).map((t) => Principal.fromText(t))]
        : [],
  }

  const prepareDelegationResponse = await prepareDelegation(args)

  return getDelegation({
    userNumber: anchor,
    frontendHostname: origin,
    sessionKey: sessionPublicKey,
    expiration: prepareDelegationResponse[1],
    targets:
      targets !== undefined && targets.length > 0
        ? [targets.filter((t) => !!t).map((t) => Principal.fromText(t))]
        : [],
  }).then((r) => {
    if ("signed_delegation" in r) {
      return DelegationChain.fromDelegations(
        [
          {
            delegation: new Delegation(
              new Uint8Array(r.signed_delegation.delegation.pubkey).buffer,
              r.signed_delegation.delegation.expiration,
              mapOptional(r.signed_delegation.delegation.targets),
            ),
            signature: new Uint8Array(r.signed_delegation.signature)
              .buffer as Signature,
          },
        ],
        new Uint8Array(prepareDelegationResponse[0])
          .buffer as DerEncodedPublicKey,
      )
    } else {
      throw new Error("No such delegation")
    }
  })
}

export async function getPrincipalSignedByCanister(
  userNumber: bigint,
  frontendHostname: string,
): Promise<Principal> {
  return await delegationFactory.get_principal(userNumber, frontendHostname)
}

async function prepareDelegation(
  args: PrepareDelegationArgs,
): Promise<[UserKey, Timestamp]> {
  return await delegationFactory.prepare_delegation(
    args.userNumber,
    args.frontendHostname,
    args.sessionKey,
    args.maxTimeToLive,
    args.targets,
  )
}

async function getDelegation(
  args: GetDelegationArgs,
): Promise<GetDelegationResponse> {
  return await delegationFactory.get_delegation(
    args.userNumber,
    args.frontendHostname,
    args.sessionKey,
    args.expiration,
    args.targets,
  )
}
