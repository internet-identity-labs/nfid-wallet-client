import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { Chain, getGlobalKeys } from "packages/integration/src/lib/lambda/ecdsa"

import { WALLET_SCOPE, WALLET_SESSION_TTL_2_MIN_IN_NS } from "@nfid/config"
import {
  getScope,
  getLocalStorageOverride,
  delegationState,
  RootWallet,
  authState,
  accessList,
} from "@nfid/integration"

import { fetchPrincipal } from "frontend/integration/internet-identity"

import { fetchProfile } from "../identity-manager"

export async function getWalletPrincipal(anchor: number): Promise<Principal> {
  return fetchPrincipal(anchor, WALLET_SCOPE).catch((e) => {
    throw Error(`Getting of Wallet Principal failed!: ${e}`, e)
  })
}

export async function getWalletDelegation(
  userNumber: number,
  hostName?: string,
  personaId?: string,
  chain: Chain = Chain.IC,
): Promise<DelegationIdentity> {
  const profile = await fetchProfile()

  if (profile.wallet === RootWallet.NFID) {
    const { delegationIdentity, sessionKey } = authState.get()

    if (!delegationIdentity) throw Error("No delegation identity found!")
    if (!sessionKey) throw Error("No session key found!")

    return await getGlobalKeys(
      delegationIdentity.getDelegation(),
      sessionKey,
      chain,
      accessList,
    )
  }

  const scope =
    typeof hostName === "undefined" || hostName === "nfid.one"
      ? WALLET_SCOPE
      : getScope(hostName, personaId)

  return delegationState.getDelegation(
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
