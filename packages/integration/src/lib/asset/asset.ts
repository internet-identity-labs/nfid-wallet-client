import { DelegationIdentity } from "@dfinity/identity"
import { TransactionRequest } from "@ethersproject/abstract-provider"
import { format } from "date-fns"

import { E8S } from "@nfid/integration/token/icp"

import {
  AccountBalance,
  AppBalance,
  ChainBalance,
  FungibleActivityRecord,
  FungibleActivityRecords,
  FungibleActivityRequest,
  FungibleAsset,
  FungibleTransactionRequest,
  FungibleTxs,
  Token,
  TokenBalanceSheet,
  TransactionRow,
} from "./types"

export abstract class Asset implements FungibleAsset {
  abstract transfer(
    identity: DelegationIdentity,
    transaction: TransactionRequest | FungibleTransactionRequest,
  ): Promise<string>

  abstract getAddress(identity: DelegationIdentity): Promise<string>

  abstract getTransactionHistory(
    identity: DelegationIdentity,
    contract?: string,
  ): Promise<FungibleTxs>

  abstract getBalance(
    address: string | undefined,
    delegation: DelegationIdentity | undefined,
  ): Promise<ChainBalance>

  abstract getBlockchain(): string

  abstract getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest,
    delegation: DelegationIdentity | undefined,
  ): Promise<FungibleActivityRecords>

  protected computeSheetForRootAccount(
    token: Token,
    principalId: string,
    defaultIcon?: string,
    fee?: string,
  ): TokenBalanceSheet {
    const rootAccountBalance: AccountBalance = {
      accountName: "account 1",
      address: token.address,
      principalId,
      tokenBalance: token.balance,
      usdBalance: token.balanceinUsd,
    }
    const appBalance: AppBalance = {
      accounts: [rootAccountBalance],
      appName: "NFID",
      tokenBalance: token.balance,
    }
    return {
      applications: {
        NFID: appBalance,
      },
      icon: token.logo ? token.logo : defaultIcon!,
      label: token.name,
      token: token.symbol,
      tokenBalance: token.balance,
      usdBalance: token.balanceinUsd,
      blockchain: this.getBlockchain(),
      fee: fee,
      contract: token.contractAddress,
    }
  }

  protected toTransactionRow(tx: FungibleActivityRecord, address: string) {
    return {
      type:
        tx.from.toLowerCase() === address.toLowerCase() ? "send" : "received",
      asset: tx.asset,
      quantity: this.formatPrice(tx.price),
      date: this.formatDate(tx.date),
      from: tx.from,
      to: tx.to,
    } as TransactionRow
  }

  protected formatDate(date: string) {
    return format(new Date(date), "MMM dd, yyyy - hh:mm:ss aaa")
  }

  protected formatPrice(price: number) {
    return price
  }

  protected toDenomination = (value?: string) => {
    return BigInt(value ? Math.floor(parseFloat(value) * E8S) : 0)
  }
}
