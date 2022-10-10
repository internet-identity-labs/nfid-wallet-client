import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { getScope } from "frontend/integration/identity-manager/persona/utils"
import {
  delegationByScope,
  fetchPrincipal,
} from "frontend/integration/internet-identity"

const WALLET_SCOPE = "nfid.one"
export const WALLET_SESSION_TTL_2_MIN_IN_NS = 2 * 60 * 1e9

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
    typeof hostName === "undefined"
      ? WALLET_SCOPE
      : getScope(hostName, personaId)
  return delegationByScope(
    userNumber,
    scope,
    BigInt(WALLET_SESSION_TTL_2_MIN_IN_NS),
  )
}
