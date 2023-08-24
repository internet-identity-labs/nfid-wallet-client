import { ChainBalance } from "packages/integration/src/lib/asset/types"
import {
  AccountBalance,
  AppBalance,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"

import { IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

export const getEthBalance = async (): Promise<TokenBalanceSheet> => {
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = await fetchProfile()
  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )
  const balance = await ethereumGoerliAsset.getBalance(undefined, delegation)
  const address = await ethereumGoerliAsset.getAddress(delegation)
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
  const tokenBalance = Number(balance.balance ?? 0)
  const usdBalance = "$" + (balance.balanceinUsd ?? "0.00")
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
    blockchain: "Ethereum",
  }
}
