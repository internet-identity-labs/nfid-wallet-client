import { delay } from "frontend/features/fungible-token/utils"
import { getBtcActivitiesRows } from "frontend/integration/bitcoin/services/btc-transaction-service"
import { arbitrumErc20TransactionService } from "frontend/integration/ethereum/arbitrum/arbitrum-erc20-transaction.service"
import { arbitrumTransactionService } from "frontend/integration/ethereum/arbitrum/arbitrum-transaction.service"
import { ethErc20TransactionService } from "frontend/integration/ethereum/eth/eth-erc20-transaction.service"
import { ethTransactionService } from "frontend/integration/ethereum/eth/eth-transaction.service"
import { polygonErc20TransactionService } from "frontend/integration/ethereum/polygon/pol-erc20-transaction.service"
import { polygonTransactionService } from "frontend/integration/ethereum/polygon/pol-transaction.service"
import { FT } from "frontend/integration/ft/ft"
import { fetchBtcAddress } from "frontend/util/fetch-btc-address"
import { fetchEthAddress } from "frontend/util/fetch-eth-address"

import { IActivityRow } from "../types"

import { getIcrc1ActivitiesRows } from "./icrc1-activity"
import { getSwapActivitiesRows } from "./swap-activity"

export const nanoSecondsToDate = (nanoSeconds: bigint): Date => {
  const milliseconds = Number(nanoSeconds / BigInt(1000000))
  return new Date(milliseconds)
}

export const getAllActivity = async (
  limit: number,
  activeTokens: FT[],
): Promise<IActivityRow[]> => {
  const btcAddress = await fetchBtcAddress()
  const evmAddress = await fetchEthAddress()

  const [icrc1Activities, swapActivities, btcActivities, evmActivities] =
    await Promise.all([
      getIcrc1ActivitiesRows(limit, activeTokens),
      getSwapActivitiesRows(activeTokens),
      getBtcActivitiesRows(btcAddress),
      fetchEvmActivitiesSequentially(evmAddress),
    ])

  const [
    ethActivities,
    ethErc20Activities,
    arbitrumErc20Activities,
    polygonErc20Activities,
    arbitrumActivities,
    polygonActivities,
  ] = evmActivities

  const activitiesArray = [
    ...icrc1Activities,
    ...swapActivities,
    ...btcActivities,
    ...ethActivities,
    ...ethErc20Activities,
    ...arbitrumErc20Activities,
    ...polygonErc20Activities,
    ...arbitrumActivities,
    ...polygonActivities,
  ]

  return activitiesArray
}

const fetchEvmActivitiesSequentially = async (
  evmAddress: string,
): Promise<
  [
    Awaited<ReturnType<typeof ethTransactionService.getActivitiesRows>>,
    Awaited<ReturnType<typeof ethErc20TransactionService.getActivitiesRows>>,
    Awaited<
      ReturnType<typeof arbitrumErc20TransactionService.getActivitiesRows>
    >,
    Awaited<ReturnType<typeof arbitrumTransactionService.getActivitiesRows>>,
    Awaited<
      ReturnType<typeof polygonErc20TransactionService.getActivitiesRows>
    >,
    Awaited<ReturnType<typeof polygonTransactionService.getActivitiesRows>>,
  ]
> => {
  const ethActivities =
    await ethTransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const ethErc20Activities =
    await ethErc20TransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const arbitrumErc20Activities =
    await arbitrumErc20TransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const arbitrumActivities =
    await arbitrumTransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const polygonActivities =
    await polygonTransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const polygonErc20Activities =
    await polygonErc20TransactionService.getActivitiesRows(evmAddress)

  return [
    ethActivities,
    ethErc20Activities,
    arbitrumErc20Activities,
    polygonErc20Activities,
    arbitrumActivities,
    polygonActivities,
  ]
}
