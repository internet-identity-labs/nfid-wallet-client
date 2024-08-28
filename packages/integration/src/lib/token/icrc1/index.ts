import * as Agent from "@dfinity/agent"
import { HttpAgent, Identity } from "@dfinity/agent"

import { idlFactory as icrc1IDL } from "../../_ic_api/icrc1"
import {
  _SERVICE as ICRC1Service,
  Icrc1TransferResult,
  TransferArg,
} from "../../_ic_api/icrc1.d"
import { icrc1Service } from "./icrc1-service"
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
  const canisters = await icrc1StorageService.getICRC1ActiveCanisters(
    rootPrincipalId,
  )
  const indexedCanisters = canisters
    .filter((canister) => canister.index !== undefined)
    .map((l) => {
      return {
        icrc1: {
          ledger: l.ledger,
          index: l.index!,
        },
        blockNumberToStartFrom: undefined,
      }
    })

  if (!indexedCanisters.length) return []

  return icrc1TransactionHistoryService.getICRC1IndexData(
    indexedCanisters,
    publicKey,
    maxResults,
  )
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
