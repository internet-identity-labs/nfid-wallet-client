import { SignIdentity } from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { DEFAULT_DELEGATION_TTL } from "@nfid/config"

import { accessList } from "../actors"
import { getLocalStorageOverride } from "../local-storage/get-delegation-ttl"
import { authStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "./storage"

export interface FrontendDelegation {
  delegationIdentity: DelegationIdentity
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}

export const requestFEDelegationChain = async (
  identity: SignIdentity,
  ttl: number = getLocalStorageOverride(
    DEFAULT_DELEGATION_TTL,
    "NFID_DELEGATION_TTL_MS",
  ),
) => {
  console.debug("requestFEDelegationChain")
  const sessionKey = Ed25519KeyIdentity.generate()

  // Here the security device is used. Besides creating new keys, this is the only place.
  const chain = await DelegationChain.create(
    identity,
    sessionKey.getPublicKey(),
    new Date(Date.now() + ttl),
    {
      targets: accessList.map((x) => Principal.fromText(x)),
    },
  )

  return { chain, sessionKey }
}

export const requestFEDelegation = async (
  identity: SignIdentity,
): Promise<FrontendDelegation> => {
  console.debug("requestFEDelegation")
  const { sessionKey, chain } = await requestFEDelegationChain(identity)

  await authStorage.set(KEY_STORAGE_KEY, JSON.stringify(sessionKey.toJSON()))
  await authStorage.set(KEY_STORAGE_DELEGATION, JSON.stringify(chain.toJSON()))

  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  return {
    delegationIdentity,
    chain,
    sessionKey,
  }
}
