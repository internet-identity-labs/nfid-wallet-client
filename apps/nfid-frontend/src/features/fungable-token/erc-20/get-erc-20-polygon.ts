import { DelegationIdentity } from "@dfinity/identity"
import { Erc20TransferRequest } from "packages/integration/src/lib/asset/estimateTransaction/transferRequest/erc20TransferRequest"
import {
  FungibleTxs,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import { TokenConfig } from "src/ui/view-model/types"

import { IconERC20 } from "@nfid-frontend/ui"
import { loadProfileFromLocalStorage, polygonAsset } from "@nfid/integration"

export const getErc20Tokens = async (): Promise<Array<TokenBalanceSheet>> => {
  const identity = await getIdentity()
  return await polygonAsset.getAccounts(identity, IconERC20)
}

export const getErc20TransactionHistory = async (): Promise<FungibleTxs> => {
  const identity = await getIdentity()
  return polygonAsset.getTransactionHistory(identity, "erc20")
}

export const transferERC20Polygon = async (
  amount: number,
  to: string,
  token: TokenConfig,
) => {
  try {
    const identity = await getIdentity()
    const transaction = await polygonAsset.getEstimatedTransaction(
      new Erc20TransferRequest(identity, to, token.contract!, amount),
    )
    const response = await polygonAsset.transfer(
      identity,
      transaction.transaction,
    )
    return `You've sent ${amount} ${token.currency}. ${response}`
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
