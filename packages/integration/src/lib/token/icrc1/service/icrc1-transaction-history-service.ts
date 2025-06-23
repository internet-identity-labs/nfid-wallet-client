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
  Mint,
  Burn,
  Approve,
  Transaction
} from "../../../_ic_api/index-icrc1.d"
import { idlFactory as icrc1IndexIDLICP } from "../../../_ic_api/ledger-index-icrc1"
import {
  _SERVICE as ICRCIndexICP,
  TransactionWithId as TransactionWithIdICP,
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

        const icrc1Pair = new Icrc1Pair(pair.icrc1.ledger, pair.icrc1.index)
        const ledgerData = await icrc1Pair.getMetadata()

        try {
          const indexActor = this.createIndexActor(
            pair.icrc1.index,
            pair.icrc1.ledger === ICP_CANISTER_ID,
          )
          const response = await indexActor.get_account_transactions(args)

          if (hasOwnProperty(response, "Err")) {
            console.error(
              `Error ${response.Err} getting account transactions for canister: ${pair.icrc1}`,
            )
            return this.getDefaultICRC1IndexData()
          }

          if (hasOwnProperty(response, "Ok")) {
            return {
              canisterId: pair.icrc1.ledger,
              decimals: ledgerData.decimals,
              transactions: this.mapTransactions(
                response.Ok.transactions,
                publicKeyInPrincipal,
                ledgerData.symbol,
                ledgerData.decimals,
                ledgerData.canister,
                pair.icrc1.ledger === ICP_CANISTER_ID,
              ),
              oldestTransactionId: response.Ok.oldest_tx_id[0] ?? undefined,
            }
          }

          return this.getDefaultICRC1IndexData()
        } catch (error) {
          console.error(error)
          console.error(
            "Error getting account transactions for canister: ",
            ledgerData.symbol,
            pair.icrc1,
          )
          return this.getDefaultICRC1IndexData()
        }
      }),
    )
  }

  private createIndexActor(
    index: string,
    isICP: boolean,
  ): ICRCIndex | ICRCIndexICP {
    const idlFactory = isICP ? icrc1IndexIDLICP : icrc1IndexIDL
    return Agent.Actor.createActor<ICRCIndex | ICRCIndexICP>(idlFactory, {
      canisterId: index,
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
  }

  private mapTransactions(
    rawTrss: Array<TransactionWithId | TransactionWithIdICP>,
    ownerPrincipal: string,
    symbol: string,
    decimals: number,
    canisterId: string,
    isICP: boolean,
  ): Array<TransactionData> {
    return isICP
      ? this.mapRawTrsToTransactionICP(
          rawTrss as Array<TransactionWithIdICP>,
          ownerPrincipal,
          symbol,
          decimals,
          canisterId,
        )
      : this.mapRawTrsToTransaction(
          rawTrss as Array<TransactionWithId>,
          ownerPrincipal,
          symbol,
          decimals,
          canisterId,
        )
  }

  private mapRawTrsToTransaction(
    rawTrss: Array<TransactionWithId>,
    ownerPrincipal: string,
    symbol: string,
    decimals: number,
    canisterId: string,
  ): Array<TransactionData> {
    return (
      rawTrss
        .map((rawTrs) => {
          if (rawTrs.transaction.transfer.length !== 0) {
            const trs: Transfer = rawTrs.transaction.transfer[0]!
            const type =
              ownerPrincipal === trs.from.owner.toText()
                ? ("Sent" as IActivityAction)
                : ("Received" as IActivityAction)

            return {
              type,
              timestamp: rawTrs.transaction.timestamp,
              symbol,
              amount: trs.amount,
              from: trs.from.owner.toText(),
              to: trs.to.owner.toText(),
              transactionId: rawTrs.id,
              decimals,
              canister: canisterId,
            }
          }

          if (["mint", "burn", "approve"].includes(rawTrs.transaction.kind)) {
            const kind = rawTrs.transaction.kind as keyof Transaction
            const trs = (rawTrs.transaction[kind] as [Mint | Burn | Approve])[0]
            const type = kind.charAt(0).toUpperCase() + kind.slice(1) as IActivityAction

            return {
              type,
              timestamp: rawTrs.transaction.timestamp,
              symbol,
              amount: trs.amount,
              transactionId: rawTrs.id,
              decimals,
              canister: canisterId,
            }
          }

          throw new Error(
            `Unsupported transaction kind: ${rawTrs.transaction.kind}`
          )
        })
    )
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

    return rawTrss
      .filter((rawTrs) => "Transfer" in rawTrs.transaction.operation)
      .map((rawTrs) => {
        const operation = rawTrs.transaction.operation
        const trs = "Transfer" in operation ? operation.Transfer : null

        const type =
          accountIdentifier === trs?.from
            ? IActivityAction.SENT
            : IActivityAction.RECEIVED

        return {
          type,
          timestamp:
            rawTrs.transaction.timestamp?.[0]?.timestamp_nanos || BigInt(0),
          symbol,
          amount: trs?.amount.e8s || BigInt(0),
          from: trs?.from || "",
          to: trs?.to || "",
          transactionId: rawTrs.id,
          decimals,
          canister: canisterId,
        }
      })
  }

  private getDefaultICRC1IndexData(): ICRC1IndexData {
    return {
      transactions: [],
      oldestTransactionId: undefined,
    }
  }
}

export const icrc1TransactionHistoryService =
  new Icrc1TransactionHistoryService()
