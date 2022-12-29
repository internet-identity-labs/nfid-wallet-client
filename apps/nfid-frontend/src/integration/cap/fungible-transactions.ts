import { Principal } from "@dfinity/principal"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"
import { principalToAddress } from "ictool"

import { getCapRootTransactions } from "frontend/integration/cap/cap_util"

import { Transaction } from "../rosetta/rosetta_interface"
import { Operation } from "../rosetta/rosetta_interface"

export interface Token {
  symbol: string
  canisterId: string
  name: string
  decimals: number
  standard: string
}

export const TOKENS = {
  XTCToken: {
    symbol: "XTC",
    canisterId: "aanaa-xaaaa-aaaah-aaeiq-cai",
    name: "Cycles",
    decimals: 12,
    standard: "xtc",
  } as Token,
  WTC: {
    symbol: "WTC",
    canisterId: "5ymop-yyaaa-aaaah-qaa4q-cai",
    name: "Wrapped Cycles",
    decimals: 12,
    standard: "dip20",
  } as Token,
  WICP: {
    symbol: "WICP",
    canisterId: "utozz-siaaa-aaaam-qaaxq-cai",
    name: "Wrapped ICP",
    decimals: 8,
    standard: "wicp",
  } as Token,
  BTKN: {
    symbol: "BTKN",
    canisterId: "cfoim-fqaaa-aaaai-qbcmq-cai",
    name: "Beta Token",
    decimals: 8,
    standard: "dip20",
  } as Token,
  DUST: {
    symbol: "DUST",
    canisterId: "4mvfv-piaaa-aaaak-aacia-cai",
    name: "Dust Token",
    decimals: 8,
    standard: "dip20",
  } as Token,
}

export async function getTokenTransactions(
  token: Token,
  user: Principal,
  from: number,
  to: number,
): Promise<{ txHistory: Transaction[]; isLastPage: boolean }> {
  const txs = await getUserTransactions(token.canisterId, user, from, to)
  return {
    txHistory: txs.txHistory.map((x) => getTransaction(x, token)),
    isLastPage: txs.isLastPage,
  }
}

export async function getTokenTransactionHistory(
  canisterId: string,
  page: number,
): Promise<TransactionPrettified[]> {
  return await getCapRootTransactions(canisterId, page)
}

/**
 * Function to retrieve transaction history of the principal. Returns array
 * of transactions and isLastPage boolean
 * @param canisterId
 * @param user
 * @param from
 * @param to
 */
export async function getUserTransactions(
  canisterId: string,
  user: Principal,
  from: number,
  to: number,
): Promise<{ txHistory: TransactionPrettified[]; isLastPage: boolean }> {
  let address = principalToAddress(user as any)
  let transactionHistory = await Promise.all(
    Array.from(Array(to).keys())
      .slice(from, to)
      .map(async (page) => {
        let allHistory = await getCapRootTransactions(canisterId, page)
        let txHistory = allHistory.filter(
          (l) =>
            l.details.from.toString() === address ||
            l.details.to.toString() === address,
        )
        return { txHistory, isLastPage: allHistory.length === 0 }
      }),
  )
  return transactionHistory.reduce((x, y) => {
    return {
      txHistory: x.txHistory.concat(y.txHistory),
      isLastPage: x.isLastPage || y.isLastPage,
    }
  })
}

/**
 * Function to retrieve transaction history of the token. Returns array
 * of transactions and isLastPage boolean
 * @param canisterId
 * @param tokenId
 * @param from
 * @param to
 */
export async function getTokenTxHistoryOfTokenIndex(
  canisterId: string,
  tokenId: string,
  from: number,
  to: number,
): Promise<{ txHistory: TransactionPrettified[]; isLastPage: boolean }> {
  let transactionHistory = await Promise.all(
    Array.from(Array(to).keys())
      .slice(from, to)
      .map(async (page) => {
        let allHistory = await getCapRootTransactions(canisterId, page)
        let txHistory = allHistory.filter((l) => l.details.token === tokenId)
        return { txHistory, isLastPage: allHistory.length === 0 }
      }),
  )
  return transactionHistory.reduce((x, y) => {
    return {
      txHistory: x.txHistory.concat(y.txHistory),
      isLastPage: x.isLastPage || y.isLastPage,
    }
  })
}

function getOperation(
  type: string,
  status: string,
  address: string,
  amount: string,
  symbol: string,
  decimals: number,
): Operation {
  return {
    operationIdentifier: {
      index: 0,
    },
    type: type,
    status: status,
    account: {
      address: address,
    },
    amount: {
      value: amount,
      currency: {
        symbol: symbol,
        decimals: decimals,
      },
    },
  }
}

function lebDecode(pipe: any): bigint {
  let weight = BigInt(1)
  let value = BigInt(0)
  let byte
  do {
    if (pipe.length < 1) {
      throw new Error("unexpected end of buffer")
    }
    byte = pipe[0]
    pipe = pipe.slice(1)
    value += BigInt(byte & 0x7f).valueOf() * weight
    weight *= BigInt(128)
  } while (byte >= 0x80)
  return value
}

function getTransaction(tx: TransactionPrettified, token: Token): Transaction {
  const amount = lebDecode(tx.details.amount).toString()
  return {
    blockIdentifier: {
      index: 0,
      hash: "",
    },
    transaction: {
      transactionIdentifier: {
        hash: "",
      },
      operations: [
        getOperation(
          tx.operation,
          tx.details.status.toString(),
          tx.details.from.toString(),
          amount,
          token.symbol,
          token.decimals,
        ),
        getOperation(
          tx.operation,
          tx.details.status.toString(),
          tx.details.to.toString(),
          amount,
          token.symbol,
          token.decimals,
        ),
        getOperation(
          tx.operation,
          tx.details.status.toString(),
          tx.details.from.toString(),
          lebDecode(tx.details.fee).toString(),
          token.symbol,
          token.decimals,
        ),
      ],
      metadata: {
        blockHeight: 0,
        memo: 0,
        timestamp: Number(tx.time),
      },
    },
  }
}
