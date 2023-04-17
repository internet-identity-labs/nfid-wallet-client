import { ChainBalance } from "packages/integration/src/lib/asset/types"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumAsset, loadProfileFromLocalStorage } from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

import {
  AccountBalance,
  AppBalance,
  TokenBalanceSheet,
} from "../../../../../../packages/integration/src/lib/asset/types"

export const getEthBalance = async (): Promise<TokenBalanceSheet> => {
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )
  const balance = await ethereumAsset.getBalance(undefined, delegation)
  const address = await ethereumAsset.getAddress(delegation)
  const principal = (await getWalletDelegation(profile.anchor))
    .getPrincipal()
    .toText()

  return computeSheetForRootAccount(balance, address, principal)
}

//sc-6513
export const computeSheetForRootAccount = async (
  balance: ChainBalance,
  address: string | undefined,
  principalId: string,
): Promise<TokenBalanceSheet> => {
  const tokenBalance = BigInt(Number(balance.balance?.toFixed(8) ?? 0) * E8S)
  const usdBalance = "$" + (balance.balanceinUsd?.toFixed(2) ?? "0.00")
  const rootAccountBalance: AccountBalance = {
    accountName: "account 1",
    address: address ?? "",
    principalId,
    tokenBalance,
    usdBalance,
  }

  const appBalance: AppBalance = {
    accounts: [rootAccountBalance],
    appName: "NFID",
    tokenBalance,
  }

  return {
    applications: {
      NFID: appBalance,
    },
    icon: IconPngEthereum,
    label: "Ethereum",
    token: TokenStandards.ETH,
    tokenBalance,
    usdBalance,
  }
}
