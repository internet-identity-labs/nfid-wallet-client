import * as Agent from "@dfinity/agent"
import { HttpAgent } from "@dfinity/agent"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { hasOwnProperty } from "@nfid/integration"

import { idlFactory as icrc1IndexIDL } from "../../../_ic_api/index-icrc1"
import {
  _SERVICE as ICRCIndex,
  GetAccountTransactionsArgs,
  TransactionWithId,
  Transfer,
} from "../../../_ic_api/index-icrc1.d"
import { idlFactory as icrc1IndexIDLICP } from "../../../_ic_api/ledger-index-icrc1"
import {
  _SERVICE as ICRCIndexICP,
  TransactionWithId as TransactionWithIdICP,
  Tokens,
} from "../../../_ic_api/ledger-index-icrc1.d"
import { agentBaseConfig } from "../../../actors"
import { ICP_CANISTER_ID } from "../../constants"
import { Icrc1Pair } from "../icrc1-pair/impl/Icrc1-pair"
import { IActivityAction, ICRC1IndexData, TransactionData } from "../types"

export class Icrc1TransactionHistoryService {
  async getICRC1IndexData(
    canisters: Array<{
      icrc1: {
        ledger: string
        index: string
      }
      blockNumberToStartFrom?: bigint
    }>,
    publicKeyInPrincipal: string,
    maxResults: bigint,
  ): Promise<Array<ICRC1IndexData>> {
    return Promise.all(
      canisters.map(async (pair) => {
        try {
          if (pair.icrc1.ledger === ICP_CANISTER_ID) {
            const indexActor = Agent.Actor.createActor<ICRCIndexICP>(
              icrc1IndexIDLICP,
              {
                canisterId: pair.icrc1.index!,
                agent: new HttpAgent({ ...agentBaseConfig }),
              },
            )

            const args: GetAccountTransactionsArgs = {
              account: {
                subaccount: [],
                owner: Principal.fromText(publicKeyInPrincipal),
              },
              max_results: maxResults,
              start:
                pair.blockNumberToStartFrom === undefined
                  ? []
                  : [pair.blockNumberToStartFrom],
            }
            const response = await indexActor.get_account_transactions(args)

            if (hasOwnProperty(response, "Err")) {
              console.error(
                "Error " +
                  response.Err +
                  " getting account transactions for canister: " +
                  pair.icrc1,
              )
              return {
                transactions: [],
                oldestTransactionId: undefined,
              }
            }

            if (hasOwnProperty(response, "Ok")) {
              const icrc1Pair = new Icrc1Pair(
                pair.icrc1.ledger,
                pair.icrc1.index,
              )
              const ledgerData = await icrc1Pair.getMetadata()

              return {
                canisterId: pair.icrc1.ledger,
                decimals: ledgerData.decimals,
                transactions: this.mapRawTrsToTransactionICP(
                  response.Ok.transactions,
                  publicKeyInPrincipal,
                  ledgerData.symbol,
                  ledgerData.decimals,
                  ledgerData.canister,
                ),
                oldestTransactionId:
                  response.Ok.oldest_tx_id.length === 0
                    ? undefined
                    : response.Ok.oldest_tx_id[0],
              }
            }
          } else {
            const indexActor = Agent.Actor.createActor<ICRCIndex>(
              icrc1IndexIDL,
              {
                canisterId: pair.icrc1.index!,
                agent: new HttpAgent({ ...agentBaseConfig }),
              },
            )

            const args: GetAccountTransactionsArgs = {
              account: {
                subaccount: [],
                owner: Principal.fromText(publicKeyInPrincipal),
              },
              max_results: maxResults,
              start:
                pair.blockNumberToStartFrom === undefined
                  ? []
                  : [pair.blockNumberToStartFrom],
            }
            const response = await indexActor.get_account_transactions(args)

            if (hasOwnProperty(response, "Err")) {
              console.error(
                "Error " +
                  response.Err +
                  " getting account transactions for canister: " +
                  pair.icrc1,
              )
              return {
                transactions: [],
                oldestTransactionId: undefined,
              }
            }

            if (hasOwnProperty(response, "Ok")) {
              const icrc1Pair = new Icrc1Pair(
                pair.icrc1.ledger,
                pair.icrc1.index,
              )
              const ledgerData = await icrc1Pair.getMetadata()

              return {
                canisterId: pair.icrc1.ledger,
                decimals: ledgerData.decimals,
                transactions: this.mapRawTrsToTransaction(
                  response.Ok.transactions,
                  publicKeyInPrincipal,
                  ledgerData.symbol,
                  ledgerData.decimals,
                  ledgerData.canister,
                ),
                oldestTransactionId:
                  response.Ok.oldest_tx_id.length === 0
                    ? undefined
                    : response.Ok.oldest_tx_id[0],
              }
            }
          }
          return {
            transactions: [],
            oldestTransactionId: undefined,
          }
        } catch (error) {
          console.error(error)
          return {
            transactions: [],
            oldestTransactionId: undefined,
          }
        }
      }),
    )
  }

  private mapRawTrsToTransaction(
    rawTrss: Array<TransactionWithId>,
    ownerPrincipal: string,
    symbol: string,
    decimals: number,
    canisterId: string,
  ): Array<TransactionData> {
    const filtered = rawTrss.filter(
      (rawTrs) => rawTrs.transaction.transfer.length !== 0,
    )
    if (filtered.length === 0) {
      return []
    }
    return filtered.map((rawTrs) => {
      const trs: Transfer = rawTrs.transaction.transfer[0]!
      const type =
        ownerPrincipal === trs.from.owner.toText()
          ? ("Sent" as IActivityAction)
          : ("Received" as IActivityAction)
      const data: TransactionData = {
        type,
        timestamp: rawTrs.transaction.timestamp,
        symbol: symbol,
        amount: trs.amount,
        from: trs.from.owner.toText(),
        to: trs.to.owner.toText(),
        transactionId: rawTrs.id,
        decimals,
        canister: canisterId,
      }
      return data
    })
  }

  private mapRawTrsToTransactionICP(
    rawTrss: Array<TransactionWithIdICP>,
    ownerPrincipal: string,
    symbol: string,
    decimals: number,
    canisterId: string,
  ): Array<TransactionData> {
    const principal = Principal.fromText(ownerPrincipal)
    const accountIdentifier = AccountIdentifier.fromPrincipal({
      principal,
    }).toHex()

    const filtered = rawTrss.filter((rawTrs) => {
      const operation = rawTrs.transaction.operation
      return "Transfer" in operation
    })

    if (filtered.length === 0) {
      return []
    }
    return filtered.map((rawTrs) => {
      const operation = rawTrs.transaction.operation
      let trs: {
        to: string
        fee: Tokens
        from: string
        amount: Tokens
      } | null = null

      if ("Transfer" in operation) {
        trs = operation.Transfer
      }

      const type =
        accountIdentifier == trs?.from
          ? IActivityAction.SENT
          : IActivityAction.RECEIVED

      const data: TransactionData = {
        type,
        timestamp:
          rawTrs.transaction.created_at_time[0]?.timestamp_nanos || BigInt(0),
        symbol: symbol,
        amount: trs?.amount.e8s || BigInt(0),
        from: trs?.from || "",
        to: trs?.to || "",
        transactionId: rawTrs.id,
        decimals,
        canister: canisterId,
      }
      return data
    })
  }
}

export const icrc1TransactionHistoryService =
  new Icrc1TransactionHistoryService()
