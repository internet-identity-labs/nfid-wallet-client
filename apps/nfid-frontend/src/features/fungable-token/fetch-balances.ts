import { Principal } from "@dfinity/principal"
import { fromHexString, principalToAddress } from "ictool"
import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"
import { getBtcBalance } from "src/features/fungable-token/btc/get-btc"

import { Account, Balance, PrincipalAccount, Wallet } from "@nfid/integration"
import { getBalance as getICPBalance } from "@nfid/integration"
import { getDIP20Balance, TokenMetadata } from "@nfid/integration/token/dip-20"

import { getEthBalance } from "./eth/get-eth-balance"

type FetchBalanceArgs = {
  principals: PrincipalAccount[]
  dip20Token: TokenMetadata[]
  erc20: TokenBalanceSheet[]
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
  erc20,
}: FetchBalanceArgs): Promise<AccountBalance[]> {
  return await Promise.all(
    principals.map(async ({ principal, account }) => {
      const token = await Promise.all<TokenBalance>([
        // mapping over this static list only to keep the same shape as the dip20Token
        ...["ICP"].map(async (token) => ({
          [token]: await getICPBalance(principalToAddress(principal)),
        })),
        ...["ETH"].map(async (token) => ({
          [token]: (await getEthBalance()).tokenBalance,
        })),
        ...["BTC"].map(async (token) => ({
          [token]: (await getBtcBalance()).tokenBalance,
        })),
        ...dip20Token.map(async ({ symbol: token, canisterId }) => ({
          [token]: await getDIP20Balance({
            canisterId,
            principalId: principal.toText(),
          }),
        })),
        ...erc20.map(async (token) => ({
          [token.token]: token.tokenBalance,
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

export async function fetchVaultsWalletsBalances(
  wallets: Wallet[],
): Promise<AccountBalance[]> {
  return await Promise.all(
    wallets.map(async (wallet) => {
      const principal = Principal.fromText(VAULT_CANISTER_ID)

      const address = principalToAddress(principal, fromHexString(wallet.uid))
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
      const balance = await getICPBalance(
        principalToAddress(principal, fromHexString(wallet.uid)),
      )

      return {
        ...wallet,
        address: principalToAddress(principal, fromHexString(wallet.uid)),
        balance: { ICP: balance },
      }
    }),
  )
}
