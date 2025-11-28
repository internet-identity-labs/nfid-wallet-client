import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"

import { exchangeRateService } from "@nfid/integration"

import { getBtcActivitiesRows } from "frontend/integration/bitcoin/services/btc-transaction-service"
import { ethTransactionService } from "frontend/integration/ethereum/eth/eth-transaction.service"

import { PAGINATION_ITEMS } from "../constants"
import {
  GetAllActivityParams,
  GetAllActivityResult,
  IActivityRow,
  IActivityRowGroup,
} from "../types"
import { getIcrc1ActivitiesRows } from "./icrc1-activity"
import { groupActivityRowsByDate } from "./row"
import { getSwapActivitiesRows } from "./swap-activity"
import {
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  BTC_NATIVE_ID,
  ETH_NATIVE_ID,
} from "@nfid/integration/token/constants"
import { fetchBtcAddress } from "frontend/util/fetch-btc-address"
import { fetchEthAddress } from "frontend/util/fetch-eth-address"
import { polygonTransactionService } from "frontend/integration/ethereum/polygon/pol-transaction.service"
import { arbitrumTransactionService } from "frontend/integration/ethereum/arbitrum/arbitrum-transaction.service"
import { baseTransactionService } from "frontend/integration/ethereum/base/base-transaction.service"
import { bnbTransactionService } from "frontend/integration/ethereum/bnb/bnb-transaction.service"
import { ethErc20TransactionService } from "frontend/integration/ethereum/eth/eth-erc20-transaction.service"
import { baseErc20TransactionService } from "frontend/integration/ethereum/base/base-erc20-transaction.service"
import { arbitrumErc20TransactionService } from "frontend/integration/ethereum/arbitrum/arbitrum-erc20-transaction.service"
import { bnbErc20TransactionService } from "frontend/integration/ethereum/bnb/bnb-erc20-transaction.service"
import { polygonErc20TransactionService } from "frontend/integration/ethereum/polygon/pol-erc20-transaction.service"

export const getAllActivity = async ({
  ...params
}: GetAllActivityParams): Promise<GetAllActivityResult> => {
  const { filteredContracts, offset = 0, limit = PAGINATION_ITEMS } = params

  let btcAddress = await fetchBtcAddress()
  let evmAddress = await fetchEthAddress()

  const [
    icrc1Activities,
    swapActivities,
    btcActivities,
    ethActivities,
    polygonActivities,
    arbitrumActivities,
    baseActivities,
    bnbActivities,
    erc20Activities,
  ] = await Promise.all([
    getIcrc1ActivitiesRows(filteredContracts, limit),
    getSwapActivitiesRows(filteredContracts),
    getBtcActivitiesRows(btcAddress),
    ethTransactionService.getActivitiesRows(evmAddress),
    polygonTransactionService.getActivitiesRows(evmAddress),
    arbitrumTransactionService.getActivitiesRows(evmAddress),
    baseTransactionService.getActivitiesRows(evmAddress),
    bnbTransactionService.getActivitiesRows(evmAddress),
    ethErc20TransactionService.getActivitiesRows(evmAddress),
    arbitrumErc20TransactionService.getActivitiesRows(evmAddress),
    baseErc20TransactionService.getActivitiesRows(evmAddress),
    bnbErc20TransactionService.getActivitiesRows(evmAddress),
    polygonErc20TransactionService.getActivitiesRows(evmAddress),
  ])

  const activitiesArray = [
    ...icrc1Activities,
    ...swapActivities,
    ...btcActivities,
    ...ethActivities,
    ...polygonActivities,
    ...arbitrumActivities,
    ...baseActivities,
    ...bnbActivities,
    ...erc20Activities,
  ]

  const groupedRowsByDate = groupActivityRowsByDate(
    activitiesArray.flat() as IActivityRow[],
  )

  const paginatedData = groupedRowsByDate.slice(offset, offset + limit)

  let priceResponse = await exchangeRateService.getAllIcpTokens()
  const paginatedDataUsdRate = await Promise.all(
    paginatedData.map(async (item) => {
      const asset = item.row.asset as ActivityAssetFT
      let usdRate
      try {
        let assetCanister = asset.canister
        if (assetCanister === BTC_NATIVE_ID) {
          assetCanister = CKBTC_CANISTER_ID
        }
        if (assetCanister === ETH_NATIVE_ID) {
          assetCanister = CKETH_LEDGER_CANISTER_ID
        }
        usdRate = priceResponse?.find(
          (token) => token.address === assetCanister,
        )
      } catch (e) {
        console.error("Exchange rate error: ", e)
      }

      return {
        ...item,
        row: {
          ...item.row,
          asset: {
            ...item.row.asset,
            rate: Number(usdRate?.price),
          },
        },
      }
    }),
  )

  const paginatedGroupedData = paginatedDataUsdRate.reduce(
    (
      acc: IActivityRowGroup[],
      current: { date: string; row: IActivityRow },
    ) => {
      const group = acc.find((group) => group.date === current.date)
      if (group) {
        group.rows.push(current.row)
      } else {
        acc.push({ date: current.date, rows: [current.row] })
      }
      return acc
    },
    [],
  )
  const isEnd = groupedRowsByDate.length > offset + limit

  return { transactions: paginatedGroupedData, isEnd }
}

export const nanoSecondsToDate = (nanoSeconds: bigint): Date => {
  const milliseconds = Number(nanoSeconds / BigInt(1000000))
  return new Date(milliseconds)
}
