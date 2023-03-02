import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { WALLET_SCOPE, WALLET_SESSION_TTL_2_MIN_IN_NS } from "@nfid/config"
import { getScope, getLocalStorageOverride } from "@nfid/integration"

import {
  delegationByScope,
  fetchPrincipal,
} from "frontend/integration/internet-identity"

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
  return delegationByScope(
    userNumber,
    scope,
    BigInt(
      getLocalStorageOverride(
        WALLET_SESSION_TTL_2_MIN_IN_NS,
        "NFID_WALLET_DELEGATION_TTL_NS",
      ),
    ),
  )
}
