import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { getScope } from "@nfid/config"

import { UserNumber } from "../_ic_api/internet_identity.d"
import { ii } from "../actors"
import { authState } from "../authentication"
import { Account } from "../identity-manager/account"
import { Chain, getPublicKey } from "../lambda/ecdsa"

export interface PrincipalAccount {
  principal: Principal
  account: Account
}

export async function fetchPrincipals(
  userNumber: UserNumber,
  accounts: Account[],
  isNewUser?: boolean,
): Promise<PrincipalAccount[]> {
  const delegation = authState.get().delegationIdentity
  if (!delegation) throw Error("No delegation identity")

  const publicKey = await getPublicKey(delegation, Chain.IC)
  const principal = Ed25519KeyIdentity.fromParsedJson([
    publicKey,
    "",
  ]).getPrincipal()

  const globalAcc = {
    account: {
      accountId: "-1",
      domain: "nfid.one",
      label: "NFID",
    },
    principal,
  }

  if (isNewUser) return [globalAcc]

  return await Promise.all([
    ...accounts.map(async (account) => {
      return {
        principal: await ii.get_principal(
          userNumber,
          getScope(account.domain, account.accountId),
        ),
        account,
      }
    }),
    ...[globalAcc],
  ])
}
