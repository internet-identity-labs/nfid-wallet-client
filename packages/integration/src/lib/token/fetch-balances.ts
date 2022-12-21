import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"

import { Account } from "../identity-manager/account"
import { PrincipalAccount } from "../internet-identity"
import { Balance, getBalance as getICPBalance } from "../rosetta"
import { TokenMetadata, getBalance as getDip20Balance } from "./dip-20"

type FetchBalanceArgs = {
  principals: PrincipalAccount[]
  dip20Token: TokenMetadata[]
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
}

export async function fetchBalances({
  principals,
  dip20Token,
}: FetchBalanceArgs): Promise<AccountBalance[]> {
  return await Promise.all(
    principals.map(async ({ principal, account }) => {
      const token = await Promise.all<TokenBalance>([
        // mapping over this static list only to keep the same shape as the dip20Token
        ...["ICP"].map(async (token) => ({
          [token]: await getICPBalance(principalToAddress(principal)),
        })),
        ...dip20Token.map(async ({ symbol: token, canisterId }) => ({
          [token]: await getDip20Balance({
            canisterId,
            principalId: principal.toText(),
          }),
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
