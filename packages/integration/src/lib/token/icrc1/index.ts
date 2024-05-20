import * as Agent from "@dfinity/agent"
import { HttpAgent, Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { hasOwnProperty } from "@nfid/integration"

import { idlFactory as icrc1IDL } from "../../_ic_api/icrc1"
import {
  _SERVICE as ICRC1Service,
  Icrc1TransferResult,
  TransferArg,
} from "../../_ic_api/icrc1.d"
import { ICRC1 } from "../../_ic_api/icrc1_registry.d"
import { idlFactory as icrc1IndexIDL } from "../../_ic_api/index-icrc1"
import {
  _SERVICE as ICRCIndex,
  GetAccountTransactionsArgs,
  TransactionWithId,
  Transfer,
} from "../../_ic_api/index-icrc1.d"
import { agentBaseConfig, iCRC1Registry } from "../../actors"
import { PriceService } from "../../asset/asset-util"
import { TokenPrice } from "../../asset/types"
import { DEFAULT_ERROR_TEXT, ICP_CANISTER_ID, NETWORK } from "./constants"

export class ICRC1Error extends Error {}

export interface ICRC1Data {
  balance: bigint
  name: string
  owner: Principal
  symbol: string
  decimals: number
  fee: bigint
  canisterId: string
  network: string
  priceInUsd: number | undefined
  logo: string | undefined
}

export interface ICRC1Metadata {
  balance: bigint
  canisterId: string
  fee: bigint
  decimals: number
  price: string | undefined
  owner: Principal
  logo: string
  name: string
  symbol: string
  feeCurrency: string
  toPresentation: (value?: bigint | undefined) => number
  transformAmount: (value: string) => number
}

export interface ICRC1IndexData {
  transactions: Array<TransactionData>
  // The oldest transaction id (it can help to stop the pagination in the UI)
  oldestTransactionId: bigint | undefined
}

interface TransactionData {
  type: "sent" | "received"
  timestamp: bigint
  transactionId: bigint
  symbol: string
  amount: bigint
  from: string
  to: string
}

/*
 * rootPrincipalId: the principal id of the account im.getAccount().principalId
 * publicKey: the public key returned by lambda ecdsa.ts getPublicKey() => convert to principal with Ed25519JSONableKeyIdentity
 */
export async function getICRC1DataForUser(
  rootPrincipalId: string,
  publicKey: string,
): Promise<Array<ICRC1Data>> {
  const canisters = await getICRC1Canisters(rootPrincipalId)
  return getICRC1Data(
    canisters.map((l) => l.ledger),
    publicKey,
  )
}

/*
 PTAL "Get index data" test in icrc1/index.spec.ts
 * rootPrincipalId: the principal id of the account im.getAccount().principalId
 * publicKey: the public key returned by lambda ecdsa.ts getPublicKey() => convert to principal with Ed25519JSONableKeyIdentity
 * maxResults: the maximum number of transactions to return
 * blockNumberToStartFrom: the block number to start from
 */
export async function getICRC1HistoryDataForUser(
  rootPrincipalId: string,
  publicKey: string,
  maxResults: bigint,
  blockNumberToStartFrom: bigint | undefined,
): Promise<Array<ICRC1IndexData>> {
  const canisters = await getICRC1Canisters(rootPrincipalId)
  const indexedCanisters = canisters.filter(
    (canister) => canister.index.length > 0,
  )
  return getICRC1IndexData(
    indexedCanisters,
    publicKey,
    maxResults,
    blockNumberToStartFrom,
  )
}

export async function isICRC1Canister(
  canisterId: string,
  rootPrincipalId: string,
  publicKey: string,
  indexCanister: string | undefined,
): Promise<ICRC1Data> {
  const actor = Agent.Actor.createActor<ICRC1Service>(icrc1IDL, {
    canisterId: canisterId,
    agent: new HttpAgent({ ...agentBaseConfig }),
  })
  const standards = await actor.icrc1_supported_standards()
  const isICRC1: boolean = standards
    .map((standard) => standard.name)
    .some((name) => name === "ICRC-1")
  if (!isICRC1) {
    throw new ICRC1Error(DEFAULT_ERROR_TEXT)
  }
  await getICRC1Canisters(rootPrincipalId).then((icrc1) => {
    if (
      icrc1
        .map((c) => c)
        .map((c) => c.ledger)
        .includes(canisterId)
    ) {
      throw new ICRC1Error("Canister already added.")
    }
    if (canisterId === ICP_CANISTER_ID) {
      throw new ICRC1Error("Canister cannot be added.")
    }
  })

  if (indexCanister) {
    const expectedLedgerId = await getLedgerIdFromIndexCanister(indexCanister)
    if (expectedLedgerId.toText() !== canisterId) {
      throw new ICRC1Error("Ledger canister does not match index canister.")
    }
  }

  return getICRC1Data([canisterId], publicKey)
    .then((data) => {
      return data[0]
    })
    .catch((e) => {
      console.error(`isICRC1Canister error: ` + e)
      throw new ICRC1Error(DEFAULT_ERROR_TEXT)
    })
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

export async function getICRC1Canisters(
  principal: string,
): Promise<Array<ICRC1>> {
  return iCRC1Registry.get_canisters_by_root(principal)
}

export async function addICRC1Canister(
  canisterId: string,
  indexCanisterId: string | undefined,
): Promise<void> {
  const indexCandid: [] | [string] = indexCanisterId ? [indexCanisterId] : []
  await iCRC1Registry.store_icrc1_canister(canisterId, indexCandid)
}

export async function removeICRC1Canister(
  principal: string,
  ledgerCanisterId: string,
): Promise<void> {
  const allUsersCanisters = await getICRC1Canisters(principal)
  if (!allUsersCanisters.map((c) => c.ledger).includes(ledgerCanisterId)) {
    throw new Error("Canister not found.")
  }
  await iCRC1Registry.remove_icrc1_canister(ledgerCanisterId)
}

export async function getICRC1Data(
  canisters: Array<string>,
  publicKeyInPrincipal: string,
): Promise<Array<ICRC1Data>> {
  const priceList: TokenPrice[] = await new PriceService().getPriceFull()
  return Promise.all(
    canisters.map(async (canisterId) => {
      const actor = Agent.Actor.createActor<ICRC1Service>(icrc1IDL, {
        canisterId: canisterId,
        agent: new HttpAgent({ ...agentBaseConfig }),
      })
      const balance = await actor.icrc1_balance_of({
        subaccount: [],
        owner: Principal.fromText(publicKeyInPrincipal),
      })
      const metadata = await actor.icrc1_metadata()
      let name = ""
      let symbol = ""
      let logo: string | undefined = undefined
      let decimals = 0
      let fee = BigInt(0)

      for (let i = 0; i < metadata.length; i++) {
        const data = metadata[i]
        if (data[0] === "icrc1:name") {
          const val = data[1] as { Text: string }
          name = val.Text
        } else if (data[0] === "icrc1:symbol") {
          const val = data[1] as { Text: string }
          symbol = val.Text
        } else if (data[0] === "icrc1:decimals") {
          const val = data[1] as { Nat: bigint }
          decimals = Number(val.Nat)
        } else if (data[0] === "icrc1:fee") {
          const val = data[1] as { Nat: bigint }
          fee = val.Nat
        } else if (data[0] === "icrc1:logo") {
          const val = data[1] as { Text: string }
          logo = val.Text
        }
      }
      const priceInToken = priceList[symbol as any]
      const priceInUsd = priceInToken
        ? Number((1 / Number(priceInToken)).toFixed(2))
        : undefined

      const balanceNumber = priceInUsd
        ? (Number(balance) / Math.pow(10, Number(decimals))) * priceInUsd
        : undefined

      const isListedOnUSD = typeof priceInToken !== "undefined"

      let roundedBalanceNumber: number | undefined = undefined

      if (isListedOnUSD) {
        roundedBalanceNumber =
          balanceNumber === 0 ? 0 : Number(balanceNumber?.toFixed(2))
      }

      return {
        owner: Principal.fromText(publicKeyInPrincipal),
        balance,
        canisterId,
        decimals,
        fee,
        name,
        symbol,
        network: NETWORK,
        priceInUsd: roundedBalanceNumber,
        logo: logo,
      }
    }),
  )
}

export async function getICRC1IndexData(
  canisters: Array<ICRC1>,
  publicKeyInPrincipal: string,
  maxResults: bigint,
  blockNumberToStartFrom: bigint | undefined,
): Promise<Array<ICRC1IndexData>> {
  return Promise.all(
    canisters.map(async (canisterId) => {
      const indexActor = Agent.Actor.createActor<ICRCIndex>(icrc1IndexIDL, {
        canisterId: canisterId.index[0]!,
        agent: new HttpAgent({ ...agentBaseConfig }),
      })

      const args: GetAccountTransactionsArgs = {
        account: {
          subaccount: [],
          owner: Principal.fromText(publicKeyInPrincipal),
        },
        max_results: maxResults,
        start:
          blockNumberToStartFrom === undefined ? [] : [blockNumberToStartFrom],
      }
      const response = await indexActor.get_account_transactions(args)

      if (hasOwnProperty(response, "Err")) {
        console.warn(
          "Error " +
            response.Err +
            " getting account transactions for canister: " +
            canisterId,
        )
        return { transactions: [], oldestTransactionId: undefined }
      }

      if (hasOwnProperty(response, "Ok")) {
        const ledgerData = await getICRC1Data(
          [canisterId.ledger],
          publicKeyInPrincipal,
        )
        return {
          transactions: mapRawTrsToTransaction(
            response.Ok.transactions,
            publicKeyInPrincipal,
            ledgerData[0].symbol,
          ),
          oldestTransactionId:
            response.Ok.oldest_tx_id.length === 0
              ? undefined
              : response.Ok.oldest_tx_id[0],
        }
      }
      return { transactions: [], oldestTransactionId: undefined }
    }),
  )
}

function getLedgerIdFromIndexCanister(
  indexCanister: string,
): Promise<Principal> {
  const indexActor = Agent.Actor.createActor<ICRCIndex>(icrc1IndexIDL, {
    canisterId: indexCanister,
    agent: new HttpAgent({ ...agentBaseConfig }),
  })
  return indexActor.ledger_id()
}

function mapRawTrsToTransaction(
  rawTrss: Array<TransactionWithId>,
  ownerPrincipal: string,
  symbol: string,
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
    }
    return data
  })
}
