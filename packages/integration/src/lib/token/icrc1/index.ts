import * as Agent from "@dfinity/agent"
import { HttpAgent, Identity } from "@dfinity/agent"

import { storageWithTtl } from "@nfid/client-db"

import { idlFactory as icrc1IDL } from "../../_ic_api/icrc1"
import {
  _SERVICE as ICRC1Service,
  Icrc1TransferResult,
  TransferArg,
} from "../../_ic_api/icrc1.d"
import { icrc1StorageService } from "./service/icrc1-storage-service"
import { icrc1TransactionHistoryService } from "./service/icrc1-transaction-history-service"
import { ICRC1IndexData } from "./types"

/*
 PTAL "Get index data" test in icrc1/index.spec.ts
 * rootPrincipalId: the principal id of the account im.getAccount().principalId
 * publicKey: the public key returned by lambda ecdsa.ts getPublicKey() => convert to principal with Ed25519JSONableKeyIdentity
 * maxResults: the maximum number of transactions to return
 */
export async function getICRC1HistoryDataForUser(
  rootPrincipalId: string,
  publicKey: string,
  maxResults: bigint,
): Promise<Array<ICRC1IndexData>> {
  const canisters =
    await icrc1StorageService.getICRC1ActiveCanisters(rootPrincipalId)

  let cachedICRC1IndexData = (await storageWithTtl.get(
    "Activity_" + rootPrincipalId,
  )) as ICRC1IndexData[]
  let ledgerAndBlockNumberToStartFrom: {
    ledger: string
    blockNumberToStartFrom: bigint | undefined
  }[] = []
  if (cachedICRC1IndexData) {
    ledgerAndBlockNumberToStartFrom = cachedICRC1IndexData.map(
      (data: ICRC1IndexData) => {
        return {
          ledger: data.canisterId!,
          blockNumberToStartFrom: data.oldestTransactionId,
        }
      },
    )
  }

  const indexedCanisters = canisters
    .filter((canister) => canister.index !== undefined)
    .map((l) => {
      return {
        icrc1: {
          ledger: l.ledger,
          index: l.index!,
        },
        blockNumberToStartFrom: ledgerAndBlockNumberToStartFrom?.find(
          (data) => data.ledger === l.ledger,
        )?.blockNumberToStartFrom,
      }
    })

  if (!indexedCanisters.length) return []

  let icrc1IndexData: Array<ICRC1IndexData> =
    await icrc1TransactionHistoryService.getICRC1IndexData(
      indexedCanisters,
      publicKey,
      maxResults,
    )

  icrc1IndexData.forEach((data) => {
    if (cachedICRC1IndexData) {
      let cachedTransactions = cachedICRC1IndexData.find(
        (d) => d.canisterId === data.canisterId,
      )?.transactions
      if (cachedTransactions) {
        data.transactions = [...data.transactions, ...cachedTransactions]
      }
    }
  })

  await storageWithTtl.set(
    "Activity_" + rootPrincipalId,
    icrc1IndexData,
    15 * 1000,
  )

  return icrc1IndexData
}

export async function transferICRC1(
  globalAccountPrincipal: Identity,
  iCRC1Canister: string,
  args: TransferArg,
): Promise<Icrc1TransferResult> {
  const actor = Agent.Actor.createActor<ICRC1Service>(icrc1IDL, {
    canisterId: iCRC1Canister,
    agent: new HttpAgent({
      host: "https://ic0.app",
      identity: globalAccountPrincipal,
    }),
  })
  return await actor.icrc1_transfer(args)
}
