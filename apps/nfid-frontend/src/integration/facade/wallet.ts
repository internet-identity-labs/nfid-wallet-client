import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import {
  WALLET_SCOPE,
  WALLET_SESSION_TTL_2_MIN_IN_NS,
  getScope,
} from "@nfid/config"
import { delegationState } from "@nfid/integration"

import { fetchPrincipal } from "frontend/integration/internet-identity"

export async function getWalletPrincipal(anchor: number): Promise<Principal> {
  return fetchPrincipal(anchor, WALLET_SCOPE).catch((e) => {
    throw Error(`Getting of Wallet Principal failed!: ${e}`, e)
  })
}

export async function getWalletDelegation(
  userNumber: number,
  hostName?: string,
  personaId?: string,
): Promise<DelegationIdentity> {
  const scope =
    typeof hostName === "undefined" || hostName === "nfid.one"
      ? WALLET_SCOPE
      : getScope(hostName, personaId)

  return delegationState.getDelegation(
    userNumber,
    scope,
    BigInt(WALLET_SESSION_TTL_2_MIN_IN_NS),
  )
}
