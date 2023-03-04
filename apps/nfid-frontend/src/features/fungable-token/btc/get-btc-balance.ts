import { ChainBalance } from "packages/integration/src/lib/asset/types"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { BtcWallet } from "packages/integration/src/lib/bitcoin-wallet/btc-wallet"
import {
  AccountBalance,
  AppBalance,
  TokenBalanceSheet,
} from "src/features/fungable-token/types"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { createAddress, readAddress } from "@nfid/client-db"
import {
  btcWallet as btcAPI,
  loadProfileFromLocalStorage,
  replaceActorIdentity,
} from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"

const ROOT_DOMAIN = "nfid.one"
const BTC_ROOT_ACCOUNT = "account 1"

export const getBtcBalance = async (): Promise<TokenBalanceSheet> => {
  const hostname = "btc_" + ROOT_DOMAIN
  let address = readAddress({
    accountId: BTC_ROOT_ACCOUNT,
    hostname,
  })

  let principal = ""
  let profile = loadProfileFromLocalStorage()
  if (!profile?.anchor) {
    profile = await fetchProfile()
  }
  if (!address) {
    const identity = await getWalletDelegation(profile.anchor)
    await replaceActorIdentity(btcAPI, identity)
    principal = identity.getPrincipal().toText()
    address = await new BtcWallet().getBitcoinAddress()
    createAddress({ accountId: BTC_ROOT_ACCOUNT, hostname, address })
  } else {
    principal = await getWalletDelegation(profile?.anchor).then((l) =>
      l.getPrincipal().toText(),
    )
  }
  const balance = await BtcAsset.getBalance(address)
  const sheet = computeSheetForRootAccount(balance, address, principal)
  return sheet
}

//sc-6513
export const computeSheetForRootAccount = async (
  balance: ChainBalance,
  address: string | undefined,
  principalId: string,
): Promise<TokenBalanceSheet> => {
  console.info("computeSheetForRootAccount")
  const tokenBalance = BigInt(Number(balance.balance?.multipliedBy(E8S) ?? 0))
  console.info("computeSheetForRootAccount" + tokenBalance)
  const usdBalance = "$" + (balance.balanceinUsd?.toFixed(2) ?? "0.00")
  console.info("computeSheetForRootAccount" + usdBalance)
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
    icon: IconSvgBTC,
    label: "Bitcoin",
    token: "BTC",
    tokenBalance,
    usdBalance,
  }
}
