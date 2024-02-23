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
  const principal = Ed25519KeyIdentity.fromParsedJson([publicKey, "0"]).getPrincipal()

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
