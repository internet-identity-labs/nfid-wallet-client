import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { Account, Balance, PrincipalAccount, Wallet } from "@nfid/integration"
import { getBalance as getICPBalance } from "@nfid/integration"
import { getDIP20Balance, TokenMetadata } from "@nfid/integration/token/dip-20"

import { getAddress } from "frontend/util/get-address"

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
  address?: string
  vaultId?: bigint
  vaultName?: string
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
          [token]: await getICPBalance(
            AccountIdentifier.fromPrincipal({ principal }).toHex(),
          ),
        })),
        // ...["ETH"].map(async (token) => ({
        //   [token]: (await getEthBalance()).tokenBalance,
        // })),
        // ...["BTC"].map(async (token) => ({
        //   [token]: (await getAccounts()).tokenBalance,
        // })),
        // ...["MATIC"].map(async (token) => ({
        //   [token]: (await getAccountsMatic()).tokenBalance,
        // })),
        ...dip20Token.map(async ({ symbol: token, canisterId }) => ({
          [token]: await getDIP20Balance({
            canisterId,
            principalId: principal.toText(),
          }),
        })),
        // ...erc20.map(async (token) => ({
        //   [token.token]: token.tokenBalance,
        // })),
        // ...erc20Polygon.map(async (token) => ({
        //   [token.token]: token.tokenBalance,
        // })),
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

export async function fetchVaultsWalletsBalances(
  wallets: Wallet[],
): Promise<AccountBalance[]> {
  return await Promise.all(
    wallets.map(async (wallet) => {
      const principal = Principal.fromText(VAULT_CANISTER_ID)
      const address = getAddress(principal, wallet.uid)
      const balance = await getICPBalance(address)

      return {
        principal: principal,
        account: {
          domain: "nfid.vaults",
          label: wallet.name ?? "",
          accountId: wallet.uid,
        },
        principalId: principal.toText(),
        address: address,
        balance: { ICP: balance },
        vaultId: wallet?.vaultId,
        vaultName: wallet?.vaultName,
      }
    }),
  )
}

export async function fetchVaultWalletsBalances(
  wallets: Wallet[],
): Promise<Wallet[]> {
  return await Promise.all(
    wallets.map(async (wallet) => {
      const principal = Principal.fromText(VAULT_CANISTER_ID)
      const balance = await getICPBalance(getAddress(principal, wallet.uid))

      return {
        ...wallet,
        address: getAddress(principal, wallet.uid),
        balance: { ICP: balance },
      }
    }),
  )
}
