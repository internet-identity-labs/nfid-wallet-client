import { DerEncodedPublicKey } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"

import { PublicKey } from "../_ic_api/internet_identity.d"
import { ii } from "../actors"
import { mapOptional } from "../ic-utils"
import {
  Chain,
  ecdsaGetAnonymous,
  getGlobalKeysThirdParty,
  renewDelegationThirdParty,
} from "../lambda/ecdsa"
import { SignedDelegation } from "./types"

/**
 * Retrieve prepared third party auth session.
 * @param userNumber
 * @param scope
 * @param sessionKey
 * @param timestamp
 * @returns signed delegate
 */
export async function getDelegate(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  timestamp: bigint,
): Promise<SignedDelegation> {
  console.debug("getDelegate", { userNumber, scope, sessionKey, timestamp })

  return ii
    .get_delegation(BigInt(userNumber), scope, sessionKey, timestamp)
    .then((r) => {
      if ("signed_delegation" in r) {
        return {
          delegation: {
            expiration: r.signed_delegation.delegation.expiration,
            pubkey: r.signed_delegation.delegation.pubkey,
            targets: mapOptional(r.signed_delegation.delegation.targets),
          },
          signature: r.signed_delegation.signature,
        }
      }
      throw new Error("No such delegation")
    })
}

export async function getDelegateRetry(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  timestamp: bigint,
): Promise<SignedDelegation> {
  for (let i = 0; i < 10; i++) {
    try {
      // Linear backoff
      await new Promise((resolve) => {
        setInterval(resolve, 1000 * i)
      })
      return await getDelegate(userNumber, scope, sessionKey, timestamp)
    } catch (e) {
      console.warn("Failed to retrieve delegation.", e)
    }
  }
  throw new Error(`Failed to retrieve a delegation after ${10} retries.`)
}

export const getAnonymousDelegate = async (
  sessionPublicKey: Uint8Array,
  delegationIdentity: DelegationIdentity,
  domain: string,
): Promise<SignedDelegation & { publicKey: DerEncodedPublicKey }> => {
  const delegationChain = await ecdsaGetAnonymous(
    domain,
    sessionPublicKey,
    delegationIdentity,
    Chain.IC,
  )

  const { delegation, signature } = delegationChain.delegations[0]
  return {
    delegation: {
      expiration: delegation.expiration,
      pubkey: Array.from(new Uint8Array(delegation.pubkey)),
      targets: delegation.targets,
    },
    signature: Array.from(new Uint8Array(signature)),
    publicKey: delegationChain.publicKey,
  }
}

export const renewDelegation = async (
  delegationIdentity: DelegationIdentity,
  origin: string,
  targets: string[],
): Promise<SignedDelegation & { publicKey: DerEncodedPublicKey }> => {
  const delegationChain = await renewDelegationThirdParty(
    delegationIdentity,
    targets,
    origin,
  )

  const { delegation, signature } = delegationChain.delegations[0]
  return {
    delegation: {
      expiration: delegation.expiration,
      pubkey: Array.from(new Uint8Array(delegation.pubkey)),
      targets: delegation.targets,
    },
    signature: Array.from(new Uint8Array(signature)),
    publicKey: delegationChain.publicKey,
  }
}

export const getPublicAccountDelegate = async (
  sessionPublicKey: Uint8Array,
  delegationIdentity: DelegationIdentity,
  origin: string,
  targets: string[],
): Promise<SignedDelegation & { publicKey: DerEncodedPublicKey }> => {
  const delegationChain = await getGlobalKeysThirdParty(
    delegationIdentity,
    targets,
    sessionPublicKey,
    origin,
  )

  console.log({ targets, delegationChain })

  const { delegation, signature } = delegationChain.delegations[0]
  return {
    delegation: {
      expiration: delegation.expiration,
      pubkey: Array.from(new Uint8Array(delegation.pubkey)),
      targets: delegation.targets,
    },
    signature: Array.from(new Uint8Array(signature)),
    publicKey: delegationChain.publicKey,
  }
}
