import { DelegationIdentity } from "@dfinity/identity"
import {
  FungibleTxs,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

export const getAccounts = async (): Promise<TokenBalanceSheet> => {
  const principal = await getIdentity()
  return await new BtcAsset().getRootAccount(principal, IconSvgBTC)
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

const getIdentity = (): DelegationIdentity => {
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) {
    throw Error("Delegation identity error")
  }
  return delegationIdentity
}
