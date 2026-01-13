import { DelegationIdentity } from "@dfinity/identity"

import { format } from "date-fns"

import { E8S } from "../token/constants"

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

export abstract class Asset<T> implements FungibleAsset {
  abstract transfer(
    identity: DelegationIdentity,
    transaction: FungibleTransactionRequest,
  ): Promise<T>

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
      tokenBalance: parseFloat(token.balance) * E8S,
      usdBalance: token.balanceinUsd,
    }
    const appBalance: AppBalance = {
      accounts: [rootAccountBalance],
      appName: "NFID",
      tokenBalance: token.balance,
    }
    return {
      address: token.address,
      applications: {
        NFID: appBalance,
      },
      icon: token.logo ? token.logo : defaultIcon!,
      label: token.name,
      token: token.symbol,
      tokenBalance: parseFloat(token.balance) * E8S,
      usdBalance: token.balanceinUsd,
      blockchain: this.getBlockchain(),
      fee,
      contract: token.contractAddress,
    }
  }

  protected toTransactionRow(tx: FungibleActivityRecord, address: string) {
    return {
      type:
        tx.from.toLowerCase() === address.toLowerCase() ? "send" : "Received",
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
    return String(value ? Math.floor(parseFloat(value) * E8S) : 0)
  }
}
