import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { Account, Balance, PrincipalAccount, Wallet } from "@nfid/integration"
import { getBalance as getICPBalance } from "@nfid/integration"

import { getAddress } from "frontend/util/get-address"

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
  vaultId?: bigint
  vaultName?: string
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

export async function fetchVaultsWalletsBalances(
  wallets: Wallet[],
): Promise<AccountBalance[]> {
  return await Promise.all(
    wallets.map(async (wallet) => {
      const principal = Principal.fromText(VAULT_CANISTER_ID)
      const address = getAddress(principal, wallet.uid)
      const balance = await getICPBalance(address)

      return {
        principal,
        account: {
          domain: "nfid.vaults",
          label: wallet.name ?? "",
          accountId: wallet.uid,
        },
        principalId: principal.toText(),
        address,
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
