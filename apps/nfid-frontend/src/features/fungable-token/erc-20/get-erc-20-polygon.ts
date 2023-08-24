import { DelegationIdentity } from "@dfinity/identity"
import { Erc20EstimateTransactionRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/erc20-populate-transaction.service"
import {
  FungibleTxs,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import { getWalletDelegation } from "src/integration/facade/wallet"
import { fetchProfile } from "src/integration/identity-manager"
import { TokenConfig } from "src/ui/connnector/types"

import { IconERC20 } from "@nfid-frontend/ui"
import { polygonAsset, polygonMumbaiAsset } from "@nfid/integration"

export const getErc20Tokens = async (): Promise<Array<TokenBalanceSheet>> => {
  const identity = await getIdentity()
  return await polygonMumbaiAsset.getAccounts(identity, IconERC20)
}

export const getErc20TransactionHistory = async (): Promise<FungibleTxs> => {
  const identity = await getIdentity()
  return polygonAsset.getTransactionHistory(identity, "erc20")
}

export const getErc20TransactionHistoryMumbai =
  async (): Promise<FungibleTxs> => {
    const identity = await getIdentity()
    return polygonMumbaiAsset.getTransactionHistory(identity, "erc20")
  }

export const transferERC20Polygon = async (
  amount: number,
  to: string,
  token: TokenConfig,
) => {
  try {
    const identity = await getIdentity()
    const transaction = await polygonMumbaiAsset.getEstimatedTransaction(
      new Erc20EstimateTransactionRequest(
        identity,
        to,
        token.contract!,
        amount,
      ),
    )
    const response = await polygonMumbaiAsset.transfer(
      identity,
      transaction.transaction,
    )
    return `You've sent ${amount} ${token.currency}. ${response.etherscanTransactionUrl}`
  } catch (e: any) {
    throw new Error(
      e?.message ?? "Unexpected error: The transaction has been cancelled",
    )
  }
}

const getIdentity = async (): Promise<DelegationIdentity> => {
  const profile = await fetchProfile()
  return await getWalletDelegation(profile.anchor, "nfid.one", "0")
}
