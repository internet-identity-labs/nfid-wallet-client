import { Principal } from "@dfinity/principal"

import { UserNumber } from "../_ic_api/internet_identity.d"
import { accessList, ii } from "../actors"
import { authState } from "../authentication"
import { Account } from "../identity-manager/account"
import { Chain, getGlobalKeys } from "../lambda/ecdsa"
import { getScope } from "./get-scope"

export interface PrincipalAccount {
  principal: Principal
  account: Account
}

export async function fetchPrincipals(
  userNumber: UserNumber,
  accounts: Account[],
  isNewUser?: boolean,
): Promise<PrincipalAccount[]> {
  const delegation = (await authState).get().delegationIdentity
  if (!delegation) throw Error("No delegation identity")

  const ICDelegation = await getGlobalKeys(delegation, Chain.IC, accessList)

  const globalAcc = {
    account: {
      accountId: "-1",
      domain: "nfid.one",
      label: "NFID",
    },
    principal: ICDelegation.getPrincipal(),
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
