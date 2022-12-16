import { Principal } from "@dfinity/principal"

import { UserNumber } from "../_ic_api/internet_identity.d"
import { ii } from "../actors"
import { Account } from "../identity-manager/account"
import { getScope } from "./get-scope"

export interface PrincipalAccount {
  principal: Principal
  account: Account
}

export async function fetchPrincipals(
  userNumber: UserNumber,
  accounts: Account[],
): Promise<PrincipalAccount[]> {
  return await Promise.all(
    accounts.map(async (account) => {
      return {
        principal: await ii.get_principal(
          userNumber,
          getScope(account.domain, account.accountId),
        ),
        account,
      }
    }),
  )
}
