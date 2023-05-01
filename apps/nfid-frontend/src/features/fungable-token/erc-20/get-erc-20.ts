import { DelegationIdentity } from "@dfinity/identity"
import { Erc20TransferRequest } from "packages/integration/src/lib/asset/estimateTransaction/transferRequest/erc20TransferRequest"
import {
  FungibleTxs,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import { TokenConfig } from "src/ui/connnector/types"

import { IconERC20 } from "@nfid-frontend/ui"
import { ethereumAsset, loadProfileFromLocalStorage } from "@nfid/integration"

export const getErc20Tokens = async (): Promise<Array<TokenBalanceSheet>> => {
  const identity = await getIdentity()
  return await ethereumAsset.getAccounts(identity, IconERC20)
}

export const getErc20TransactionHistory = async (): Promise<FungibleTxs> => {
  const identity = await getIdentity()
  return ethereumAsset.getTransactionHistory(identity, "erc20")
}

export const transferERC20 = async (
  amount: number,
  to: string,
  token: TokenConfig,
) => {
  try {
    const identity = await getIdentity()
    const transaction = await ethereumAsset.getEstimatedTransaction(
      new Erc20TransferRequest(identity, to, token.contract!, amount),
    )
    const response = await ethereumAsset.transfer(
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
