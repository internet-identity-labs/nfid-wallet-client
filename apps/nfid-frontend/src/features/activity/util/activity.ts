import axios from "axios"
import { PriceService } from "packages/integration/src/lib/asset/asset-util"
import {
  Activity,
  ActivityAssetFT,
} from "packages/integration/src/lib/asset/types"
import { wrappedTokenMap } from "packages/integration/src/lib/asset/wrapped-token-map"

import {
  ICP_DECIMALS,
  MAX_DECIMAL_LENGTH,
} from "@nfid/integration/token/constants"
import { toPresentation } from "@nfid/integration/token/utils"

import { Transaction } from "frontend/integration/rosetta/rosetta_interface"

import { IActivityAction } from "../types"

export const mapToActivity = async (
  tx: Transaction,
  type: IActivityAction,
): Promise<Activity> => {
  return {
    id: tx.transaction.transactionIdentifier.hash,
    date: new Date(Math.floor(tx.transaction.metadata.timestamp / 1000000)),
    from: tx.transaction.operations[0].account.address,
    to: tx.transaction.operations[1].account.address,
    transactionHash: tx.transaction.transactionIdentifier.hash,
    action: type,
    asset: {
      type: "ft",
      currency: "ICP",
      decimals: ICP_DECIMALS,
      amount: toPresentation(
        BigInt(
          Math.abs(
            Math.round(
              +tx.transaction.operations[0].amount.value *
                10 ** MAX_DECIMAL_LENGTH,
            ),
          ),
        ),
      )
        .toFixed(MAX_DECIMAL_LENGTH)
        .replace(/(\.\d*?[1-9])0+|\.0*$/, "$1"),
    },
  }
}

export const icFungibleTxsToActivity = async (
  txs: Transaction[],
  accounts: string[],
): Promise<Activity[]> => {
  const mappedTxs = await Promise.all(
    txs.map(async (tx) => {
      if (
        accounts.includes(tx.transaction.operations[0].account.address) &&
        accounts.includes(tx.transaction.operations[1].account.address)
      ) {
        return [
          await mapToActivity(tx, IActivityAction.RECEIVED),
          await mapToActivity(tx, IActivityAction.SENT),
        ]
      }

      return [
        await mapToActivity(
          tx,
          accounts.includes(tx.transaction.operations[1].account.address)
            ? IActivityAction.RECEIVED
            : IActivityAction.SENT,
        ),
      ]
    }),
  )

  return mappedTxs.flat()
}

export const nanoSecondsToDate = (nanoSeconds: bigint): Date => {
  const milliseconds = Number(nanoSeconds / BigInt(1000000))
  return new Date(milliseconds)
}

export const getHistoricalExchangeRate = async (
  pair = "ICP-USD",
  date: Date,
): Promise<string | undefined> => {
  const end = new Date(date.getTime() + 1 * 60000)
  const currentDate = new Date()
  if (end > currentDate) {
    const awsRate = await new PriceService().getPrice([pair.split("-")[0]])
    return awsRate[0].price
  }

  const url = `https://api.pro.coinbase.com/products/${pair}/candles`

  try {
    const response = await axios.get(url, {
      params: {
        start: date.toISOString(),
        end: end.toISOString(),
        granularity: 60,
      },
    })

    return response.data[0][1]
  } catch (error) {
    console.debug(error)
    return undefined
  }
}

export const getExchangeRateForActivity = async (
  asset: ActivityAssetFT,
  date: Date,
): Promise<string | undefined> => {
  const tokensToGetPrice: { [key: string]: string } = {
    ...wrappedTokenMap,
    ICP: "ICP",
  }
  const symbol = tokensToGetPrice[asset.currency]

  if (!symbol) return undefined

  if (symbol === "USDC") {
    return "1"
  } else {
    return await getHistoricalExchangeRate(`${symbol}-USD`, date)
  }
}
