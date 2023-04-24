import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { format } from "date-fns"
import { principalToAddress } from "ictool"
import {
  ChainBalance,
} from "packages/integration/src/lib/asset/types"
import {
  FungibleTxs,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { loadProfileFromLocalStorage } from "@nfid/integration"

export const getAccounts = async (): Promise<TokenBalanceSheet> => {
  const principal = await getIdentity()
  return await new BtcAsset().getRootAccount(undefined, principal, IconSvgBTC)
}

export const getBtcAddress = async (): Promise<string> => {
  const identity = await getIdentity()
  return await new BtcAsset().getAddress(identity)
}

export const getBtcTransactionHistory = async (): Promise<FungibleTxs> => {
  const identity = await getIdentity()
  return await new BtcAsset().getTransactionHistory(identity)
}

export const transferBTC = async (amount: number, to: string) => {
  const identity = await getIdentity()
  return await new BtcAsset().transfer(identity, { amount, to })
}

const getIdentity = async (): Promise<DelegationIdentity> => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  return await getWalletDelegation(profile.anchor, "nfid.one", "0")
}
