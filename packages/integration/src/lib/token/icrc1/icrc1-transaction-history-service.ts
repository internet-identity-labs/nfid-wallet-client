import * as Agent from "@dfinity/agent"
import { HttpAgent } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { hasOwnProperty } from "@nfid/integration"

import { idlFactory as icrc1IndexIDL } from "../../_ic_api/index-icrc1"
import {
  _SERVICE as ICRCIndex,
  GetAccountTransactionsArgs,
  TransactionWithId,
  Transfer,
} from "../../_ic_api/index-icrc1.d"
import { agentBaseConfig } from "../../actors"
import { icrc1Service } from "./icrc1-service"
import { ICRC1IndexData, TransactionData } from "./types"
import { ICRC1 as ICRC1UserData } from "./types"

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
          const indexActor = Agent.Actor.createActor<ICRCIndex>(icrc1IndexIDL, {
            canisterId: pair.icrc1.index!,
            agent: new HttpAgent({ ...agentBaseConfig }),
          })

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
            console.warn(
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
            const ledgerData = await icrc1Service.getICRC1Data(
              [pair.icrc1.ledger],
              publicKeyInPrincipal,
            )

            return {
              canisterId: pair.icrc1.ledger,
              decimals: ledgerData[0].decimals,
              transactions: this.mapRawTrsToTransaction(
                response.Ok.transactions,
                publicKeyInPrincipal,
                ledgerData[0].symbol,
                ledgerData[0].decimals,
              ),
              oldestTransactionId:
                response.Ok.oldest_tx_id.length === 0
                  ? undefined
                  : response.Ok.oldest_tx_id[0],
            }
          }
          return {
            transactions: [],
            oldestTransactionId: undefined,
          }
        } catch (error) {
          console.debug(error)
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
        ownerPrincipal === trs.from.owner.toText() ? "sent" : "received"
      const data: TransactionData = {
        type,
        timestamp: rawTrs.transaction.timestamp,
        symbol: symbol,
        amount: trs.amount,
        from: trs.from.owner.toText(),
        to: trs.to.owner.toText(),
        transactionId: rawTrs.id,
        decimals,
      }
      return data
    })
  }
}

export const icrc1TransactionHistoryService =
  new Icrc1TransactionHistoryService()
