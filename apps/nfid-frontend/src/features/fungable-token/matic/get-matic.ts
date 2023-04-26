import { DelegationIdentity } from "@dfinity/identity"
import {
  FungibleTxs,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import { BtcAsset } from "packages/integration/src/lib/bitcoin-wallet/btc-asset"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"

import { IconSvgBTC } from "@nfid-frontend/ui"
import { loadProfileFromLocalStorage, polygonAsset } from "@nfid/integration";
import { ethers } from "ethers-ts";
import { TokenConfig } from "src/features/fungable-token/use-all-token";
import { EthTransferRequest } from "packages/integration/src/lib/asset/estimateTransaction/transferRequest/ethTransferRequest"

export const getAccountsMatic = async (): Promise<TokenBalanceSheet> => {
  const principal = await getIdentity()
  return await polygonAsset.getNativeAccount( principal, IconSvgBTC)
}

export const getMaticTransactionHistory = async (): Promise<FungibleTxs> => {
  const identity = await getIdentity()
  return await polygonAsset.getTransactionHistory(identity)
}

export const transferMATIC = async (value: number, to: string) => {
  const identity = await getIdentity()
  return await polygonAsset.transfer(identity,  {to, value} )
}

export const transferMatic = async (
  amount: number,
  to: string,
) => {
  try {
    const identity = await getIdentity()
    const transaction = await polygonAsset.getEstimatedTransaction(
      new EthTransferRequest(identity, to, amount),
    )
    const response = await polygonAsset.transfer(
      identity,
      transaction.transaction,
    )
    return `You've sent ${amount} . ${response}`
  } catch (e: any) {
    throw new Error(
      e?.message ?? "Unexpected error: The transaction has been cancelled",
    )
  }
}

const getIdentity = async (): Promise<DelegationIdentity> => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  return await getWalletDelegation(profile.anchor, "nfid.one", "0")
}
