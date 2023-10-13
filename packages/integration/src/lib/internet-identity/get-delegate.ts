import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"

import { getScope } from "@nfid/config"

import { HTTPAccountResponse } from "../_ic_api/identity_manager.d"
import { PublicKey } from "../_ic_api/internet_identity.d"
import { ii, im, replaceActorIdentity, vault as vaultAPI } from "../actors"
import { mapOptional } from "../ic-utils"
import {
  Chain,
  ecdsaGetAnonymous,
  getGlobalKeysThirdParty,
  renewDelegationThirdParty,
} from "../lambda/ecdsa"
import { migrateUser } from "../vault"
import { fetchDelegate } from "./fetch-delegate"
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
  maxTimeToLive?: number,
): Promise<SignedDelegation & { publicKey: DerEncodedPublicKey }> => {
  const delegationChain = await ecdsaGetAnonymous(
    domain,
    sessionPublicKey,
    delegationIdentity,
    Chain.IC,
    maxTimeToLive,
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
const mapToSerialisableDelegation = ({
  delegationChain,
  delegation,
  signature,
}: {
  delegationChain: DelegationChain
  delegation: Delegation
  signature: Signature
}) => ({
  delegation: {
    expiration: delegation.expiration,
    pubkey: Array.from(new Uint8Array(delegation.pubkey)),
    targets: delegation.targets,
  },
  signature: Array.from(new Uint8Array(signature)),
  publicKey: delegationChain.publicKey,
})

export const renewDelegation = async (
  delegationIdentity: DelegationIdentity,
  origin: string,
  targets: string[],
  sessionPublicKey: Uint8Array,
): Promise<SignedDelegation & { publicKey: DerEncodedPublicKey }> => {
  const delegationChain = await renewDelegationThirdParty(
    delegationIdentity,
    targets,
    origin,
    sessionPublicKey,
  )

  const { delegation, signature } = delegationChain.delegations[0]
  return mapToSerialisableDelegation({
    delegationChain,
    delegation,
    signature,
  })
}

export const getPublicAccountDelegate = async (
  sessionPublicKey: Uint8Array,
  delegationIdentity: DelegationIdentity,
  origin: string,
  targets: string[],
  maxTimeToLive?: number,
): Promise<SignedDelegation & { publicKey: DerEncodedPublicKey }> => {
  const delegationChainPromise = getGlobalKeysThirdParty(
    delegationIdentity,
    targets,
    sessionPublicKey,
    origin,
    maxTimeToLive,
  )

  let promiseMigration
  if (origin === VAULTS_ORIGIN) {
    const account: HTTPAccountResponse = await im.get_account()
    const anchor = account.data[0]!.anchor
    const sessionKeyPair = Ed25519KeyIdentity.generate()

    if (anchor < 100000000) {
      const scope = getScope("nfid.one")
      promiseMigration = fetchDelegate(
        Number(anchor),
        scope,
        sessionKeyPair.getPublicKey() as any,
      ).then((iiDelegation) => {
        const delegationChainForMigration = delegationChainFromDelegation({
          anchor: Number(anchor),
          scope,
          signedDelegation: iiDelegation.signedDelegation,
          userPublicKey: iiDelegation.userPublicKey,
        })
        const actualIdentity = DelegationIdentity.fromDelegation(
          sessionKeyPair,
          delegationChainForMigration,
        )
        const targetPk = delegationChainForMigration.publicKey
        return replaceActorIdentity(vaultAPI, actualIdentity).then(() => {
          return migrateUser(
            actualIdentity,
            principalToAddress(
              Principal.selfAuthenticating(new Uint8Array(targetPk)) as any,
            ),
          )
        })
      })
    } else {
      promiseMigration = getGlobalKeysThirdParty(
        delegationIdentity,
        targets,
        new Uint8Array(sessionKeyPair.getPublicKey().toDer()),
        origin,
      ).then((delegationChainForMigration) => {
        const actualIdentity = DelegationIdentity.fromDelegation(
          sessionKeyPair,
          delegationChainForMigration,
        )
        return replaceActorIdentity(vaultAPI, actualIdentity).then(() => {
          return migrateUser(
            actualIdentity,
            principalToAddress(actualIdentity.getPrincipal() as any),
          )
        })
      })
    }
  }

  const [delegationChain, migratedUser] = await Promise.all([
    delegationChainPromise,
    promiseMigration,
  ])

  if (!migratedUser) {
    console.error("Error during migration")
  }

  const { delegation, signature } = delegationChain.delegations[0]
  return mapToSerialisableDelegation({
    delegationChain,
    delegation,
    signature,
  })
}

export const delegationChainFromDelegation = ({
  signedDelegation,
  userPublicKey,
}: any): DelegationChain => {
  return DelegationChain.fromDelegations(
    [
      {
        delegation: new Delegation(
          new Uint8Array(signedDelegation.delegation.pubkey).buffer,
          signedDelegation.delegation.expiration,
          signedDelegation.delegation.targets,
        ),
        signature: new Uint8Array(signedDelegation.signature)
          .buffer as Signature,
      },
    ],
    new Uint8Array(userPublicKey).buffer as DerEncodedPublicKey,
  )
}
