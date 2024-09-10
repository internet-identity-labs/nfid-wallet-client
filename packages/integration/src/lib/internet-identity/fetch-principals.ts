import { Principal } from "@dfinity/principal"

import { authState } from "../authentication"
import { getPublicKey } from "../delegation-factory/delegation-i"
import { Account } from "../identity-manager/account"

export interface PrincipalAccount {
  principal: Principal
  account: Account
}

export async function fetchPrincipals(): Promise<PrincipalAccount[]> {
  const delegation = authState.get().delegationIdentity
  if (!delegation) throw Error("No delegation identity")

  const principal = await getPublicKey(delegation)

  const globalAcc = {
    account: {
      accountId: "-1",
      domain: "nfid.one",
      label: "NFID",
    },
    principal: Principal.fromText(principal),
  }

  return [globalAcc]
}
