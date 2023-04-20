import { Erc20TransferRequest } from "packages/integration/src/lib/asset/estimateTransaction/transferRequest/erc20TransferRequest"
import {
  FungibleTxs,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import { TokenConfig } from "src/features/fungable-token/use-all-token"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"

import { IconERC20 } from "@nfid-frontend/ui"
import { ethereumAsset, loadProfileFromLocalStorage } from "@nfid/integration"

export const getErc20Tokens = async (): Promise<Array<TokenBalanceSheet>> => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const identity = await getWalletDelegation(profile.anchor, "nfid.one", "0")
  return await ethereumAsset.getErc20Accounts(identity, IconERC20)
}

export const getErc20TransactionHistory = async (): Promise<FungibleTxs> => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const identity = await getWalletDelegation(profile.anchor, "nfid.one", "0")
  return ethereumAsset.getErc20TransactionHistory(identity)
}

export const transferERC20 = async (
  amount: number,
  to: string,
  token: TokenConfig,
) => {
  try {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    const identity = await getWalletDelegation(profile.anchor, "nfid.one", "0")
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
