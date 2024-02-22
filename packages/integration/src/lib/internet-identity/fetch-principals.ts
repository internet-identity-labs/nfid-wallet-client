import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { authState } from "../authentication"
import { Account } from "../identity-manager/account"
import { Chain, getPublicKey } from "../lambda/ecdsa"

export interface PrincipalAccount {
  principal: Principal
  account: Account
}

export async function fetchPrincipals(): Promise<PrincipalAccount[]> {
  const delegation = authState.get().delegationIdentity
  if (!delegation) throw Error("No delegation identity")

  const publicKey = await getPublicKey(delegation, Chain.IC)
  const principal = Ed25519KeyIdentity.fromParsedJson([
    publicKey,
    // FIXME: @dmitriiIdentityLabs will have look to get a better fix
    "0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  ]).getPrincipal()

  const globalAcc = {
    account: {
      accountId: "-1",
      domain: "nfid.one",
      label: "NFID",
    },
    principal,
  }

  return [globalAcc]
}
