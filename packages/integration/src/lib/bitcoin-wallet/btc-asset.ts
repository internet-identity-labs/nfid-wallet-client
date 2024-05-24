import { DelegationIdentity } from "@dfinity/identity"
import { toBn } from "@rarible/utils"
import BigNumber from "bignumber.js"
import { format } from "date-fns"

import { E8S } from "@nfid/integration/token/icp"

import { Asset } from "../asset/asset"
import { PriceService } from "../asset/asset-util"
import {
  Activity,
  ChainBalance,
  FungibleActivityRecord,
  FungibleActivityRecords,
  FungibleActivityRequest,
  FungibleTransactionRequest,
  FungibleTxs,
  Token,
  TokenBalanceSheet,
  TokenPrice,
  TransactionRow,
} from "../asset/types"
import { bcAddressInfo, bcTransactionInfo } from "./blockcypher-adapter"
import { BtcWallet } from "./btc-wallet"
import {
  BlockCypherAddressResponse,
  BlockCypherTransactionOutput,
} from "./types"

export class BtcAsset extends Asset<string> {
  override getTransactionHistory(
    identity: DelegationIdentity,
    contract?: string | undefined,
  ): Promise<FungibleTxs> {
    throw new Error("Method not implemented.")
  }
  getAddress(identity: DelegationIdentity): Promise<string> {
    return new BtcWallet(identity).getBitcoinAddress()
  }

  getBalance(
    address: string | undefined,
    delegation: DelegationIdentity | undefined,
  ): Promise<ChainBalance> {
    throw new Error("Method not implemented.")
  }

  getBlockchain(): string {
    return "Bitcoin"
  }

  async transfer(
    identity: DelegationIdentity,
    request: FungibleTransactionRequest,
  ): Promise<string> {
    try {
      const satoshi = BigNumber(request.amount).multipliedBy(E8S).toNumber()
      const response = await new BtcWallet(identity).sendSatoshi(
        request.to,
        satoshi,
      )
      return response.tx.hash
    } catch (e: any) {
      throw new Error(
        e?.message ??
          "Unexpected error: The BTC transaction has been cancelled",
      )
    }
  }

  async getRootAccount(
    delegation?: DelegationIdentity,
    logo?: string,
    address?: string,
  ): Promise<TokenBalanceSheet> {
    if (!delegation) {
      throw Error("Give me delegation. It's cached!")
    }
    const wallet = new BtcWallet(delegation)
    const validAddress: string = address ?? (await wallet.getBitcoinAddress())
    const json: BlockCypherAddressResponse = await bcAddressInfo(validAddress)
    const balance = json.final_balance
    let price: TokenPrice[]
    const balanceBN = toBn(balance / E8S)
    try {
      price = await new PriceService().getPrice(["BTC"])
    } catch (e) {
      price = [{ price: "0.0", token: "BTC" }]
    }
    const balanceinUsd = toBn(price[0].price).multipliedBy(balanceBN)
    const token: Token = {
      address: validAddress,
      balance: balanceBN.toString(),
      balanceinUsd: "$" + (balanceinUsd?.toFixed(2) ?? "0.00"),
      logo,
      name: this.getBlockchain(),
      symbol: "BTC",
      decimals: 8,
    }

    return super.computeSheetForRootAccount(
      token,
      delegation.getPrincipal().toText(),
      logo,
      "0",
    )
  }

  async getActivityByUser(identity: DelegationIdentity): Promise<Activity[]> {
    const address = await new BtcWallet(identity).getBitcoinAddress()
    const txs = await this.getTransactions(address)

    return txs.map((tx) => ({
      id: "",
      date: new Date(tx.date),
      from: tx.from,
      to: tx.to,
      transactionHash: "",
      action: tx.type,
      asset: {
        type: "ft", // Assuming all transactions are "ft". You can modify this based on the requirement.
        currency: tx.asset,
        amount: tx.quantity,
      },
    }))
  }

  private async getTransactions(address: string): Promise<TransactionRow[]> {
    try {
      const data = await bcTransactionInfo(address)

      const allTransactions = data.txs ? data.txs : []
      const sentTransactions: TransactionRow[] = []
      const receivedTransactions: TransactionRow[] = []
      for (let i = 0; i < allTransactions.length; i++) {
        const transaction = allTransactions[i]
        //check input or output transaction
        const isInput = transaction.inputs.some((l) => {
          return l.addresses && l.addresses.includes(address)
        })
        if (isInput) {
          const output: BlockCypherTransactionOutput[] =
            transaction.outputs.filter((l) => {
              return !l.addresses.includes(address)
            })
          if (output.length !== 0) {
            const row: TransactionRow = {
              type: "Sent",
              asset: "BTC",
              quantity: this.formatPrice(output[0].value),
              date: transaction.confirmed.toString(),
              from: address,
              to: output[0].addresses.join(", "),
            }
            sentTransactions.push(row)
          }
        } else {
          const output: BlockCypherTransactionOutput[] =
            transaction.outputs.filter((l) => {
              return l.addresses.includes(address)
            })
          if (output.length === 0) break
          const row: TransactionRow = {
            type: "Received",
            asset: "BTC",
            quantity: this.formatPrice(output[0].value),
            date: transaction.confirmed.toString(),
            from: transaction.inputs[0].addresses.join(", "),
            to: output[0].addresses.join(", "),
          }
          receivedTransactions.push(row)
        }
      }

      return sentTransactions.concat(receivedTransactions)
    } catch (error) {
      console.error("Error retrieving BTC transactions:", error)
      return []
    }
  }

  protected formatDateInt(date: number): string {
    return format(new Date(date), "MMM dd, yyyy - hh:mm:ss aaa")
  }

  protected override formatPrice(price: number) {
    return parseFloat((price / E8S).toFixed(8))
  }

  async getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest,
    delegation?: DelegationIdentity,
  ): Promise<FungibleActivityRecords> {
    throw Error("Not implemented.")
  }
}

export const btcAsset = new BtcAsset()
