import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"

import { Account, Balance, PrincipalAccount } from "@nfid/integration"
import { getBalance as getICPBalance } from "@nfid/integration"

type FetchBalanceArgs = {
  principals: PrincipalAccount[]
}

export type Token = string

export type TokenBalance = {
  [token: Token]: Balance
}

export type AccountBalance = {
  principal: Principal
  principalId: string
  account: Account
  balance: TokenBalance
  address?: string
}

export async function fetchBalances({
  principals,
}: FetchBalanceArgs): Promise<AccountBalance[]> {
  return await Promise.all(
    principals.map(async ({ principal, account }) => {
      const token = await Promise.all<TokenBalance>([
        // mapping over this static list only to keep the same shape as the icrc1Token
        ...["ICP"].map(async (token) => ({
          [token]: await getICPBalance(
            AccountIdentifier.fromPrincipal({ principal }).toHex(),
          ),
        })),
      ])

      return {
        principal,
        principalId: principal.toText(),
        account,
        // pulling only token key value pairs and drop array specific
        // properties from the result to keep clean return interface
        balance: token.reduce((acc, cur) => ({ ...acc, ...cur }), {}),
      }
    }),
  )
}
